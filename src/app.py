from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

API_TOKEN = "7fc4c822095b45d590fa0cd500eb3d5f"
HEADERS = {"X-Auth-Token": API_TOKEN}
MAPEO_LIGAS = {"PD": "PD", "PL": "PL", "SA": "SA", "BL": "BL1", "WC": "WC"}

@app.route('/api/fixtures/historico', methods=['GET'])
def get_historico():
    liga = request.args.get('liga', 'PD')
    temporada = request.args.get('temporada', '2025')
    
    # Si es Mundial, devolvemos datos vacíos o tu JSON local
    if liga == "WC":
        return jsonify([]), 200
        
    id_liga = MAPEO_LIGAS.get(liga, "PD")
    url = f"https://api.football-data.org/v4/competitions/{id_liga}/matches?season={temporada}"
    
    res = requests.get(url, headers=HEADERS)
    return jsonify(res.json().get("matches", [])), 200

@app.route('/api/partido/detalle/<partido_id>', methods=['GET'])
def get_detalle_partido(partido_id):
    # Simulamos datos para el detalle
    return jsonify({
        "goles": [{"jugador": "Jugador 1"}, {"jugador": "Jugador 2"}],
        "tarjetas": [{"jugador": "Jugador 3"}]
    })

# ============================
# 🛒 TIENDA (DATOS)
# ============================

productos = [
    {"id": 1, "nombre": "Camiseta Real Madrid", "precio": 79.99, "stock": 5},
    {"id": 2, "nombre": "Camiseta Barcelona", "precio": 79.99, "stock": 5},
    {"id": 3, "nombre": "Camiseta Manchester City", "precio": 74.99, "stock": 5},
    {"id": 4, "nombre": "Camiseta Liverpool", "precio": 74.99, "stock": 5},
    {"id": 5, "nombre": "Camiseta Bayern Munich", "precio": 74.99, "stock": 5},
    {"id": 6, "nombre": "Camiseta PSG", "precio": 74.99, "stock": 5},
    {"id": 7, "nombre": "Camiseta Brentford", "precio": 56.00, "stock": 5},
    {"id": 8, "nombre": "Camiseta Fulham", "precio": 56.00, "stock": 5},
    {"id": 9, "nombre": "Camiseta Crystal Palace", "precio": 56.00, "stock": 5},
    {"id": 10, "nombre": "Camiseta Wolverhampton", "precio": 57.00, "stock": 5},
    {"id": 11, "nombre": "Camiseta Bournemouth", "precio": 59.00, "stock": 5},
    {"id": 12, "nombre": "Camiseta Nottingham Forest", "precio": 55.00, "stock": 5}
]

# ============================
# 🛒 CRUD TIENDA
# ============================

# GET TODOS
@app.route('/api/tienda', methods=['GET'])
def get_productos():
    return jsonify(productos), 200


# GET POR ID
@app.route('/api/tienda/<int:id>', methods=['GET'])
def get_producto(id):
    producto = next((p for p in productos if p["id"] == id), None)

    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404

    return jsonify(producto), 200


# CREATE
@app.route('/api/tienda', methods=['POST'])
def create_producto():
    data = request.get_json()

    if not data or not data.get("nombre") or not data.get("precio"):
        return jsonify({"error": "Datos incompletos"}), 400

    nuevo = {
        "id": productos[-1]["id"] + 1 if productos else 1,
        "nombre": data["nombre"],
        "precio": data["precio"],
        "stock": data.get("stock", 0)
    }

    productos.append(nuevo)

    return jsonify(nuevo), 201


# UPDATE
@app.route('/api/tienda/<int:id>', methods=['PUT'])
def update_producto(id):
    producto = next((p for p in productos if p["id"] == id), None)

    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404

    data = request.get_json()

    producto["nombre"] = data.get("nombre", producto["nombre"])
    producto["precio"] = data.get("precio", producto["precio"])
    producto["stock"] = data.get("stock", producto["stock"])

    return jsonify(producto), 200


# DELETE
@app.route('/api/tienda/<int:id>', methods=['DELETE'])
def delete_producto(id):
    global productos

    producto = next((p for p in productos if p["id"] == id), None)

    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404

    productos = [p for p in productos if p["id"] != id]

    return jsonify({"msg": "Producto eliminado"}), 200


# COMPRA
@app.route('/api/tienda/comprar/<int:id>', methods=['POST'])
def comprar_producto(id):
    producto = next((p for p in productos if p["id"] == id), None)

    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404

    if producto["stock"] <= 0:
        return jsonify({"error": "Sin stock"}), 400

    producto["stock"] -= 1

    return jsonify({
        "msg": "Compra realizada",
        "producto": producto
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)