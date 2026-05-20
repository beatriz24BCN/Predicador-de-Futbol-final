"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
import requests  # 🔥 IMPORTANTE

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

# 🔑 API KEY
API_KEY = "2d0cf0579d3c2dfc9e3fe359dcebf297"


# -------------------------
# TEST
# -------------------------
@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello desde Flask"
    }

    return jsonify(response_body), 200


# -------------------------
# ⚽ PARTIDOS
# -------------------------
@api.route('/partidos', methods=['GET'])
def get_partidos():
    try:
        ligas = [140, 39, 135, 78, 61]  # TOP ligas
        todos = []

        for liga in ligas:
            url = f"https://v3.football.api-sports.io/fixtures?league={liga}&season=2024"

            headers = {
                "x-apisports-key": API_KEY
            }

            res = requests.get(url, headers=headers)
            data = res.json()

            if "response" in data:
                todos.extend(data["response"])

        return jsonify(todos), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
