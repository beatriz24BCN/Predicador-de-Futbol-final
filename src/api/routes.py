from datetime import datetime, timedelta
import time
import threading
import requests
from flask import Blueprint, jsonify
from flask_cors import CORS

api = Blueprint('api', __name__)
CORS(api)

API_TOKEN = "7fc4c822095b45d590fa0cd500eb3d5f"
API_URL = "https://api.football-data.org/v4/matches"
HEADERS = {'X-Auth-Token': API_TOKEN}
CACHE_PARTIDOS = []


def actualizar_cache_en_segundo_plano():
    global CACHE_PARTIDOS
    print("Iniciando sincronizador dinámico con soporte de minutos...")

    while True:
        try:
            hoy = datetime.now()
            ayer_str = (hoy - timedelta(days=1)).strftime('%Y-%m-%d')
            futuro_str = (hoy + timedelta(days=5)).strftime('%Y-%m-%d')

            url_con_rango = f"{API_URL}?dateFrom={ayer_str}&dateTo={futuro_str}"
            response = requests.get(url_con_rango, headers=HEADERS, timeout=10)

            if response.status_code == 200:
                datos_api = response.json()
                partidos_formateados = []

                for item in datos_api.get('matches', []):
                    # Extraemos de forma segura el minuto actual del partido (si está en vivo)
                    minuto_juego = item.get('score', {}).get(
                        'regularTime', {}).get('minute')

                    partido_formateado = {
                        "id": item.get('id'),
                        "liga": item.get('competition', {}).get('name', 'Competición'),
                        "fecha": item.get('utcDate', '')[:10],
                        "hora": item.get('utcDate', '')[11:16],
                        "estado": item.get('status'),
                        "minuto": minuto_juego,  # Enlazado para todas las ligas
                        "goals": {
                            "home": item.get('score', {}).get('fullTime', {}).get('home', 0),
                            "away": item.get('score', {}).get('fullTime', {}).get('away', 0)
                        },
                        "teams": {
                            "home": {"name": item.get('homeTeam', {}).get('name', 'Local')},
                            "away": {"name": item.get('awayTeam', {}).get('name', 'Visitante')}
                        }
                    }
                    partidos_formateados.append(partido_formateado)

                CACHE_PARTIDOS = partidos_formateados
                print(
                    f"Caché listo con minutos en vivo: {len(CACHE_PARTIDOS)} partidos globales en memoria.")

            elif response.status_code == 429:
                print(
                    "Advertencia: Límite de peticiones de la API alcanzado. Esperando ciclo...")
            else:
                print(f"Error de API externa: Código {response.status_code}")

        except Exception as e:
            print(f"Error crítico en la hebra de actualización: {e}")

        time.sleep(45)


hilo_sincronizador = threading.Thread(
    target=actualizar_cache_en_segundo_plano, daemon=True)
hilo_sincronizador.start()


@api.route('/fixtures', methods=['GET'])
def get_fixtures():
    return jsonify(CACHE_PARTIDOS), 200
