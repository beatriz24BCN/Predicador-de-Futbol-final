import React, { useEffect, useState } from "react";

export const Liga = () => {
  const [allPartidos, setAllPartidos] = useState([]);
  const [partidosFiltrados, setPartidosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 📅 Estados para las pestañas de días
  const [listaDeDias, setListaDeDias] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");

  // 🏆 Estado para el filtro de la Liga (Por defecto "TODAS")
  const [ligaSeleccionada, setLigaSeleccionada] = useState("TODAS");

  // 🛠️ Recuerda verificar que este enlace largo de tu puerto 3001 sea el actual de tu workspace
  const url = "https://literate-memory-97r4gq5rwqxjhx7g4-3001.app.github.dev/api/fixtures";

  useEffect(() => {
    const dias = [];
    const opcionesDia = { weekday: 'short' };
    const opcionesNumero = { day: '2-digit' };

    for (let i = -1; i < 6; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const formatoISO = d.toISOString().split('T')[0];

      dias.push({
        iso: formatoISO,
        nombre: d.toLocaleDateString('es-ES', opcionesDia).replace('.', ''),
        numero: d.toLocaleDateString('es-ES', opcionesNumero)
      });
    }

    setListaDeDias(dias);
    if (dias.length > 1) {
      setFechaSeleccionada(dias[1].iso); // HOY por defecto
    }
  }, []);

  useEffect(() => {
    const consultarNuestroBackend = async () => {
      try {
        setLoading(true);
        setError(null);
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error("No se pudo obtener respuesta del backend.");
        const data = await respuesta.json();
        setAllPartidos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    consultarNuestroBackend();
    const intervalo = setInterval(consultarNuestroBackend, 20000);
    return () => clearInterval(intervalo);
  }, []);

  // 🔄 DOBLE FILTRADO EN TIEMPO REAL: Fecha e interés de Ligas
  useEffect(() => {
    if (fechaSeleccionada) {
      let resultado = allPartidos.filter(partido => partido.fecha === fechaSeleccionada);

      if (ligaSeleccionada === "TODAS") {
        resultado = resultado.filter(partido => {
          const nombreLiga = partido.liga.toLowerCase();
          const esEspanola = nombreLiga.includes("primera") || nombreLiga.includes("laliga") || nombreLiga.includes("spain");
          const esInglesa = nombreLiga.includes("premier") || nombreLiga.includes("england");
          const esAlemana = nombreLiga.includes("bundesliga") || nombreLiga.includes("germany");
          const esItaliana = nombreLiga.includes("serie a") || nombreLiga.includes("italy");
          return esEspanola || esInglesa || esAlemana || esItaliana;
        });
      } else {
        resultado = resultado.filter(partido => {
          const nombreLiga = partido.liga.toLowerCase();
          if (ligaSeleccionada === "ESP") return nombreLiga.includes("primera") || nombreLiga.includes("laliga") || nombreLiga.includes("spain");
          if (ligaSeleccionada === "ENG") return nombreLiga.includes("premier") || nombreLiga.includes("england");
          if (ligaSeleccionada === "GER") return nombreLiga.includes("bundesliga") || nombreLiga.includes("germany");
          if (ligaSeleccionada === "ITA") return nombreLiga.includes("serie a") || nombreLiga.includes("italy");
          if (ligaSeleccionada === "WC") return nombreLiga.includes("world cup") || nombreLiga.includes("mundial") || nombreLiga.includes("fifa");
          return true;
        });
      }
      setPartidosFiltrados(resultado);
    }
  }, [fechaSeleccionada, ligaSeleccionada, allPartidos]);

  // 🕐 Convierte la hora UTC a la del navegador local
  const formatearHoraLocal = (fechaISO, horaUTC) => {
    try {
      const stringFechaUTC = `${fechaISO}T${horaUTC}:00Z`;
      const fechaLocal = new Date(stringFechaUTC);
      return fechaLocal.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return horaUTC;
    }
  };

  // ⏱️ Pinta dinámicamente el estado y el minuto de juego exacto
  const renderEstado = (status, fecha, hora, minuto) => {
    if (status === "IN_PLAY" || status === "LIVE") {
      let tiempoActual = "● EN VIVO";
      if (minuto) {
        tiempoActual = minuto <= 45 ? `● 1T ${minuto}'` : `● 2T ${minuto}'`;
      }
      return <span className="status-badge live">{tiempoActual}</span>;
    }
    if (status === "PAUSED") {
      return <span className="status-badge paused">⏸️ DESCANSO</span>;
    }
    if (status === "FINISHED") {
      return <span className="status-badge finished">FINALIZADO</span>;
    }
    const horaLocal = formatearHoraLocal(fecha, hora);
    return <span className="status-badge scheduled">⏰ {horaLocal}</span>;
  };

  return (
    <div className="live-score-wrapper">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
          
          .live-score-wrapper { font-family: 'Roboto', Arial, sans-serif; background-color: #161922; min-height: 100vh; color: #b9c1cc; padding: 15px; }
          .live-score-container { max-width: 900px; margin: 0 auto; background-color: #1e2330; border-radius: 6px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
          
          .date-selector-bar { display: flex; background-color: #0e1118; border-bottom: 1px solid #232936; justify-content: space-between; padding: 8px 10px; overflow-x: auto; }
          .date-tab { background: none; border: none; color: #718096; display: flex; flex-direction: column; align-items: center; padding: 6px 12px; cursor: pointer; border-radius: 6px; min-width: 65px; transition: 0.2s; }
          .date-tab .day-name { font-size: 0.65rem; text-transform: uppercase; font-weight: 700; margin-bottom: 2px; }
          .date-tab .day-num { font-size: 1rem; font-weight: 700; }
          .date-tab:hover { color: #ffffff; background-color: #ffffff0a; }
          .date-tab.active { background-color: #fbbf24; color: #0e1118; }
          
          .league-filter-bar { display: flex; background-color: #1a1f2c; padding: 10px 16px; gap: 10px; overflow-x: auto; border-bottom: 1px solid #232936; }
          .league-filter-btn { background-color: #0e1118; border: 1px solid #2d3748; color: #a0aec0; padding: 6px 14px; font-size: 0.75rem; font-weight: 700; border-radius: 20px; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; }
          .league-filter-btn:hover { border-color: #fbbf24; color: white; }
          .league-filter-btn.active { background-color: #fbbf24; border-color: #fbbf24; color: #0e1118; }

          .match-item-row { display: grid; grid-template-columns: 130px 1fr; align-items: center; padding: 14px 16px; border-bottom: 1px solid #161922; background-color: #1f2533; }
          .status-badge { font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-align: center; width: fit-content; letter-spacing: 0.5px; }
          .status-badge.live { background-color: #ef4444; color: white; animation: pulse-glow 1s infinite alternate; }
          .status-badge.paused { background-color: #2d3748; color: #f59e0b; border: 1px solid #f59e0b33; }
          .status-badge.finished { background-color: #4a5568; color: #a0aec0; }
          .status-badge.scheduled { background-color: #2b6cb0; color: white; }
          
          .league-short-name { font-size: 0.65rem; color: #718096; margin-top: 5px; text-transform: uppercase; font-weight: 700; max-width: 110px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .teams-score-display { display: grid; grid-template-columns: 1fr 80px 1fr; align-items: center; width: 100%; }
          .team-box-side { font-size: 0.95rem; font-weight: 500; color: #ffffff; display: flex; align-items: center; gap: 8px; }
          .team-box-side.home { justify-content: flex-end; text-align: right; }
          .team-box-side.away { justify-content: flex-start; text-align: left; }
          .score-box-center { display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 700; color: #fbbf24; background-color: #0e1118; padding: 4px 0; border-radius: 4px; min-width: 70px; border: 1px solid #2d3748; }
          
          @keyframes pulse-glow { 0% { opacity: 0.6; } 100% { opacity: 1; } }
        `}
      </style>

      <div className="live-score-container">

        <div className="date-selector-bar">
          {listaDeDias.map((dia, index) => (
            <button
              key={index}
              className={`date-tab ${fechaSeleccionada === dia.iso ? "active" : ""}`}
              onClick={() => setFechaSeleccionada(dia.iso)}
            >
              <span className="day-name">{index === 1 ? "HOY" : dia.nombre}</span>
              <span className="day-num">{dia.numero}</span>
            </button>
          ))}
        </div>

        <div className="league-filter-bar">
          <button className={`league-filter-btn ${ligaSeleccionada === "TODAS" ? "active" : ""}`} onClick={() => setLigaSeleccionada("TODAS")}>⚽ TODAS LAS LIGAS</button>
          <button className={`league-filter-btn ${ligaSeleccionada === "ESP" ? "active" : ""}`} onClick={() => setLigaSeleccionada("ESP")}>🇪🇸 LALIGA</button>
          <button className={`league-filter-btn ${ligaSeleccionada === "ENG" ? "active" : ""}`} onClick={() => setLigaSeleccionada("ENG")}>🏴󠁧󠁢󠁥󠁮󠁧󠁿 PREMIER LEAGUE</button>
          <button className={`league-filter-btn ${ligaSeleccionada === "GER" ? "active" : ""}`} onClick={() => setLigaSeleccionada("GER")}>🇩🇪 BUNDESLIGA</button>
          <button className={`league-filter-btn ${ligaSeleccionada === "ITA" ? "active" : ""}`} onClick={() => setLigaSeleccionada("ITA")}>🇮🇹 SERIE A</button>
          <button className={`league-filter-btn ${ligaSeleccionada === "WC" ? "active" : ""}`} onClick={() => setLigaSeleccionada("WC")}>🏆 MUNDIAL FIFA</button>
        </div>

        <div className="matches-list-holder">
          {error && <div style={{ padding: "15px", color: "#f87171", textAlign: "center" }}>{error}</div>}

          {loading && allPartidos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#fbbf24" }}>Sincronizando partidos reales con el backend...</div>
          ) : partidosFiltrados.length > 0 ? (
            partidosFiltrados.map((match) => (
              <div key={match.id} className="match-item-row">
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {/* Aquí pasamos de forma segura la variable a todas las iteraciones */}
                  {renderEstado(match.estado, match.fecha, match.hora, match.minuto)}
                  <span className="league-short-name" title={match.liga}>{match.liga}</span>
                </div>

                <div className="teams-score-display">
                  <div className="team-box-side home"><span>{match.teams.home.name}</span></div>
                  <div className="score-box-center">
                    <span>{match.estado === "TIMED" ? "-" : match.goals.home}</span>
                    <span style={{ color: "#4b5563", margin: "0 5px" }}>-</span>
                    <span>{match.estado === "TIMED" ? "-" : match.goals.away}</span>
                  </div>
                  <div className="team-box-side away"><span>{match.teams.away.name}</span></div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "50px", color: "#718096", fontSize: "0.9rem" }}>
              No hay partidos activos en este momento para la selección actual.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};