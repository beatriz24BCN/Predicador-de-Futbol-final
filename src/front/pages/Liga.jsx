import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PartidoCard } from "../components/PartidoCard";
import { getMatchesByLeague } from "../services/footballApi";

export const Liga = () => {
  const { nombre } = useParams();

  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const leagueIds = {
    laliga: 140,
    premier: 39,
    seriea: 135,
    bundesliga: 78,
    worldcup: 1,
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const leagueId = leagueIds[nombre];

      const data = await getMatchesByLeague(leagueId);

      console.log("RAW DATA:", data);

      const formateados = (data || []).map((p) => ({
        id: p.fixture.id,
        liga: p.league.name,
        local: p.teams.home.name,
        visitante: p.teams.away.name,
        resultado:
          p.goals.home !== null
            ? `${p.goals.home}-${p.goals.away}`
            : null,
        fecha: p.fixture.date,
        estado:
          p.fixture.status.short === "FT"
            ? "Finalizado"
            : p.fixture.status.short === "LIVE"
            ? "En vivo"
            : "Proximo",
      }));

      setPartidos(formateados);
      setLoading(false);
    };

    load();
  }, [nombre]);

  return (
    <div style={{ color: "white", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>
        {nombre}
      </h1>

      {loading ? (
        <p style={{ textAlign: "center" }}>
          Cargando...
        </p>
      ) : partidos.length === 0 ? (
        <p style={{ textAlign: "center" }}>
          No hay partidos
        </p>
      ) : (
        partidos.map((p) => (
          <PartidoCard key={p.id} {...p} />
        ))
      )}
    </div>
  );
};