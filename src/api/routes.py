"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
import requests

api = Blueprint('api', __name__)

API_KEY = "6ceb73137ddab02e7a70a8a1a1bd25bb"
BASE_URL = "https://v3.football.api-sports.io"

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
@api.route('/fixtures', methods=['GET'])
def get_fixtures():

    try:

        # 📥 Obtener parámetros desde React
        league = request.args.get("league")
        season = request.args.get("season")

        # 🌐 URL API-FOOTBALL
        url = f"{BASE_URL}/fixtures"

        # 🔑 Headers
        headers = {
            "x-apisports-key": API_KEY
        }

        # 📦 Parámetros
        params = {
            "league": league,
            "season": season
        }

        # 🚀 Petición a API-FOOTBALL
        response = requests.get(
            url,
            headers=headers,
            params=params
        )

        data = response.json()

        print("🔥 API RESPONSE:", data)

        return jsonify(data), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500
