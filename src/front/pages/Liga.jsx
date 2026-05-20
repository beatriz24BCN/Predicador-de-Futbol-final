import React, { useEffect, useState } from "react";

export const Liga = () => {
  const [allPartidos, setAllPartidos] = useState([]);
  const [partidosFiltrados, setPartidosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [listaDeDias, setListaDeDias] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [ligaSeleccionada, setLigaSeleccionada] = useState("TODAS");

  const url = "https://literate-memory-97r4gq5rwqxjhx7g4-3001.app.github.dev/api/fixtures";

  const generarPestañasDesdeHoy = () => {
    const fechaInicio = new Date();
    const dias = [];
    const opcionesDia = { weekday: 'short' };
    const opcionesNumero = { day: '2-digit' };

    for (let i = 0; i < 7; i++) {
      const d = new Date(fechaInicio);
      d.setDate(d.getDate() + i);

      const offset = d.getTimezoneOffset();
      const dLocal = new Date(d.getTime() - (offset * 60 * 1000));
      const formatoISO = dLocal.toISOString().split('T')[0];

      dias.push({
        iso: formatoISO,
        nombre: d.toLocaleDateString('es-ES', opcionesDia).replace('.', ''),
        numero: d.toLocaleDateString('es-ES', opcionesNumero)
      });
    }

    setListaDeDias(dias);
    if (dias.length > 0) {
      setFechaSeleccionada(dias[0].iso);
    }
  };

  useEffect(() => {
    generarPestañasDesdeHoy();
  }, []);

  useEffect(() => {
    const consultarNuestroBackend = async () => {
      try {
        setLoading(true);
        setError(null);
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error("No se pudo conectar con el servidor.");
        const data = await respuesta.json();
        setAllPartidos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    consultarNuestroBackend();
    const intervalo = setInterval(consultarNuestroBackend, 30000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (fechaSeleccionada) {
      let resultado = allPartidos.filter(partido => {
        const coincideFecha = partido.fecha === fechaSeleccionada;
        const esSabadoBuscado = new Date(fechaSeleccionada).getDay() === 6;
        const esPartidoDeLaLiga = partido.codigo_liga === "PD";
        return coincideFecha || (esPartidoDeLaLiga && esSabadoBuscado && partido.fecha.includes(fechaSeleccionada.substring(0, 7)));
      });

      const idsUnicos = [];
      resultado = resultado.filter(partido => {
        if (idsUnicos.includes(partido.id)) return false;
        idsUnicos.push(partido.id);
        return true;
      });

      if (ligaSeleccionada !== "TODAS") {
        resultado = resultado.filter(partido => partido.codigo_liga === ligaSeleccionada);
      }

      setPartidosFiltrados(resultado);
    }
  }, [fechaSeleccionada, ligaSeleccionada, allPartidos]);

  const formatearHoraLocal = (fechaISO, horaUTC) => {
    try {
      const stringFechaUTC = `${fechaISO}T${horaUTC}:00Z`;
      const fechaLocal = new Date(stringFechaUTC);
      return fechaLocal.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return horaUTC;
    }
  };

  const renderEstado = (estado, fecha, hora) => {
    if (estado === "IN_PLAY" || estado === "LIVE") return <span className="status-badge live">● EN JUEGO</span>;
    if (estado === "PAUSED") return <span className="status-badge paused">⏸️ DESCANSO</span>;
    if (estado === "FINISHED") return <span className="status-badge finished">FINALIZADO</span>;

    const horaLocal = formatearHoraLocal(fecha, hora);
    return <span className="status-badge scheduled">⏰ {horaLocal}</span>;
  };

  const obtenerMensajeVacio = () => {
    if (ligaSeleccionada === "TODAS") return "No hay partidos programados para ninguna liga en este día.";
    if (ligaSeleccionada === "PD") return "No hay partidos de LaLiga española para este día.";
    if (ligaSeleccionada === "PL") return "No hay partidos de la Premier League para este día.";
    if (ligaSeleccionada === "BL1") return "No hay partidos de la Bundesliga para este día.";
    if (ligaSeleccionada === "SA") return "No hay partidos de la Serie A para este día.";
    if (ligaSeleccionada === "WC") return "No hay partidos del Mundial de la FIFA para este día.";
    return "No hay partidos disponibles.";
  };

  return (
    <div className="live-score-wrapper">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
          .live-score-wrapper { font-family: 'Roboto', Arial, sans-serif; background-color: #0f111a; min-height: 100vh; color: #b2bdcd; padding: 15px; }
          .live-score-container { max-width: 900px; margin: 0 auto; background-color: #151824; border-radius: 8px; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.5); }
          
          .date-selector-bar { display: flex; background-color: #08090d; justify-content: space-between; padding: 10px; border-bottom: 1px solid #1f2436; }
          .date-tab { background: none; border: none; color: #5c6982; display: flex; flex-direction: column; align-items: center; padding: 6px 12px; cursor: pointer; border-radius: 6px; transition: all 0.2s; }
          .date-tab .day-name { font-size: 0.65rem; text-transform: uppercase; font-weight: 700; }
          .date-tab .day-num { font-size: 1.05rem; font-weight: 700; margin-top: 2px; }
          .date-tab.active { background-color: #fbbf24; color: #08090d; transform: scale(1.02); }

          /* 🌟 ESTILOS DE CÁPSULAS PREMIUM (TIPO YOUTUBE) */
          .league-capsule-bar { display: flex; background-color: #12141f; padding: 12px 16px; gap: 10px; overflow-x: auto; border-bottom: 1px solid #1f2436; scrollbar-width: none; }
          .league-capsule-bar::-webkit-scrollbar { display: none; } /* Oculta barra en Chrome/Safari */
          
          .capsule-btn { background-color: #1a1e2d; border: 1px solid #293047; color: #9bb0cb; padding: 8px 16px; font-size: 0.8rem; font-weight: 700; border-radius: 30px; cursor: pointer; white-space: nowrap; transition: all 0.15s ease; outline: none; }
          .capsule-btn:hover { background-color: #22283b; border-color: #3b4566; color: #fff; }
          .capsule-btn.active { background-color: #fbbf24; border-color: #fbbf24; color: #08090d; box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2); }

          .match-card { display: flex; flex-direction: column; border-bottom: 1px solid #0f111a; background-color: #181c2b; padding: 14px 16px; transition: background 0.2s; }
          .match-card:hover { background-color: #1d2234; }
          .match-item-row { display: grid; grid-template-columns: 130px 1fr; align-items: center; }
          .status-badge { font-size: 0.65rem; font-weight: 700; padding: 4px 8px; border-radius: 4px; text-align: center; width: fit-content; background-color: #21518c; color: white; }
          .league-short-name { font-size: 0.65rem; color: #5c6982; margin-top: 5px; font-weight: 700; text-transform: uppercase; }
          
          .teams-score-display { display: grid; grid-template-columns: 1fr 75px 1fr; align-items: center; }
          .team-box-side { font-size: 0.95rem; font-weight: 500; color: #fff; display: flex; align-items: center; gap: 10px; }
          .team-box-side.home { justify-content: flex-end; text-align: right; }
          .team-box-side.away { justify-content: flex-start; text-align: left; }
          .team-crest { width: 24px; height: 24px; object-fit: contain; flex-shrink: 0; background-color: rgba(255,255,255,0.03); padding: 2px; border-radius: 4px; }
          
          .score-box-center { display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; color: #fbbf24; background-color: #08090d; padding: 4px 0; border-radius: 4px; }
        `}
      </style>

      <div className="live-score-container">
        <div className="date-selector-bar">
          {listaDeDias.map((dia, i) => (
            <button key={i} className={`date-tab ${fechaSeleccionada === dia.iso ? "active" : ""}`} onClick={() => setFechaSeleccionada(dia.iso)}>
              <span className="day-name">{dia.nombre}</span>
              <span className="day-num">{dia.numero}</span>
            </button>
          ))}
        </div>

        {/* 🌟 BARRA DE FILTROS TOTALMENTE REDISEÑADA Y ORDENADA */}
        <div className="league-capsule-bar">
          <button className={`capsule-btn ${ligaSeleccionada === "TODAS" ? "active" : ""}`} onClick={() => setLigaSeleccionada("TODAS")}>⚽ Todas las Ligas</button>
          <button className={`capsule-btn ${ligaSeleccionada === "PD" ? "active" : ""}`} onClick={() => setLigaSeleccionada("PD")}>🇪🇸 LaLiga</button>
          <button className={`capsule-btn ${ligaSeleccionada === "PL" ? "active" : ""}`} onClick={() => setLigaSeleccionada("PL")}>🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League</button>
          <button className={`capsule-btn ${ligaSeleccionada === "BL1" ? "active" : ""}`} onClick={() => setLigaSeleccionada("BL1")}>🇩🇪 Bundesliga</button>
          <button className={`capsule-btn ${ligaSeleccionada === "SA" ? "active" : ""}`} onClick={() => setLigaSeleccionada("SA")}>🇮🇹 Serie A</button>
          <button className={`capsule-btn ${ligaSeleccionada === "WC" ? "active" : ""}`} onClick={() => setLigaSeleccionada("WC")}>🏆 Mundial FIFA</button>
        </div>

        <div className="matches-list-holder">
          {error && <div style={{ padding: "15px", color: "#f87171", textAlign: "center" }}>{error}</div>}

          {loading && allPartidos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#fbbf24" }}>Cargando calendario deportivo...</div>
          ) : partidosFiltrados.length > 0 ? (
            partidosFiltrados.map((match) => (
              <div key={match.id} className="match-card">
                <div className="match-item-row">
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {renderEstado(match.estado, match.fecha, match.hora)}
                    <span className="league-short-name">{match.liga}</span>
                  </div>

                  <div className="teams-score-display">
                    <div className="team-box-side home">
                      <span>{match.teams.home.name}</span>
                      {match.teams.home.crest && (
                        <img src={match.teams.home.crest} alt="" className="team-crest" onError={(e) => e.target.style.display = 'none'} />
                      )}
                    </div>

                    <div className="score-box-center">
                      <span>{match.estado === "TIMED" ? "-" : match.goals.home}</span>
                      <span style={{ color: "#2e354a", margin: "0 6px" }}>-</span>
                      <span>{match.estado === "TIMED" ? "-" : match.goals.away}</span>
                    </div>

                    <div className="team-box-side away">
                      {match.teams.away.crest && (
                        <img src={match.teams.away.crest} alt="" className="team-crest" onError={(e) => e.target.style.display = 'none'} />
                      )}
                      <span>{match.teams.away.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "50px", color: "#5c6982" }}>
              {obtenerMensajeVacio()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};