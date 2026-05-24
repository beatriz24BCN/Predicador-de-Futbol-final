"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
# NUEVO: Asegúrate de importar Prediction además de User
from api.models import db, User, Prediction 
from api.utils import generate_sitemap, APIException
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200


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