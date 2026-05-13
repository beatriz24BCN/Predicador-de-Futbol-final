import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

import { PartidoCard } from "../components/PartidoCard";
import { getMatchesByDate, getDateOffset } from "../services/sportsApi";

export const Liga = () => {
  const { nombre } = useParams();

  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState(0);

  // 🚀 CACHE (no se borra entre renders)
  const cache = useRef({});

  // 🔥 MAPA SLUG → API REAL
  const leagueMap = {
    laliga: "Spanish La Liga",
    premier: "English Premier League",
    seriea: "Italian Serie A",
    bundesliga: "German Bundesliga",
    worldcup: "FIFA World Cup",
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const date = getDateOffset(day); // 👈 AHORA SÍ FUNCIONA
      const cacheKey = `${nombre}-${date}`;

      if (cache.current[cacheKey]) {
        setPartidos(cache.current[cacheKey]);
        setLoading(false);
        return;
      }

      const data = await getMatchesByDate(date);

      const leagueName = leagueMap[nombre];

      console.log("API DATA:", data);
      console.log("LEAGUE MAP:", leagueName);

      const filtered = (data || []).filter((p) =>
        p.strLeague?.toLowerCase().includes(leagueName?.toLowerCase())
      );

      const formateados = filtered
        .map((p) => ({
          id: p.idEvent,
          liga: p.strLeague,
          local: p.strHomeTeam,
          visitante: p.strAwayTeam,
          resultado:
            p.intHomeScore !== null
              ? `${p.intHomeScore}-${p.intAwayScore}`
              : null,
          fecha: p.dateEvent,
          estado: p.intHomeScore !== null ? "Finalizado" : "Proximo",
        }))
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      cache.current[cacheKey] = formateados;

      setPartidos(formateados);
      setLoading(false);
    };

    load();
  }, [day, nombre]);

  return (
    <div style={{ color: "white", textAlign: "center", padding: "20px" }}>

      <h1>{nombre}</h1>

      {/* BOTONES FECHA */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setDay(-1)}>⬅ Ayer</button>
        <button onClick={() => setDay(0)}>Hoy</button>
        <button onClick={() => setDay(1)}>Mañana ➡</button>
      </div>

      {/* CONTENIDO */}
      {loading ? (
        <p>Cargando partidos...</p>
      ) : partidos.length === 0 ? (
        <p>No hay partidos para esta liga en este día</p>
      ) : (
        partidos.map((p) => (
          <PartidoCard key={p.id} {...p} />
        ))
      )}
    </div>
  );
};