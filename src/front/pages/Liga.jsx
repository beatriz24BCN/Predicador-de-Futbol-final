import React, { useEffect, useState } from "react";

export const Liga = () => {
  const [allPartidos, setAllPartidos] = useState([]);
  const [partidosFiltrados, setPartidosFiltrados] = useState([]);
  const [goleadores, setGoleadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGoleadores, setLoadingGoleadores] = useState(false);
  const [error, setError] = useState(null);
  const [listaDeDias, setListaDeDias] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [ligaSeleccionada, setLigaSeleccionada] = useState("TODAS");
  const [soloEnVivo, setSoloEnVivo] = useState(false);
  const [partidoExpandido, setPartidoExpandido] = useState(null);
  const [verFavoritos, setVerFavoritos] = useState(false);

  const [modoHistorico, setModoHistorico] = useState(false);
  const [jornadaSeleccionada, setJornadaSeleccionada] = useState(1);

  const [favoritos, setFavoritos] = useState(() => {
    try {
      const guardados = localStorage.getItem("mis_partidos_favoritos");
      return guardados ? JSON.parse(guardados) : [];
    } catch (e) { return []; }
  });

  // SOLUCONADO: URL dinámica que se adapta automáticamente a tu Codespace actual
  const baseUrl = window.location.origin.includes("github.dev")
    ? window.location.origin.replace("-3000", "-3001") + "/api/fixtures"
    : "http://localhost:3001/api/fixtures";

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

  const consultarNuestroBackend = async (historicoActivo = modoHistorico, jornada = jornadaSeleccionada, liga = ligaSeleccionada) => {
    try {
      setLoading(true);
      setError(null);
      let urlFinal = historicoActivo ? `${baseUrl}/historico?jornada=${jornada}` : baseUrl;

      if (liga !== "TODAS") {
        urlFinal += `${historicoActivo ? "&" : "?"}liga=${liga}`;
      }

      const res = await fetch(urlFinal);
      if (!res.ok) throw new Error("Error al conectar con el servidor");
      const data = await res.json();
      setAllPartidos(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const registrarGoleadores = async () => {
      if (ligaSeleccionada === "TODAS" || !modoHistorico) {
        setGoleadores([]);
        return;
      }
      try {
        setLoadingGoleadores(true);
        setGoleadores([]);
        const res = await fetch(`${baseUrl}/goleadores?liga=${ligaSeleccionada}`);
        if (res.ok) {
          const data = await res.json();
          setGoleadores(data || []);
        }
      } catch (err) {
        console.error("Error descargando goleadores:", err);
      } finally {
        setLoadingGoleadores(false);
      }
    };

    registrarGoleadores();
  }, [ligaSeleccionada, modoHistorico]);

  useEffect(() => {
    consultarNuestroBackend(modoHistorico, jornadaSeleccionada, ligaSeleccionada);

    if (!modoHistorico) {
      const intervalo = setInterval(() => consultarNuestroBackend(false, 1, ligaSeleccionada), 30000);
      return () => clearInterval(intervalo);
    }
  }, [modoHistorico, jornadaSeleccionada, ligaSeleccionada]);

  const resetearFiltros = () => {
    setLigaSeleccionada("TODAS");
    setVerFavoritos(false);
    setSoloEnVivo(false);
    setPartidoExpandido(null);
    setModoHistorico(false);
    setJornadaSeleccionada(1);
    setGoleadores([]);
  };

  useEffect(() => {
    let res = [...allPartidos];
    if (verFavoritos) {
      res = res.filter((p) => favoritos.includes(p.id));
    } else if (soloEnVivo) {
      res = res.filter((p) => ["IN_PLAY", "LIVE", "PAUSED"].includes(p.estado));
    } else {
      if (!modoHistorico) {
        res = res.filter((p) => p.fecha === fechaSeleccionada);
        if (ligaSeleccionada !== "TODAS") {
          res = res.filter((p) => p.codigo_liga === ligaSeleccionada);
        }
      }
    }
    const unicos = Array.from(new Set(res.map(p => p.id))).map(id => res.find(p => p.id === id));
    setPartidosFiltrados(unicos);
  }, [allPartidos, fechaSeleccionada, ligaSeleccionada, soloEnVivo, verFavoritos, favoritos, modoHistorico]);

  const toggleFavorito = (e, partidoId) => {
    e.stopPropagation();
    setFavoritos(prev => {
      const nuevos = prev.includes(partidoId) ? prev.filter(id => id !== partidoId) : [...prev, partidoId];
      localStorage.setItem("mis_partidos_favoritos", JSON.stringify(nuevos));
      return nuevos;
    });
  };

  return (
    <div className="live-score-wrapper">
      <style>{`
        .live-score-wrapper { font-family: Arial, sans-serif; background-color: #0f111a; min-height: 100vh; color: #b2bdcd; padding: 20px; }
        .live-score-container { max-width: 950px; margin: 0 auto; background-color: #151824; border-radius: 10px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.6); }
        .date-selector-bar { display: flex; background-color: #08090d; justify-content: space-between; padding: 12px; border-bottom: 1px solid #1f2436; }
        .date-tab { background: none; border: none; color: #5c6982; display: flex; flex-direction: column; align-items: center; padding: 8px 16px; cursor: pointer; border-radius: 6px; }
        .date-tab.active { background-color: #fbbf24; color: #08090d; font-weight: bold; }
        
        .jornada-selector-container { background-color: #08090d; padding: 14px 20px; display: flex; align-items: center; gap: 15px; border-bottom: 1px solid #1f2436; }
        .jornada-label { font-size: 0.85rem; font-weight: 700; color: #fbbf24; }
        .jornada-select { background-color: #1a1e2d; border: 1px solid #293047; color: #fff; padding: 6px 12px; border-radius: 6px; cursor: pointer; outline: none; }
        
        .league-capsule-bar { display: flex; background-color: #12141f; padding: 14px 20px; gap: 12px; overflow-x: auto; border-bottom: 1px solid #1f2436; }
        .capsule-btn { background-color: #1a1e2d; border: 1px solid #293047; color: #9bb0cb; padding: 8px 18px; font-size: 0.8rem; font-weight: 700; border-radius: 30px; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
        .capsule-btn.active { background-color: #fbbf24; color: #08090d; border-color: #fbbf24; }
        
        .scorers-section { background: linear-gradient(90deg, #1a1e2d 0%, #161926 100%); margin: 15px 20px; border-radius: 8px; border-left: 4px solid #fbbf24; overflow: hidden; padding: 12px 0; position: relative; }
        .scorers-section-title { font-size: 0.8rem; font-weight: bold; color: #fbbf24; padding: 0 15px 8px 15px; text-transform: uppercase; letter-spacing: 1px; }
        
        .ticker-wrapper { overflow: hidden; width: 100%; display: flex; }
        .ticker-track { display: flex; gap: 15px; width: max-content; animation: marquee 25s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .dynamic-scorer-card { background: #11131c; padding: 8px 16px; border-radius: 6px; min-width: 240px; border: 1px solid #22273a; display: flex; align-items: center; gap: 12px; transition: transform 0.2s, border-color 0.2s; }
        .dynamic-scorer-card:hover { transform: translateY(-2px); border-color: #fbbf24; background: #141724; }
        
        .player-face-photo { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid #29314f; background-color: #1a1f30; transition: border-color 0.2s; }
        .dynamic-scorer-card:hover .player-face-photo { border-color: #fbbf24; }

        .rank-badge { background: #fbbf24; color: #08090d; font-weight: 900; font-size: 0.75rem; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 50%; flex-shrink: 0; }
        .scorer-info-meta { display: flex; flex-direction: column; overflow: hidden; }
        .dynamic-name { font-size: 0.85rem; font-weight: bold; color: #fff; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
        .dynamic-team { font-size: 0.7rem; color: #768599; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; margin-top: 1px; }
        .dynamic-stat-pill { background: #22283a; color: #fbbf24; font-size: 0.75rem; font-weight: bold; padding: 4px 8px; border-radius: 4px; margin-left: auto; white-space: nowrap; border: 1px solid #2f3752; }

        .match-card { border-bottom: 1px solid #111420; background-color: #181c2b; padding: 18px 20px; cursor: pointer; transition: background 0.2s; }
        .match-card:hover { background-color: #1d2234; }
        .match-item-row-fav { display: grid; grid-template-columns: 40px 1fr; align-items: center; }
        .match-item-row { display: grid; grid-template-columns: 100px 1fr; align-items: center; gap: 10px; }
        
        .fav-star-btn { background: none; border: none; font-size: 1.35rem; color: #3b4252; cursor: pointer; text-align: left; padding: 0; outline: none; }
        .fav-star-btn.is-fav { color: #fbbf24; }
        
        .status-badge { font-size: 0.65rem; font-weight: 700; padding: 5px 10px; border-radius: 4px; text-align: center; color: white; width: fit-content; text-transform: uppercase; }
        .status-badge.finished { background-color: #4a5568; color: #cbd5e1; }
        
        .teams-score-display { display: grid; grid-template-columns: 1fr 100px 1fr; align-items: center; gap: 15px; }
        .team-box-side { font-size: 1rem; color: #fff; display: flex; align-items: center; gap: 10px; font-weight: 500; }
        .team-box-side.home { justify-content: flex-end; text-align: right; }
        .team-box-side.away { justify-content: flex-start; text-align: left; }
        .team-crest { width: 28px; height: 28px; object-fit: contain; flex-shrink: 0; }
        
        .score-box-center { display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; color: #fbbf24; background-color: #08090d; padding: 6px 12px; border-radius: 5px; min-width: 60px; text-align: center; letter-spacing: 1px; }
      `}</style>

      <div className="live-score-container">
        {modoHistorico ? (
          <div className="jornada-selector-container">
            <span className="jornada-label">📅 Temporada Anterior - Elige una Jornada:</span>
            <select className="jornada-select" value={jornadaSeleccionada} onChange={(e) => { setJornadaSeleccionada(Number(e.target.value)); setPartidoExpandido(null); }}>
              {Array.from({ length: 38 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Jornada {i + 1}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="date-selector-bar">
            {listaDeDias.map((dia, i) => (
              <button key={i} className={`date-tab ${fechaSeleccionada === dia.iso && !soloEnVivo && !verFavoritos ? "active" : ""}`} onClick={() => { setSoloEnVivo(false); setVerFavoritos(false); setFechaSeleccionada(dia.iso); setPartidoExpandido(null); }}>
                <span>{dia.nombre} {dia.numero}</span>
              </button>
            ))}
          </div>
        )}

        <div className="league-capsule-bar">
          <button className={`capsule-btn ${ligaSeleccionada === "TODAS" ? "active" : ""}`} onClick={resetearFiltros}>🌍 Todos</button>
          <button className={`capsule-btn ${modoHistorico ? "active" : ""}`} onClick={() => { setModoHistorico(!modoHistorico); setVerFavoritos(false); setSoloEnVivo(false); setPartidoExpandido(null); }}>📜 Histórico 24/25</button>
          <button className={`capsule-btn ${ligaSeleccionada === "PD" ? "active" : ""}`} onClick={() => setLigaSeleccionada("PD")}>🇪🇸 LaLiga</button>
          <button className={`capsule-btn ${ligaSeleccionada === "PL" ? "active" : ""}`} onClick={() => setLigaSeleccionada("PL")}>🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier</button>
          <button className={`capsule-btn ${ligaSeleccionada === "SA" ? "active" : ""}`} onClick={() => setLigaSeleccionada("SA")}>🇮🇹 Serie A</button>
          <button className={`capsule-btn ${ligaSeleccionada === "BL" ? "active" : ""}`} onClick={() => setLigaSeleccionada("BL")}>🇩🇪 Bundesliga</button>
        </div>

        {modoHistorico && ligaSeleccionada !== "TODAS" && (
          <div className="scorers-section">
            <div className="scorers-section-title">⚡ Máximos Anotadores en Movimiento</div>
            {loadingGoleadores ? (
              <div style={{ fontSize: "0.85rem", color: "#fbbf24", padding: "4px 15px" }}>Sincronizando tabla...</div>
            ) : goleadores.length > 0 ? (
              <div className="ticker-wrapper">
                <div className="ticker-track">
                  {[...goleadores, ...goleadores].map((sc, index) => (
                    <div key={index} className="dynamic-scorer-card">
                      <div className="rank-badge">{(index % goleadores.length) + 1}</div>

                      <div
                        className="player-face-photo"
                        style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', display: 'block' }}
                        dangerouslySetInnerHTML={{ __html: sc.svg || '<svg fill="#222"></svg>' }}
                      />

                      <div className="scorer-info-meta">
                        <span className="dynamic-name">{sc.nombre}</span>
                        <span className="dynamic-team">{sc.equipo}</span>
                      </div>
                      <span className="dynamic-stat-pill">{sc.goles} ⚽</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "0.85rem", color: "#5c6982", padding: "4px 15px" }}>No disponible temporalmente.</div>
            )}
          </div>
        )}

        <div className="matches-list-holder">
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#fbbf24" }}>Cargando partidos históricos...</div>
          ) : partidosFiltrados.length > 0 ? (
            partidosFiltrados.map((match) => (
              <div key={match.id} className="match-card" onClick={() => setPartidoExpandido(partidoExpandido === match.id ? null : match.id)}>
                <div className="match-item-row-fav">
                  <button className={`fav-star-btn ${favoritos.includes(match.id) ? "is-fav" : ""}`} onClick={(e) => toggleFavorito(e, match.id)}>
                    {favoritos.includes(match.id) ? "★" : "☆"}
                  </button>
                  <div className="match-item-row">
                    <div>
                      <span className="status-badge finished">
                        {match.estado === "FINISHED" ? "Finalizado" : match.estado}
                      </span>
                    </div>
                    <div className="teams-score-display">
                      <div className="team-box-side home">
                        <span>{match.teams.home.name}</span>
                        {match.teams.home.crest && <img src={match.teams.home.crest} alt="" className="team-crest" />}
                      </div>
                      <div className="score-box-center">
                        {match.goals.home} - {match.goals.away}
                      </div>
                      <div className="team-box-side away">
                        {match.teams.away.crest && <img src={match.teams.away.crest} alt="" className="team-crest" />}
                        <span>{match.teams.away.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "40px", color: "#5c6982" }}>No hay partidos registrados para esta selección.</div>
          )}
        </div>
      </div>
    </div>
  );
};