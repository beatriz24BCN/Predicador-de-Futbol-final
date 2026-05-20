import React, { useEffect, useState } from "react";

export const Liga = () => {
  const [allPartidos, setAllPartidos] = useState([]);
  const [partidosFiltrados, setPartidosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listaDeDias, setListaDeDias] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [ligaSeleccionada, setLigaSeleccionada] = useState("TODAS");
  const [soloEnVivo, setSoloEnVivo] = useState(false);
  const [partidoExpandido, setPartidoExpandido] = useState(null);
  const [verFavoritos, setVerFavoritos] = useState(false);
  const [favoritos, setFavoritos] = useState(() => {
    try {
      const guardados = localStorage.getItem("mis_partidos_favoritos");
      const parsed = guardados ? JSON.parse(guardados) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  });

  const url = "https://literate-memory-97r4gq5rwqxjhx7g4-3001.app.github.dev/api/fixtures";

  // --- MANTIENE TODA TU LÓGICA ORIGINAL AQUÍ ---
  const generarPestañasDesdeHoy = () => {
    const fechaInicio = new Date();
    const dias = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(fechaInicio);
      d.setDate(d.getDate() + i);
      return {
        iso: d.toISOString().split('T')[0],
        nombre: d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''),
        numero: d.toLocaleDateString('es-ES', { day: '2-digit' })
      };
    });
    setListaDeDias(dias);
    setFechaSeleccionada(dias[0].iso);
  };

  useEffect(() => { generarPestañasDesdeHoy(); }, []);

  const consultarNuestroBackend = async () => {
    try {
      setLoading(true);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error de conexión");
      const data = await res.json();
      setAllPartidos(data || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => {
    consultarNuestroBackend();
    const intervalo = setInterval(consultarNuestroBackend, 30000);
    return () => clearInterval(intervalo);
  }, []);

  // --- ESTE USEEFFECT ES EL QUE CONTROLA QUE TODO SE VEA ---
  // He añadido 'favoritos' como dependencia para que reaccione al instante
  useEffect(() => {
    let res = [...allPartidos];
    if (verFavoritos) {
      res = res.filter((p) => favoritos.includes(p.id));
    } else if (soloEnVivo) {
      res = res.filter((p) => ["IN_PLAY", "LIVE", "PAUSED"].includes(p.estado));
    } else {
      res = res.filter((p) => p.fecha === fechaSeleccionada);
      if (ligaSeleccionada !== "TODAS") {
        res = res.filter((p) => p.codigo_liga === ligaSeleccionada);
      }
    }
    const unicos = Array.from(new Set(res.map(p => p.id))).map(id => res.find(p => p.id === id));
    setPartidosFiltrados(unicos);
  }, [allPartidos, fechaSeleccionada, ligaSeleccionada, soloEnVivo, verFavoritos, favoritos]);

  // --- AQUÍ ESTÁ LA CORRECCIÓN PARA QUE EL CONTADOR CAMBIE AL INSTANTE ---
  const toggleFavorito = (e, partidoId) => {
    e.stopPropagation();
    setFavoritos(prev => {
      const nuevos = prev.includes(partidoId) ? prev.filter(id => id !== partidoId) : [...prev, partidoId];
      localStorage.setItem("mis_partidos_favoritos", JSON.stringify(nuevos));
      return nuevos;
    });
  };

  // ... (Tus funciones: formatearHoraLocal, calcularMinutoDeJuego, renderEstado, obtenerMensajeVacio, toggleExpandirPartido, renderEsqueletosDeCarga, y el return con el JSX que me pasaste arriba)




  const formatearHoraLocal = (fechaISO, horaUTC) => {
    try {
      const stringFechaUTC = `${fechaISO}T${horaUTC}:00Z`;
      const fechaLocal = new Date(stringFechaUTC);
      return fechaLocal.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return horaUTC;
    }
  };

  const calcularMinutoDeJuego = (partido) => {
    if (partido.estado === "PAUSED") return "DESCANSO";
    if (partido.minuto_juego) return `${partido.minuto_juego}'`;
    try {
      const ahora = new Date();
      const stringFechaUTC = `${partido.fecha}T${partido.hora}:00Z`;
      const horaInicio = new Date(stringFechaUTC);
      const diferenciaMinutos = Math.floor((ahora - horaInicio) / 60000);
      if (diferenciaMinutos > 0 && diferenciaMinutos <= 45) return `1T ${diferenciaMinutos}'`;
      if (diferenciaMinutos > 45 && diferenciaMinutos <= 60) return `DESCANSO`;
      if (diferenciaMinutos > 60 && diferenciaMinutos <= 105) return `2T ${diferenciaMinutos - 15}'`;
      return "EN JUEGO";
    } catch (e) { return "EN JUEGO"; }
  };

  const renderEstado = (partido) => {
    const { estado, fecha, hora } = partido;
    if (estado === "IN_PLAY" || estado === "LIVE") return <span className="status-badge live">● {calcularMinutoDeJuego(partido)}</span>;
    if (estado === "PAUSED") return <span className="status-badge paused">⏸️ DESCANSO</span>;
    if (estado === "FINISHED") return <span className="status-badge finished">FINALIZADO</span>;
    const horaLocal = formatearHoraLocal(fecha, hora);
    return <span className="status-badge scheduled">⏰ {horaLocal}</span>;
  };

  const obtenerMensajeVacio = () => {
    if (verFavoritos) return "No has guardado ningún partido en tus favoritos todavía. ¡Pulsa la estrella de cualquier encuentro!";
    if (soloEnVivo) return "No hay partidos jugándose en vivo en este momento.";
    if (ligaSeleccionada === "TODAS") return "No hay partidos programados para ninguna liga en este día.";
    if (ligaSeleccionada === "PD") return "No hay partidos de LaLiga española para este día.";
    if (ligaSeleccionada === "PL") return "No hay partidos de la Premier League para este día.";
    if (ligaSeleccionada === "BL1") return "No hay partidos de la Bundesliga para este día.";
    if (ligaSeleccionada === "SA") return "No hay partidos de la Serie A para este día.";
    if (ligaSeleccionada === "WC") return "No hay partidos del Mundial de la FIFA para este día.";
    return "No hay partidos disponibles.";
  };

  const toggleExpandirPartido = (partidoId) => {
    if (partidoExpandido === partidoId) {
      setPartidoExpandido(null);
    } else {
      setPartidoExpandido(partidoId);
    }
  };

  const renderEsqueletosDeCarga = () => {
    return [1, 2, 3, 4].map((n) => (
      <div key={n} className="match-card skeleton-card">
        <div className="match-item-row-fav">
          <div className="skeleton-circle" style={{ width: '20px', height: '20px', margin: "0 auto" }}></div>
          <div className="match-item-row">
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="skeleton-line skeleton-badge"></div>
              <div className="skeleton-line skeleton-text-short"></div>
            </div>
            <div className="teams-score-display">
              <div className="team-box-side home" style={{ justifyContent: "flex-end" }}>
                <div className="skeleton-line skeleton-text-medium"></div>
                <div className="skeleton-circle"></div>
              </div>
              <div className="skeleton-line skeleton-score"></div>
              <div className="team-box-side away" style={{ justifyContent: "flex-start" }}>
                <div className="skeleton-circle"></div>
                <div className="skeleton-line skeleton-text-medium"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="live-score-wrapper">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
          .live-score-wrapper { font-family: 'Roboto', Arial, sans-serif; background-color: #0f111a; min-height: 100vh; color: #b2bdcd; padding: 20px; }
          .live-score-container { max-width: 950px; margin: 0 auto; background-color: #151824; border-radius: 10px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.6); }
          
          .date-selector-bar { display: flex; background-color: #08090d; justify-content: space-between; padding: 12px; border-bottom: 1px solid #1f2436; transition: all 0.3s ease; }
          .date-selector-bar.hidden-bar { opacity: 0.15; pointer-events: none; }
          
          .date-tab { background: none; border: none; color: #5c6982; display: flex; flex-direction: column; align-items: center; padding: 8px 16px; cursor: pointer; border-radius: 6px; transition: all 0.2s; }
          .date-tab .day-name { font-size: 0.65rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
          .date-tab .day-num { font-size: 1.1rem; font-weight: 700; margin-top: 4px; }
          .date-tab.active { background-color: #fbbf24; color: #08090d; transform: scale(1.02); }

          .league-capsule-bar { display: flex; background-color: #12141f; padding: 14px 20px; gap: 12px; overflow-x: auto; border-bottom: 1px solid #1f2436; scrollbar-width: none; }
          .league-capsule-bar::-webkit-scrollbar { display: none; }
          
          .capsule-btn { background-color: #1a1e2d; border: 1px solid #293047; color: #9bb0cb; padding: 8px 18px; font-size: 0.8rem; font-weight: 700; border-radius: 30px; cursor: pointer; white-space: nowrap; transition: all 0.15s ease; outline: none; }
          .capsule-btn:hover { background-color: #22283b; border-color: #3b4566; color: #fff; }
          .capsule-btn.active { background-color: #fbbf24; border-color: #fbbf24; color: #08090d; box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2); }

          .capsule-btn.live-filter-btn { border-color: #3f1a1d; color: #f87171; }
          .capsule-btn.live-filter-btn .dot { color: #ef4444; margin-right: 5px; animation: pulse-live 1.5s infinite; }
          .capsule-btn.live-filter-btn.active { background-color: #ef4444; border-color: #ef4444; color: white; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
          .capsule-btn.live-filter-btn.active .dot { color: white; animation: none; }
          @keyframes pulse-live { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }

          .capsule-btn.fav-filter-btn { border-color: #3a321d; color: #fcd34d; }
          .capsule-btn.fav-filter-btn.active { background-color: #eab308; border-color: #eab308; color: #08090d; box-shadow: 0 4px 12px rgba(234, 179, 8, 0.3); }

          /* ✨ MEJORA DE DISEÑO DE TARJETAS (MÁS ESPACIO) */
          .match-card { display: flex; flex-direction: column; border-bottom: 1px solid #111420; background-color: #181c2b; padding: 18px 20px; transition: background 0.2s; cursor: pointer; }
          .match-card:hover { background-color: #1d2234; }
          
          /* Columna de favoritos fija con buen margen */
          .match-item-row-fav { display: grid; grid-template-columns: 40px 1fr; align-items: center; }
          /* Columna de estado / hora con ancho controlado */
          .match-item-row { display: grid; grid-template-columns: 140px 1fr; align-items: center; }
          
          .fav-star-btn { background: none; border: none; font-size: 1.35rem; color: #3b4252; cursor: pointer; transition: transform 0.15s, color 0.15s; padding: 0; outline: none; width: 100%; text-align: left; }
          .fav-star-btn:hover { transform: scale(1.2); color: #fcd34d; }
          .fav-star-btn.is-fav { color: #fbbf24; text-shadow: 0 0 8px rgba(251,191,36,0.4); }

          .status-badge { font-size: 0.65rem; font-weight: 700; padding: 5px 10px; border-radius: 4px; text-align: center; width: fit-content; color: white; letter-spacing: 0.3px; }
          .status-badge.live { background-color: #ef4444; }
          .status-badge.paused { background-color: #2d3748; color: #f59e0b; }
          .status-badge.finished { background-color: #4a5568; color: #a0aec0; }
          .status-badge.scheduled { background-color: #21518c; }
          
          .league-short-name { font-size: 0.65rem; color: #5c6982; margin-top: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
          
          /* Rejilla de marcadores limpia y holgada */
          .teams-score-display { display: grid; grid-template-columns: 1fr 85px 1fr; align-items: center; }
          .team-box-side { font-size: 1rem; font-weight: 500; color: #fff; display: flex; align-items: center; gap: 14px; }
          .team-box-side.home { justify-content: flex-end; text-align: right; }
          .team-box-side.away { justify-content: flex-start; text-align: left; }
          .team-crest { width: 26px; height: 26px; object-fit: contain; flex-shrink: 0; background-color: rgba(255,255,255,0.02); padding: 2px; border-radius: 4px; }
          
          .score-box-center { display: flex; align-items: center; justify-content: center; font-size: 1.35rem; font-weight: 700; color: #fbbf24; background-color: #08090d; padding: 6px 0; border-radius: 5px; letter-spacing: 2px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); }

          /* ⚽ DISEÑO PULIDO DEL PANEL DE EVENTOS */
          .match-events-dropdown { background-color: #111420; border-top: 1px dashed #23293d; margin: 14px -20px -18px -60px; padding: 14px 20px 14px 60px; display: flex; flex-direction: column; gap: 8px; animation: slideDown 0.2s ease-out; }
          @keyframes slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
          
          .event-row { display: grid; grid-template-columns: 1fr 45px 1fr; font-size: 0.8rem; color: #8a99ad; align-items: center; }
          .event-side { display: flex; align-items: center; gap: 8px; }
          .event-side.home { justify-content: flex-end; text-align: right; }
          .event-side.away { justify-content: flex-start; text-align: left; }
          .event-minute { text-align: center; font-weight: 700; color: #fbbf24; font-size: 0.75rem; background-color: #08090d; padding: 3px 6px; border-radius: 4px; width: fit-content; margin: 0 auto; }
          
          @keyframes shimmer { 0% { background-position: -450px 0; } 100% { background-position: 450px 0; } }
          .skeleton-card { pointer-events: none; }
          .skeleton-line { background: linear-gradient(to right, #1a1e2d 8%, #242a3f 18%, #1a1e2d 33%); background-size: 900px 104px; animation: shimmer 1.5s infinite linear; border-radius: 4px; }
          .skeleton-circle { width: 24px; height: 24px; border-radius: 4px; background: linear-gradient(to right, #1a1e2d 8%, #242a3f 18%, #1a1e2d 33%); background-size: 900px 104px; animation: shimmer 1.5s infinite linear; }
          .skeleton-badge { width: 70px; height: 18px; }
          .skeleton-text-short { width: 85px; height: 12px; }
          .skeleton-text-medium { width: 110px; height: 16px; }
          .skeleton-score { width: 60px; height: 28px; margin: 0 auto; }
        `}
      </style>

      <div className="live-score-container">
        <div className={`date-selector-bar ${soloEnVivo || verFavoritos ? "hidden-bar" : ""}`}>
          {listaDeDias.map((dia, i) => (
            <button key={i} className={`date-tab ${!soloEnVivo && !verFavoritos && fechaSeleccionada === dia.iso ? "active" : ""}`} onClick={() => { setSoloEnVivo(false); setVerFavoritos(false); setFechaSeleccionada(dia.iso); setPartidoExpandido(null); }}>
              <span className="day-name">{dia.nombre}</span>
              <span className="day-num">{dia.numero}</span>
            </button>
          ))}
        </div>

        <div className="league-capsule-bar">
          <button
            className={`capsule-btn fav-filter-btn ${verFavoritos ? "active" : ""}`}
            onClick={() => {
              setVerFavoritos(!verFavoritos);
              setSoloEnVivo(false);
              setPartidoExpandido(null);
            }}
          >
            ⭐ Mis Partidos ({(favoritos || []).length})
          </button>

          <button className={`capsule-btn live-filter-btn ${soloEnVivo ? "active" : ""}`} onClick={() => { setSoloEnVivo(!soloEnVivo); setVerFavoritos(false); setPartidoExpandido(null); }}>
            <span className="dot">●</span> En Vivo
          </button>

          {!verFavoritos && (
            <>
              <button className={`capsule-btn ${!soloEnVivo && ligaSeleccionada === "TODAS" ? "active" : ""}`} onClick={() => setLigaSeleccionada("TODAS")}>⚽ Todas las Ligas</button>
              <button className={`capsule-btn ${ligaSeleccionada === "PD" ? "active" : ""}`} onClick={() => setLigaSeleccionada("PD")}>🇪🇸 LaLiga</button>
              <button className={`capsule-btn ${ligaSeleccionada === "PL" ? "active" : ""}`} onClick={() => setLigaSeleccionada("PL")}>🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League</button>
              <button className={`capsule-btn ${ligaSeleccionada === "BL1" ? "active" : ""}`} onClick={() => setLigaSeleccionada("BL1")}>🇩🇪 Bundesliga</button>
              <button className={`capsule-btn ${ligaSeleccionada === "SA" ? "active" : ""}`} onClick={() => setLigaSeleccionada("SA")}>🇮🇹 Serie A</button>
              <button className={`capsule-btn ${ligaSeleccionada === "WC" ? "active" : ""}`} onClick={() => setLigaSeleccionada("WC")}>🏆 Mundial FIFA</button>
            </>
          )}
        </div>

        <div className="matches-list-holder">
          {error && <div style={{ padding: "15px", color: "#f87171", textAlign: "center" }}>{error}</div>}

          {loading && allPartidos.length === 0 ? (
            renderEsqueletosDeCarga()
          ) : partidosFiltrados.length > 0 ? (
            partidosFiltrados.map((match) => (
              <div key={match.id} className="match-card" onClick={() => toggleExpandirPartido(match.id)}>
                <div className="match-item-row-fav">

                  {/* ⭐ BOTÓN ESTRELLA CON COLUMNA PROPIA */}
                  <button
                    className={`fav-star-btn ${(favoritos || []).includes(match.id) ? "is-fav" : ""}`}
                    onClick={(e) => toggleFavorito(e, match.id)}
                  >
                    {(favoritos || []).includes(match.id) ? "★" : "☆"}
                  </button>

                  <div className="match-item-row">
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {renderEstado(match)}
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

                {/* PANEL EXPANDIBLE PROTEGIDO */}
                {partidoExpandido === match.id && (
                  <div className="match-events-dropdown" onClick={(e) => e.stopPropagation()}>
                    {match?.events?.length > 0 ? (
                      match.events.map((evt, idx) => (
                        <div key={idx} className="event-row">
                          <div className="event-side home">
                            {evt.team === "home" && (
                              <><span>{evt.player}</span><span style={{ fontSize: "0.85rem" }}>⚽</span></>
                            )}
                          </div>
                          <div className="event-minute">{evt.minute}'</div>
                          <div className="event-side away">
                            {evt.team === "away" && (
                              <><span style={{ fontSize: "0.85rem" }}>⚽</span><span>{evt.player}</span></>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: "center", color: "#4a5568", fontSize: "0.75rem" }}>
                        🏃 Sin eventos destacados o goles registrados.
                      </div>
                    )}
                  </div>
                )}

                {partidoExpandido === match.id && (!match.events || match.events.length === 0) && (
                  <div className="match-events-dropdown" style={{ textAlign: "center", color: "#4a5568", fontSize: "0.75rem" }} onClick={(e) => e.stopPropagation()}>
                    🏃 Sin eventos destacados o goles registrados en este encuentro.
                  </div>
                )}

              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#5c6982" }}>
              {obtenerMensajeVacio()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};