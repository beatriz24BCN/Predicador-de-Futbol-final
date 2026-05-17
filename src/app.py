import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

SOFASCORE_URL = "https://api.sofascore.com/api/v1/sport/football/events/live"

cache_datos = []
ultima_actualizacion = 0

def descargar_partidos_reales():
    global cache_datos, ultima_actualizacion
    ahora = time.time()
    
    if cache_datos and (ahora - ultima_actualizacion < 15):
        return cache_datos

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Origin": "https://www.sofascore.com",
        "Referer": "https://www.sofascore.com/"
    }

    try:
        response = requests.get(SOFASCORE_URL, headers=headers, timeout=10)
        if response.status_code != 200:
            return cache_datos if cache_datos else []

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

        cache_datos = list(partidos_limpios)
        ultima_actualizacion = ahora
        return cache_datos

    except Exception as e:
        print(f"Error en backend: {e}")
        return cache_datos if cache_datos else []

@app.route("/api/fixtures", methods=['GET'])
def fixtures():
    partidos_satelitales = descargar_partidos_reales()
    return jsonify(partidos_satelitales), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3001, debug=True)
