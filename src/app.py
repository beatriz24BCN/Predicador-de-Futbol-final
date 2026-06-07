"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands

import os
from flask import Flask, request, jsonify, send_from_directory
from flask_migrate import Migrate
from flask_cors import CORS

from api.models import db
from api.routes import api
from api.utils import generate_sitemap, APIException
from api.admin import setup_admin
from api.commands import setup_commands

import requests

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../dist/')

app = Flask(__name__)
app.url_map.strict_slashes = False

db_url = os.getenv("DATABASE_URL")
if db_url:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///app.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
Migrate(app, db)

setup_admin(app)
setup_commands(app)

CORS(app)

app.register_blueprint(api, url_prefix='/api')

API_TOKEN = "7fc4c822095b45d590fa0cd500eb3d5f"
HEADERS = {"X-Auth-Token": API_TOKEN}
MAPEO_LIGAS = {"PD": "PD", "PL": "PL", "SA": "SA", "BL": "BL1", "WC": "WC"}

@app.route('/api/fixtures/historico', methods=['GET'])
def get_historico():
    liga = request.args.get('liga', 'PD')
    temporada = request.args.get('temporada', '2025')

    if liga == "WC":
        return jsonify([]), 200

    id_liga = MAPEO_LIGAS.get(liga, "PD")
    url = f"https://api.football-data.org/v4/competitions/{id_liga}/matches?season={temporada}"

    res = requests.get(url, headers=HEADERS)
    return jsonify(res.json().get("matches", [])), 200

@app.route('/api/partido/detalle/<partido_id>', methods=['GET'])
def get_detalle_partido(partido_id):
    return jsonify({
        "goles": [{"jugador": "Jugador 1"}, {"jugador": "Jugador 2"}],
        "tarjetas": [{"jugador": "Jugador 3"}]
    })

@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
