import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { TeamForm } from '../components/TeamForm';
import { footballService } from '../services/footballService';
import { predictionService } from '../services/predictionService';
import '../quiniela.css';

export const Quiniela = () => {
  // --- Estados de Datos ---
 const [fixtures, setFixtures] = useState([]);
  const [teamForms, setTeamForms] = useState({});
  const [predictions, setPredictions] = useState({});
  
  // --- Estados de UI / UX ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStats, setActiveStats] = useState({});
  const [loadingStats, setLoadingStats] = useState({});
  const [submittingStatus, setSubmittingStatus] = useState({});

  // --- Carga Inicial de Datos (Estrategia Separada) ---
  useEffect(() => {
    const loadWeeklyFixtures = async () => {
      try {
        setLoading(true);
        const { matches, forms } = await footballService.getWeeklyEliteFixtures();
        
        setFixtures(matches || []);
        setTeamForms(forms || {});
      } catch (err) {
        setError("No se pudieron sincronizar los partidos de la jornada semanal.");
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyFixtures();
  }, []);

  // --- Manejadores de Eventos (Memorizados con useCallback) ---
  const handleToggleStats = useCallback(async (fixtureId, teamHomeId, teamAwayId) => {
    if (activeStats[fixtureId]) {
      setActiveStats(prev => ({ ...prev, [fixtureId]: null }));
      return;
    }

    setLoadingStats(prev => ({ ...prev, [fixtureId]: true }));
    try {
      const summary = await footballService.getH2HSummary(teamHomeId, teamAwayId);
      setActiveStats(prev => ({ ...prev, [fixtureId]: summary }));
    } catch (err) {
      console.error(`[H2H Error] Fallo al cargar estadísticas:`, err);
    } finally {
      setLoadingStats(prev => ({ ...prev, [fixtureId]: false }));
    }
  }, [activeStats]);

  const handlePredictionChange = useCallback((fixtureId, type, value) => {
    const parsedValue = value === "" ? "" : parseInt(value, 10);
    setPredictions(prev => ({
      ...prev,
      [fixtureId]: { ...prev[fixtureId], [type]: parsedValue }
    }));
  }, []);

  const handleSendSinglePrediction = async (fixtureId) => {
    const matchPrediction = predictions[fixtureId];
    if (!matchPrediction || matchPrediction.home === undefined || matchPrediction.away === undefined) {
      alert("Por favor, introduce ambos marcadores antes de enviar.");
      return;
    }

    setSubmittingStatus(prev => ({ ...prev, [fixtureId]: 'loading' }));
    try {
      await predictionService.submit({
        fixtureId,
        homeGoals: matchPrediction.home,
        awayGoals: matchPrediction.away
      });
      setSubmittingStatus(prev => ({ ...prev, [fixtureId]: 'success' }));
      setTimeout(() => setSubmittingStatus(prev => ({ ...prev, [fixtureId]: null })), 3000);
    } catch (err) {
      setSubmittingStatus(prev => ({ ...prev, [fixtureId]: 'error' }));
    }
  };

  // --- Helpers de Renderizado ---
  const getButtonClass = (status) => {
    const baseClass = 'gt-btn-atomic';
    if (!status) return baseClass;
    return `${baseClass} ${status}`;
  };

  if (loading) return <div className="gt-loader">Cargando cartelera de élite semanal y estados de forma...</div>;
  if (error) return <div className="gt-error-container">{error}</div>;

  return (
    <div className="gt-quiniela-container">
      <header className="gt-header">
        <h1 className="gt-title">GOAL <span>HUB</span></h1>
        <p className="gt-subtitle">La Quiniela Inteligente — Próximos 7 Días</p>
      </header>

      <div className="gt-fixtures-grid">
        {!fixtures || fixtures.length === 0 ? (
          <p className="gt-no-matches">No hay partidos de élite programados para los próximos 7 días.</p>
        ) : (
          fixtures.map(match => {
            const fId = match.fixture.id;
            const currentMatchPred = predictions[fId] || { home: "", away: "" };
            const status = submittingStatus[fId];
            const statusShort = match.fixture.status.short;
            
            const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(statusShort);
            const isFinished = ['FT', 'AET', 'PEN'].includes(statusShort);
            
            const matchDateObj = new Date(match.fixture.date);
            const matchDay = matchDateObj.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
            const matchTime = matchDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={fId} className="gt-card">
                <div className="gt-card-league-row">
                  <div className="gt-card-league">
                    {match.league.flag && <img src={match.league.flag} alt="" className="gt-flag" />}
                    <span>{match.league.name}</span>
                  </div>

                  <div className="gt-time-status-container">
                    {isLive ? (
                      <span className="gt-badge-live">
                        <span className="gt-pulse-dot"></span> EN VIVO ({match.fixture.status.elapsed}')
                      </span>
                    ) : isFinished ? (
                      <span className="gt-badge-finished">🏁 FINALIZADO</span>
                    ) : (
                      <span className="gt-badge-time">📅 {matchDay} - ⏰ {matchTime}</span>
                    )}
                  </div>
                </div>

                <div className="gt-match-core">
                  <div className="gt-team local">
                    <img src={match.teams.home.logo} alt="" className="gt-team-logo" />
                    <span className="gt-team-name">{match.teams.home.name}</span>
                    <TeamForm formString={teamForms?.[match.teams.home.id] || ""}/>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      className="gt-input-score"
                      value={currentMatchPred.home}
                      onChange={(e) => handlePredictionChange(fId, 'home', e.target.value)}
                      disabled={status === 'loading' || status === 'success'}
                    />
                  </div>

                  <div className="gt-vs">VS</div>

                  <div className="gt-team away">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      className="gt-input-score"
                      value={currentMatchPred.away}
                      onChange={(e) => handlePredictionChange(fId, 'away', e.target.value)}
                      disabled={status === 'loading' || status === 'success'}
                    />
                    <span className="gt-team-name">{match.teams.away.name}</span>
                    <TeamForm formString={teamForms?.[match.teams.away.id] || ""}/>
                    <img src={match.teams.away.logo} alt="" className="gt-team-logo" />
                  </div>
                </div>

                <div className="gt-stats-trigger-zone">
                  <button
                    type="button"
                    className={`gt-btn-stats-toggle ${activeStats[fId] ? 'active' : ''}`}
                    onClick={() => handleToggleStats(fId, match.teams.home.id, match.teams.away.id)}
                  >
                    {loadingStats[fId] ? (
                      <><span className="gt-spinner-mini"></span> Analizando tendencias...</>
                    ) : activeStats[fId] ? (
                      '▲ Ocultar Historial'
                    ) : (
                      '📊 Ver Historial'
                    )}
                  </button>
                </div>

                {activeStats[fId] && (
                  <div className="gt-stats-panel animate-fade-in">
                    <div className="gt-stats-title">Últimos {activeStats[fId].total} enfrentamientos directos:</div>
                    <div className="gt-stats-bars">
                      <div className="gt-stat-bar-item">
                        <span className="gt-stat-label">Victorias {match.teams.home.name}:</span>
                        <span className="gt-stat-val">{activeStats[fId].homeWins}</span>
                      </div>
                      <div className="gt-stat-bar-item">
                        <span className="gt-stat-label">Empates:</span>
                        <span className="gt-stat-val">{activeStats[fId].draws}</span>
                      </div>
                      <div className="gt-stat-bar-item">
                        <span className="gt-stat-label">Victorias {match.teams.away.name}:</span>
                        <span className="gt-stat-val">{activeStats[fId].awayWins}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="gt-action-area">
                  <Link to={`/liga/${encodeURIComponent(match.league.name.toLowerCase().replace(/ /g, "-"))}`} className="gt-btn-secondary">
                    Detalles
                  </Link>
                  <button
                    className={getButtonClass(status)}
                    onClick={() => handleSendSinglePrediction(fId)}
                    disabled={status === 'loading' || status === 'success'}
                  >
                    {status === 'loading' && 'Guardando...'}
                    {status === 'success' && '✓ Guardado'}
                    {status === 'error' && '⚡ Reintentar'}
                    {!status && 'Enviar Predicción'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};