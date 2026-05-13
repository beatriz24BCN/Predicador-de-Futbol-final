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

  // 🧪 TEST API (solo 1 vez)
  useEffect(() => {

    const load = async () => {

      setLoading(true);

      const leagueIds = {
        laliga: 140,
        premier: 39,
        seriea: 135,
        bundesliga: 78,
        worldcup: 1,
      };

      const leagueId = leagueIds[nombre];

      const data = await getMatchesByLeague(leagueId);

      console.log("🔥 PARTIDOS RAW:", data);

      const formateados = data.map((p) => ({
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
              : "Próximo",
      }));

      setPartidos(formateados);

      setLoading(false);
    };

    load();

  }, [nombre]);

  return (
    <div style={{ color: "white", padding: "20px" }}>
      <h1>{nombre}</h1>

      {loading ? (
        <p>Cargando...</p>
      ) : partidos.length === 0 ? (
        <p>No hay partidos</p>
      ) : (
        partidos.map((p) => (
          <PartidoCard key={p.id} {...p} />
        ))
      )}
    </div>
  );
};