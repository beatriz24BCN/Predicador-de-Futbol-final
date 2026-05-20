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
    const intervalo = setInterval(consultarNuestroBackend, 30000); // 30s para respetar la caché de Python
    return () => clearInterval(intervalo);
  }, []);

  // 🔄 FILTRADO SEGURO DE JORNADA COMPLETA
  useEffect(() => {
    if (fechaSeleccionada) {
      let resultado = allPartidos.filter(partido => {
        // Coincidencia exacta de fecha
        const coincideFecha = partido.fecha === fechaSeleccionada;
        
        // 🛡️ REGLA SALVAVIDAS: Si el partido es de LaLiga (PD) y la API lo guardó con desfase horario 
        // (por ejemplo, madrugada en UTC pero noche en tu país), lo forzamos a entrar en el sábado.
        const esSabadoBuscado = new Date(fechaSeleccionada).getDay() === 6; // 6 es Sábado
        const esPartidoDeLaLiga = partido.codigo_liga === "PD";
        
        return coincideFecha || (esPartidoDeLaLiga && esSabadoBuscado && partido.fecha.includes(fechaSeleccionada.substring(0,7)));
      });

      // Eliminar posibles duplicados que se salten el rango
      const idsUnicos = [];
      resultado = resultado.filter(partido => {
        if (idsUnicos.includes(partido.id)) return false;
        idsUnicos.push(partido.id);
        return true;
      });

      // Filtro por botón de liga por código oficial
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

  return (
    <div className="live-score-wrapper">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
          .live-score-wrapper { font-family: 'Roboto', Arial, sans-serif; background-color: #161922; min-height: 100vh; color: #b9c1cc; padding: 15px; }
          .live-score-container { max-width: 900px; margin: 0 auto; background-color: #1e2330; border-radius: 6px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
          .date-selector-bar { display: flex; background-color: #0e1118; border-bottom: 1px solid #232936; justify-content: space-between; padding: 8px 10px; overflow-x: auto; }
          .date-tab { background: none; border: none; color: #718096; display: flex; flex-direction: column; align-items: center; padding: 6px 12px; cursor: pointer; border-radius: 6px; min-width: 65px; }
          .date-tab .day-name { font-size: 0.65rem; text-transform: uppercase; font-weight: 700; margin-bottom: 2px; }
          .date-tab .day-num { font-size: 1rem; font-weight: 700; }
          .date-tab.active { background-color: #fbbf24; color: #0e1118; }
          .league-filter-bar { display: flex; background-color: #1a1f2c; padding: 10px 16px; gap: 10px; border-bottom: 1px solid #232936; overflow-x: auto; }
          .league-filter-btn { background-color: #0e1118; border: 1px solid #2d3748; color: #a0aec0; padding: 6px 14px; font-size: 0.75rem; font-weight: 700; border-radius: 20px; cursor: pointer; white-space: nowrap; }
          .league-filter-btn.active { background-color: #fbbf24; border-color: #fbbf24; color: #0e1118; }
          .match-card { display: flex; flex-direction: column; border-bottom: 1px solid #161922; background-color: #1f2533; padding: 14px 16px; }
          .match-item-row { display: grid; grid-template-columns: 140px 1fr; align-items: center; }
          .status-badge { font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; text-align: center; width: fit-content; }
          .status-badge.live { background-color: #ef4444; color: white; }
          .status-badge.paused { background-color: #2d3748; color: #f59e0b; }
          .status-badge.finished { background-color: #4a5568; color: #a0aec0; }
          .status-badge.scheduled { background-color: #2b6cb0; color: white; }
          .league-short-name { font-size: 0.65rem; color: #718096; margin-top: 5px; text-transform: uppercase; font-weight: 700; }
          .teams-score-display { display: grid; grid-template-columns: 1fr 80px 1fr; align-items: center; width: 100%; }
          .team-box-side { font-size: 0.95rem; font-weight: 500; color: #ffffff; }
          .team-box-side.home { text-align: right; margin-right: 10px; }
          .team-box-side.away { text-align: left; margin-left: 10px; }
          .score-box-center { display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 700; color: #fbbf24; background-color: #0e1118; padding: 4px 0; border-radius: 4px; }
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
              <span className="day-name">{dia.nombre}</span>
              <span className="day-num">{dia.numero}</span>
            </button>
          ))}
        </div>

        <div className="league-filter-bar">
          <button className={`league-filter-btn ${ligaSeleccionada === "TODAS" ? "active" : ""}`} onClick={() => setLigaSeleccionada("TODAS")}>⚽ TODAS</button>
          <button className={`league-filter-btn ${ligaSeleccionada === "PD" ? "active" : ""}`} onClick={() => setLigaSeleccionada("PD")}>🇪🇸 LALIGA</button>
          <button className={`league-filter-btn ${ligaSeleccionada === "PL" ? "active" : ""}`} onClick={() => setLigaSeleccionada("PL")}>🏴󠁧󠁢󠁥󠁮󠁧󠁿 PREMIER</button>
          <button className={`league-filter-btn ${ligaSeleccionada === "BL1" ? "active" : ""}`} onClick={() => setLigaSeleccionada("BL1")}>🇩🇪 BUNDES</button>
          <button className={`league-filter-btn ${ligaSeleccionada === "SA" ? "active" : ""}`} onClick={() => setLigaSeleccionada("SA")}>🇮🇹 SERIE A</button>
        </div>

        <div className="matches-list-holder">
          {loading && allPartidos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#fbbf24" }}>Cargando jornada...</div>
          ) : partidosFiltrados.length > 0 ? (
            partidosFiltrados.map((match) => (
              <div key={match.id} className="match-card">
                <div className="match-item-row">
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {renderEstado(match.estado, match.fecha, match.hora)}
                    <span className="league-short-name">{match.liga}</span>
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
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "50px", color: "#718096" }}>
              No hay partidos disponibles.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};