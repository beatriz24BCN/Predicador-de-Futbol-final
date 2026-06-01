
"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""

import time
from datetime import datetime, timezone, timedelta
from flask import Flask, request, jsonify, url_for, Blueprint
# NUEVO: Asegúrate de importar Prediction además de User
from api.models import db, User, Prediction 
from api.utils import generate_sitemap, APIException
from flask_cors import CORS

api = Blueprint('api', __name__)

FOOTBALL_API_BASE_URL = "https://api.football-data.org/v4/competitions"
API_TOKEN = "7fc4c822095b45d590fa0cd500eb3d5f"  # 🔑 REEMPLAZA CON TU TOKEN REAL

cache_partidos = []
ultima_actualizacion = None
CACHE_DURACION_SEGUNDOS = 600

LIGAS_PERMITIDAS = ["PD", "PL", "BL1", "SA", "WC"]

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200
@api.route('/fixtures', methods=['GET'])
def get_fixtures():
    global cache_partidos, ultima_actualizacion
    ahora = datetime.now(timezone.utc)

    if cache_partidos and ultima_actualizacion and (ahora - ultima_actualizacion).total_seconds() < CACHE_DURACION_SEGUNDOS:
        return jsonify(cache_partidos), 200

    hoy_utc = datetime.now(timezone.utc)
    en_una_semana_utc = hoy_utc + timedelta(days=7)

    params = {
        "dateFrom": hoy_utc.strftime('%Y-%m-%d'),
        "dateTo": en_una_semana_utc.strftime('%Y-%m-%d')
    }
    headers = {"X-Auth-Token": API_TOKEN}
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
                    hora = fecha_partido_str[11:16] if fecha_partido_str and len(
                        fecha_partido_str) > 16 else "00:00"

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
                            "home": {
                                "name": item.get('homeTeam', {}).get('name', 'Local'),
                                # 🛡️ Escudo/Bandera Local
                                "crest": item.get('homeTeam', {}).get('crest')
                            },
                            "away": {
                                "name": item.get('awayTeam', {}).get('name', 'Visitante'),
                                # 🛡️ Escudo/Bandera Visitante
                                "crest": item.get('awayTeam', {}).get('crest')
                            }
                        }
                    }
                    nuevos_partidos.append(partido_formateado)

            time.sleep(0.5)
        except Exception as e:
            print(f"❌ Error procesando liga {codigo}: {e}")
            continue

    if nuevos_partidos:
        nuevos_partidos.sort(key=lambda x: (
            x.get('fecha') or '', x.get('hora') or '00:00'))
        cache_partidos = nuevos_partidos
        ultima_actualizacion = ahora

    return jsonify(cache_partidos), 200


# =========================================================
# NUEVO ENDPOINT: RECIBIR Y GUARDAR PREDICCIONES
# =========================================================
@api.route('/predictions', methods=['POST'])
def save_prediction():
    body = request.get_json()

    if not body or 'predictions' not in body:
        return jsonify({"msg": "Formato inválido. Se esperaba un objeto con 'predictions'"}), 400
        
    predictions_data = body['predictions']
    
    user_id = 1 

    saved_predictions = []

    for pred in predictions_data:
        fixture_id = pred.get("fixture_id")
        home_goals = pred.get("home_goals")
        away_goals = pred.get("away_goals")

        if fixture_id is None or home_goals is None or away_goals is None:
            continue # Saltamos las predicciones que estén incompletas
        
        # 2. Buscamos si el usuario ya había hecho una predicción para este mismo partido
        existing_prediction = Prediction.query.filter_by(user_id=user_id, fixture_id=fixture_id).first()

        if existing_prediction:
            # Si ya existía, la sobrescribimos (Actualiza su predicción)
            existing_prediction.home_goals = home_goals
            existing_prediction.away_goals = away_goals
            saved_predictions.append(existing_prediction)
        else:
            # 3. Si no existía, creamos un registro completamente nuevo
            new_prediction = Prediction(
                user_id=user_id,
                fixture_id=fixture_id,
                home_goals=home_goals,
                away_goals=away_goals
            )
            db.session.add(new_prediction)
            saved_predictions.append(new_prediction)

    # 4. Guardamos los cambios físicamente en la Base de Datos
    db.session.commit()

    # 5. Le respondemos a React con los datos guardados
    result = [p.serialize() for p in saved_predictions]
    return jsonify({"msg": "Predicciones guardadas con éxito", "predictions": result}), 201
