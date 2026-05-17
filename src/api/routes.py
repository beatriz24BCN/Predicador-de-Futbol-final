import time
from datetime import datetime  # <-- Esencial para automatizar la fecha de hoy
import requests
from flask import Blueprint, jsonify
from api.models import db  

api = Blueprint('api', __name__)

cache_datos = []
ultima_actualizacion = 0

def descargar_partidos_reales():
    global cache_datos, ultima_actualizacion
    ahora = time.time()
    
    # Caché de seguridad de 15 segundos
    if cache_datos and (ahora - ultima_actualizacion < 15):
        return cache_datos

    # GENERACIÓN DINÁMICA DE FECHA: Sofascore exige el formato AAAA-MM-DD del día en curso
    fecha_hoy = datetime.utcnow().strftime('%Y-%m-%d')
    
    URL_LIVE = "https://api.sofascore.com/api/v1/sport/football/events/live"
    URL_TODAY = f"https://api.sofascore.com/api/v1/sport/football/scheduled-events/{fecha_hoy}"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Origin": "https://www.sofascore.com",
        "Referer": "https://www.sofascore.com/",
        "Accept": "*/*",
        "Accept-Language": "es-ES,es;q=0.9"
    }

    try:
        # Intentamos primero traer los partidos que se juegan estrictamente EN VIVO
        print(f"Buscando partidos en directo en: {URL_LIVE}")
        response = requests.get(URL_LIVE, headers=headers, timeout=8)
        data = response.json()
        eventos = data.get("events", [])
        
        # Si no hay partidos en vivo en este instante, cargamos la agenda completa del día
        if not eventos:
            print(f"Cero partidos en directo. Trayendo agenda del día desde: {URL_TODAY}")
            response = requests.get(URL_TODAY, headers=headers, timeout=8)
            data = response.json()
            eventos = data.get("events", [])

        partidos_limpios = []

        for evento in eventos:
            status_type = evento.get("status", {}).get("type", "")
            estado_kickhub = "SCHEDULED"
            tiempo_str = "Próx"

            if status_type == "inprogress":
                estado_kickhub = "LIVE"
                tiempo_str = evento.get("statusDescription", "En juego")
            elif status_type == "finished":
                estado_kickhub = "FINISHED"
                tiempo_str = "Fin"

            score_home = evento.get("homeScore", {}).get("current", 0)
            score_away = evento.get("awayScore", {}).get("current", 0)

            partidos_limpios.append({
                "id": str(evento.get("id")),
                "home": evento.get("homeTeam", {}).get("name", "Local"),
                "away": evento.get("awayTeam", {}).get("name", "Visitante"),
                "score": f"{score_home}-{score_away}" if estado_kickhub != "SCHEDULED" else "VS",
                "time": tiempo_str,
                "status": estado_kickhub,
                "cards": {
                    "home_red": evento.get("homeRedCards", 0),
                    "away_red": evento.get("awayRedCards", 0)
                }
            })

        if partidos_limpios:
            cache_datos = list(partidos_limpios)
            ultima_actualizacion = ahora
            return cache_datos

    except Exception as e:
        print(f"Error en el puente de datos satelital: {e}")
    
    return cache_datos if cache_datos else []

@api.route('/fixtures', methods=['GET'])
def get_fixtures():
    partidos_satelitales = descargar_partidos_reales()
    return jsonify(partidos_satelitales), 200
