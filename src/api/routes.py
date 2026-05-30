"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint

# NUEVO: Asegúrate de importar Prediction además de User
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Prediction
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from sqlalchemy import func
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
            continue  # Saltamos las predicciones que estén incompletas

        # 2. Buscamos si el usuario ya había hecho una predicción para este mismo partido
        existing_prediction = Prediction.query.filter_by(
            user_id=user_id, fixture_id=fixture_id).first()

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

# =========================================================
# NUEVO ENDPOINT: OBTENER EL RANKING GLOBAL
# =========================================================


@api.route('/ranking', methods=['GET'])
def get_ranking():
    try:
        # Agregamos User.email al group_by para evitar que PostgreSQL se queje
        results = db.session.query(
            User.id,
            User.email,
            func.sum(Prediction.points_earned).label('total_points')
        ).outerjoin(Prediction, User.id == Prediction.user_id).group_by(User.id, User.email).all()

        ranking = []
        for r in results:
            username = r.email.split('@')[0]
            # Si un usuario se registra, obtiene 30 puntos por defecto
            points = (int(r.total_points) if r.total_points is not None else 0) + 30

            ranking.append({
                "user_id": r.id,
                "username": username,
                "points": points
            })

        # Ordenamos de mayor a menor
        ranking.sort(key=lambda x: x['points'], reverse=True)

        # Asignamos la posición
        for index, user in enumerate(ranking):
            user['rank'] = index + 1

        return jsonify(ranking), 200

    except Exception as e:
        # Si algo explota, le decimos a Flask que cancele la transacción corrupta y nos muestre el error exacto
        db.session.rollback()
        print("🚨 ERROR EN RANKING:", str(e))
        return jsonify({"msg": "Error interno del servidor", "error": str(e)}), 500


# =========================================================
# NUEVO ENDPOINT: EVALUADOR (CALCULAR PUNTOS)
# =========================================================

@api.route('/evaluate', methods=['POST'])
def evaluate_predictions():
    # 1. Buscamos todas las predicciones que el bot aún no ha calificado
    pending_predictions = Prediction.query.filter_by(points_earned=None).all()

    if not pending_predictions:
        return jsonify({"msg": "Todo al día. No hay predicciones pendientes por evaluar."}), 200

    # 2. Agrupamos los partidos para no hacerle la misma pregunta a la API 100 veces
    unique_fixtures = set([p.fixture_id for p in pending_predictions])

    API_KEY = os.getenv("VITE_API_KEY", "8a0aed89a11642cf9abd50eb19825215")
    headers = {"X-Auth-Token": API_KEY}

    evaluated_count = 0

    for fixture_id in unique_fixtures:
        url = f"https://api.football-data.org/v4/matches/{fixture_id}"

        try:
            # Le preguntamos a la API de Football-Data el resultado real
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                continue

            match_data = response.json()

            # Solo calificamos si el partido ya terminó en la vida real
            if match_data.get('status') not in ['FINISHED', 'AWARDED']:
                continue

            real_home = match_data['score']['fullTime']['home']
            real_away = match_data['score']['fullTime']['away']

            if real_home is None or real_away is None:
                continue

            # Determinamos la tendencia real (1=Local, -1=Visitante, 0=Empate)
            if real_home > real_away:
                real_winner = 1
            elif real_home < real_away:
                real_winner = -1
            else:
                real_winner = 0

            # 3. Traemos todas las predicciones de los usuarios para este partido en específico
            fixture_predictions = [
                p for p in pending_predictions if p.fixture_id == fixture_id]

            for pred in fixture_predictions:
                # 🥇 ACIERTO EXACTO (Marcador idéntico) -> 3 puntos
                if pred.home_goals == real_home and pred.away_goals == real_away:
                    pred.points_earned = 3
                else:
                    # Determinamos la tendencia que el usuario predijo
                    if pred.home_goals > pred.away_goals:
                        pred_winner = 1
                    elif pred.home_goals < pred.away_goals:
                        pred_winner = -1
                    else:
                        pred_winner = 0

                    # 🥈 ACIERTO PARCIAL (Atinó quién ganaba o si empataban) -> 1 punto
                    if pred_winner == real_winner:
                        pred.points_earned = 1
                    # 💔 FALLO TOTAL -> 0 puntos
                    else:
                        pred.points_earned = 0

                evaluated_count += 1

        except Exception as e:
            print(f"Error evaluando partido {fixture_id}: {str(e)}")
            continue

    # 4. Guardamos los puntos asignados en la base de datos física
    db.session.commit()

    return jsonify({"msg": f"Se evaluaron y calificaron {evaluated_count} predicciones nuevas."}), 200
