from flask import Flask, jsonify, Blueprint
import requests
import time
from datetime import datetime, timezone, timedelta

api = Blueprint('api', __name__)

FOOTBALL_API_BASE_URL = "https://api.football-data.org/v4/competitions"
API_TOKEN = "7fc4c822095b45d590fa0cd500eb3d5f"  # 🔑 REEMPLAZA CON TU TOKEN REAL

# 📋 Configuración de la Caché en Memoria
cache_partidos = []
ultima_actualizacion = None
CACHE_DURACION_SEGUNDOS = 600  # ⏳ Los datos se guardan 10 minutos en el servidor

LIGAS_PERMITIDAS = ["PD", "PL", "BL1", "SA", "WC"]

@api.route('/fixtures', methods=['GET'])
def get_fixtures():
    global cache_partidos, ultima_actualizacion
    
    ahora = datetime.now(timezone.utc)
    
    # 🧠 SI TENEMOS DATOS EN CACHÉ Y NO HAN PASADO 10 MINUTOS, LOS DEVOLVEMOS DE INMEDIATO
    if cache_partidos and ultima_actualizacion and (ahora - ultima_actualizacion).total_seconds() < CACHE_DURACION_SEGUNDOS:
        print("⚡ Sirviendo partidos desde la caché interna (Evitando bloqueo API)...")
        return jsonify(cache_partidos), 200

    print("🔄 La caché ha expirado o está vacía. Solicitando nuevos datos a la API externa...")
    
    hoy_utc = datetime.now(timezone.utc)
    en_una_semana_utc = hoy_utc + timedelta(days=7)
    
    params = {
        "dateFrom": hoy_utc.strftime('%Y-%m-%d'),
        "dateTo": en_una_semana_utc.strftime('%Y-%m-%d')
    }
    
    headers = {
        "X-Auth-Token": API_TOKEN
    }
    
    nuevos_partidos = []
    
    for codigo in LIGAS_PERMITIDAS:
        try:
            url_liga = f"{FOOTBALL_API_BASE_URL}/{codigo}/matches"
            response = requests.get(url_liga, headers=headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                for item in data.get('matches', []):
                    status = item.get('status')
                    fecha_partido_str = item.get('utcDate')

                    fecha = fecha_partido_str[:10] if fecha_partido_str else ""
                    hora = fecha_partido_str[11:16] if fecha_partido_str and len(fecha_partido_str) > 16 else "00:00"

                    partido_formateado = {
                        "id": item.get('id'),
                        "liga": data.get('competition', {}).get('name', 'Competición'),
                        "codigo_liga": codigo,
                        "fecha": fecha,
                        "hora": hora,
                        "estado": status,
                        "minuto": "",
                        "goals": {
                            "home": item.get('score', {}).get('fullTime', {}).get('home', 0) if item.get('score', {}).get('fullTime', {}).get('home') is not None else 0,
                            "away": item.get('score', {}).get('fullTime', {}).get('away', 0) if item.get('score', {}).get('fullTime', {}).get('away') is not None else 0
                        },
                        "teams": {
                            "home": {"name": item.get('homeTeam', {}).get('name', 'Local')},
                            "away": {"name": item.get('awayTeam', {}).get('name', 'Visitante')}
                        }
                    }
                    nuevos_partidos.append(partido_formateado)
            elif response.status_code == 429:
                print(f"⚠️ ¡Límite excedido en liga {codigo}! Usaremos datos antiguos si existen.")
            
            # Pausa de seguridad obligatoria entre consultas por liga
            time.sleep(0.5)
            
        except Exception as e:
            print(f"❌ Error procesando liga {codigo}: {e}")
            continue

    # 🛡️ Si logramos traer partidos, actualizamos la caché global
    if nuevos_partidos:
        nuevos_partidos.sort(key=lambda x: (x.get('fecha') or '', x.get('hora') or '00:00'))
        cache_partidos = nuevos_partidos
        ultima_actualizacion = ahora
        print(f"✅ Caché actualizada con éxito. Total partidos cargados: {len(cache_partidos)}")
    elif cache_partidos:
        print("⚠️ No se pudieron obtener nuevos datos, manteniendo caché anterior por seguridad.")

    return jsonify(cache_partidos), 200