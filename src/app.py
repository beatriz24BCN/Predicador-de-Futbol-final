from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MAPEO_LIGAS = {
    "PD": "PD",
    "PL": "PL",
    "SA": "SA",
    "BL": "BL1"
}

# Base de datos local con los colores de los clubes (Inyectamos el SVG directo)


def generar_svg_avatar(iniciales, color_bg, color_texto="ffffff"):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%"><rect width="100" height="100" fill="{color_bg}"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="40" font-weight="bold" fill="#{color_texto}" font-family="Arial, sans-serif">{iniciales}</text></svg>'


GOLEADORES_BACKUP = {
    "PD": [
        {"nombre": "Robert Lewandowski", "equipo": "FC Barcelona",
            "goles": 24, "svg": generar_svg_avatar("RL", "#034ea2")},
        {"nombre": "Kylian Mbappé", "equipo": "Real Madrid CF",
            "goles": 19, "svg": generar_svg_avatar("KM", "#1a365d")},
        {"nombre": "Raphinha", "equipo": "FC Barcelona",
            "goles": 16, "svg": generar_svg_avatar("RA", "#034ea2")},
        {"nombre": "Ante Budimir", "equipo": "CA Osasuna",
            "goles": 14, "svg": generar_svg_avatar("AB", "#cb2027")},
        {"nombre": "Alexander Sørloth", "equipo": "Atlético de Madrid",
            "goles": 13, "svg": generar_svg_avatar("AS", "#cb2027")}
    ],
    "PL": [
        {"nombre": "Erling Haaland", "equipo": "Manchester City FC",
            "goles": 27, "svg": generar_svg_avatar("EH", "#6cabdd")},
        {"nombre": "Mohamed Salah", "equipo": "Liverpool FC",
            "goles": 19, "svg": generar_svg_avatar("MS", "#dd0000")},
        {"nombre": "Cole Palmer", "equipo": "Chelsea FC",
            "goles": 16, "svg": generar_svg_avatar("CP", "#034694")},
        {"nombre": "Ollie Watkins", "equipo": "Aston Villa FC",
            "goles": 15, "svg": generar_svg_avatar("OW", "#942043")},
        {"nombre": "Bukayo Saka", "equipo": "Arsenal FC",
            "goles": 14, "svg": generar_svg_avatar("BS", "#ef0107")}
    ],
    "SA": [
        {"nombre": "Lautaro Martínez", "equipo": "Inter de Milán",
            "goles": 21, "svg": generar_svg_avatar("LM", "#0053a0")},
        {"nombre": "Marcus Thuram", "equipo": "Inter de Milán",
            "goles": 15, "svg": generar_svg_avatar("MT", "#0053a0")},
        {"nombre": "Dusan Vlahovic", "equipo": "Juventus FC",
            "goles": 15, "svg": generar_svg_avatar("DV", "#111111")},
        {"nombre": "Ademola Lookman", "equipo": "Atalanta BC",
            "goles": 13, "svg": generar_svg_avatar("AL", "#24418e")},
        {"nombre": "Mateo Retegui", "equipo": "Atalanta BC",
            "goles": 12, "svg": generar_svg_avatar("MR", "#24418e")}
    ],
    "BL": [
        {"nombre": "Harry Kane", "equipo": "FC Bayern München",
            "goles": 31, "svg": generar_svg_avatar("HK", "#dc052d")},
        {"nombre": "Omar Marmoush", "equipo": "Eintracht Frankfurt",
            "goles": 18, "svg": generar_svg_avatar("OM", "#e1001a")},
        {"nombre": "Victor Boniface", "equipo": "Bayer 04 Leverkusen",
            "goles": 14, "svg": generar_svg_avatar("VB", "#e32221")},
        {"nombre": "Serhou Guirassy", "equipo": "Borussia Dortmund",
            "goles": 13, "svg": generar_svg_avatar("SG", "#fde100", "000000")},
        {"nombre": "Florian Wirtz", "equipo": "Bayer 04 Leverkusen",
            "goles": 11, "svg": generar_svg_avatar("FW", "#e32221")}
    ]
}


@app.route('/api/fixtures', methods=['GET'])
def get_fixtures(): return jsonify([])


@app.route('/api/fixtures/historico', methods=['GET'])
# Puedes mantener tu lógica de partidos aquí
def get_fixtures_historico(): return jsonify([])


@app.route('/api/fixtures/goleadores', methods=['GET'])
def get_goleadores():
    liga_req = request.args.get('liga', default='PD', type=str)
    return jsonify(GOLEADORES_BACKUP.get(liga_req, [])), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)
