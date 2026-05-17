import { useEffect, useState } from "react";
import axios from "axios";
import { FaFutbol } from "react-icons/fa";

export default function PartidosTop({ setPartido }) {
  const [partidos, setPartidos] = useState([]);

  useEffect(() => {
    axios.get(
      "https://v3.football.api-sports.io/fixtures?league=39&season=2026&next=10",
      {
        headers: {
          "x-apisports-key": "1f360577430731be1105cf6281d6e57c"
        }
      }
    )
    .then(res => {
      const top = ["Real Madrid","Barcelona","Manchester City","Liverpool"];

      const filtrados = res.data.response.filter(p =>
        top.includes(p.teams.home.name) ||
        top.includes(p.teams.away.name)
      );

      setPartidos(filtrados);
    });
  }, []);

  return (
    <div className="partidos-top">

      <h2>🔥 Partidos TOP</h2>
      <p className="sub">Selecciona un partido</p>

      {partidos.length === 0 && (
        <p style={{ color: "white" }}>Cargando partidos...</p>
      )}

      {partidos.map(p => (
        <div
          key={p.fixture.id}
          className="partido-card"
          onClick={() => setPartido(p)}
        >
          <FaFutbol className="icono" />

          <div className="equipos">
            <span>{p.teams.home.name}</span>
            <span className="vs">vs</span>
            <span>{p.teams.away.name}</span>
          </div>

        </div>
      ))}

    </div>
  );
}