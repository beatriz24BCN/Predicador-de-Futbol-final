from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/api/fixtures")
def fixtures():
    return jsonify([
        {"id": 1, "home": "Real Madrid", "away": "Barcelona", "date": "2024-05-20"},
        {"id": 2, "home": "Atletico Madrid", "away": "Sevilla", "date": "2024-05-21"}
    ])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3001, debug=True)
