import time
from datetime import datetime
from flask import Blueprint, jsonify
from flask_cors import CORS

api = Blueprint('api', __name__)
CORS(api)  # Desbloqueo de seguridad interno

@api.route('/fixtures', methods=['GET'])
def get_fixtures():
    # DATOS SEMILLA (Mock Data): Controlados al 100% por ti con la estructura de tu grupo
    partidos_estables = [
        {
            "fixture": {
                "id": 201,
                "date": datetime.utcnow().isoformat(),
                "status": {"short": "1H", "elapsed": 42}  # EN VIVO
            },
            "teams": {
                "home": {"name": "Real Madrid"},
                "away": {"name": "Barcelona"}
            },
            "goals": {"home": 2, "away": 1}
        },
        {
            "fixture": {
                "id": 202,
                "date": datetime.utcnow().isoformat(),
                "status": {"short": "HT", "elapsed": 45}  # EN VIVO (Descanso)
            },
            "teams": {
                "home": {"name": "Liverpool"},
                "away": {"name": "Real Sociedad"}
            },
            "goals": {"home": 1, "away": 1}
        },
        {
            "fixture": {
                "id": 203,
                "date": datetime.utcnow().isoformat(),
                "status": {"short": "FT", "elapsed": 90}  # FINALIZADO
            },
            "teams": {
                "home": {"name": "Manchester City"},
                "away": {"name": "Arsenal"}
            },
            "goals": {"home": 0, "away": 3}
        },
        {
            "fixture": {
                "id": 204,
                "date": datetime.utcnow().isoformat(),
                "status": {"short": "NS", "elapsed": 0}  # PROGRAMADO
            },
            "teams": {
                "home": {"name": "Atlético de Madrid"},
                "away": {"name": "Bayern Munich"}
            },
            "goals": {"home": None, "away": None}
        }
    ]
    
    return jsonify(partidos_estables), 200
