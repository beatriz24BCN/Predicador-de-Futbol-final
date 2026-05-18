import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TeamForm } from '../components/TeamForm';
import '../quiniela.css';

const ELITE_LEAGUE_IDS = [
  140, // La Liga (España)
  63,  // Premier League
  61,  // Ligue 1 (Francia)
  135, // Serie A (Italia)
  78,  // Bundesliga (Alemania)
  1,   // Copa Mundial de la FIFA
  2,   // Champions League
];
const API_KEY = '00d395e95b082e25400302ec63efed87';
const HEADERS = { 'Accept': 'application/json', 'x-apisports-key': API_KEY };

export const Quiniela = () => {
  const [fixtures, setFixtures] = useState([]);
  const [teamForms, setTeamForms] = useState({}); 
  const [predictions, setPredictions] = useState({});
  const [submittingStatus, setSubmittingStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeStats, setActiveStats] = useState({});
  const [loadingStats, setLoadingStats] = useState({});

  useEffect(() => {
    const initializeData = async () => {
      // 1. Cálculo del rango de fechas (Hoy -> Próximos 7 días)
      const todayObj = new Date();
      const nextWeekObj = new Date();
      nextWeekObj.setDate(todayObj.getDate() + 7);

      const todayStr = todayObj.toISOString().split('T')[0];
      const nextWeekStr = nextWeekObj.toISOString().split('T')[0];

      // Identificador único de caché para este rango semanal
      const cacheKey = `gt_data_weekly_${todayStr}`;
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData) {
        const { cachedFixtures, cachedForms } = JSON.parse(cachedData);
        setFixtures(cachedFixtures);
        setTeamForms(cachedForms);
        setLoading(false);
        return;
      }

      try {
        // 2. Fetch usando parámetros de rango (from / to)
        const URL = `https://v3.football.api-sports.io/fixtures?from=${todayStr}&to=${nextWeekStr}`;
        const fixturesRes = await fetch(URL, { method: 'GET', headers: HEADERS });
        if (!fixturesRes.ok) throw new Error(`Error Fixtures: ${fixturesRes.status}`);

        const fixturesData = await fixturesRes.json();
        const allMatches = fixturesData.response || [];
        
        // Filtrar y ordenar cronológicamente
        const filteredMatches = allMatches
          .filter(match => ELITE_LEAGUE_IDS.includes(match.league.id))
          .sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));
          
        setFixtures(filteredMatches);

        // 3. Token-Saving Strategy adaptada a la semana
        const activeLeaguesThisWeek = [...new Set(filteredMatches.map(match => match.league.id))];
        const currentYear = todayObj.getFullYear();

        const formsMap = {};
        const standingsPromises = activeLeaguesThisWeek.map(async (leagueId) => {
          try {
            const standingsRes = await fetch(`https://v3.football.api-sports.io/standings?league=${leagueId}&season=${currentYear}`, { method: 'GET', headers: HEADERS });
            if (!standingsRes.ok) return;
            const standingsData = await standingsRes.json();

            const standingsLeague = standingsData.response?.[0]?.league?.standings?.[0] || [];
            standingsLeague.forEach(item => {
              if (item.team?.id && item.form) {
                formsMap[item.team.id] = item.form;
              }
            });
          } catch (e) {
            console.error(`Error cargando standings de liga ${leagueId}:`, e);
          }
        });

        await Promise.all(standingsPromises);
        setTeamForms(formsMap);

        // Guardar en caché semanal
        localStorage.setItem(cacheKey, JSON.stringify({
          cachedFixtures: filteredMatches,
          cachedForms: formsMap
        }));

      } catch (err) {
        console.error("Error en sincronización Full-Stack:", err.message);
        setError("No se pudieron sincronizar los partidos de la jornada semanal.");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const toggleStats = async (fixtureId, teamHomeId, teamAwayId) => {
    if (activeStats[fixtureId]) {
      setActiveStats(prev => ({ ...prev, [fixtureId]: null }));
      return;
    }

    setLoadingStats(prev => ({ ...prev, [fixtureId]: true }));

    try {
      const API_URL = `https://v3.football.api-sports.io/fixtures/headtohead?h2h=${teamHomeId}-${teamAwayId}&last=5`;
      const response = await fetch(API_URL, { method: 'GET', headers: HEADERS });
      if (!response.ok) throw new Error();

      const data = await response.json();
      const history = data.response || [];

      const summary = history.reduce((acc, matchItem) => {
        const homeGoals = matchItem.goals.home;
        const awayGoals = matchItem.goals.away;

        if (homeGoals !== null && awayGoals !== null) {
          if (homeGoals > awayGoals) acc.homeWins++;
          else if (awayGoals > homeGoals) acc.awayWins++;
          else acc.draws++;
          acc.total++;
        }
        return acc;
      }, { homeWins: 0, draws: 0, awayWins: 0, total: 0 });

      setActiveStats(prev => ({ ...prev, [fixtureId]: summary }));
    } catch (err) {
      console.error("Error cargando estadísticas H2H:", err);
    } finally {
      setLoadingStats(prev => ({ ...prev, [fixtureId]: false }));
    }
  };

  const handlePredictionChange = (fixtureId, type, value) => {
    const parsedValue = value === "" ? "" : parseInt(value, 10);
    setPredictions(prev => ({
      ...prev,
      [fixtureId]: { ...prev[fixtureId], [type]: parsedValue }
    }));
  };

  const handleSendSinglePrediction = async (fixtureId) => {
    const matchPrediction = predictions[fixtureId];
    if (!matchPrediction || matchPrediction.home === undefined || matchPrediction.home === "" || matchPrediction.away === undefined || matchPrediction.away === "") {
      alert("Por favor, introduce ambos marcadores antes de enviar.");
      return;
    }

    setSubmittingStatus(prev => ({ ...prev, [fixtureId]: 'loading' }));

    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predictions: [{
            fixture_id: fixtureId,
            home_goals: matchPrediction.home,
            away_goals: matchPrediction.away
          }]
        })
      });

      if (!response.ok) throw new Error();
      setSubmittingStatus(prev => ({ ...prev, [fixtureId]: 'success' }));
      setTimeout(() => setSubmittingStatus(prev => ({ ...prev, [fixtureId]: null })), 3000);
    } catch (err) {
      setSubmittingStatus(prev => ({ ...prev, [fixtureId]: 'error' }));
    }
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
        {fixtures.length === 0 ? (
          <p className="gt-no-matches">No hay partidos de élite programados para los próximos 7 días.</p>
        ) : (
          fixtures.map(match => {
            const fId = match.fixture.id;
            const currentMatchPred = predictions[fId] || { home: "", away: "" };
            const status = submittingStatus[fId];

            const statusShort = match.fixture.status.short;
            const liveStatuses = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'];
            const finishedStatuses = ['FT', 'AET', 'PEN'];
            const isLive = liveStatuses.includes(statusShort);
            const isFinished = finishedStatuses.includes(statusShort);
            
            // formateo de fecha y hora para visualización multijornada
            const matchDateObj = new Date(match.fixture.date);
            const matchDay = matchDateObj.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
            const matchTime = matchDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const getButtonClass = () => {
              if (status === 'loading') return 'gt-btn-atomic loading';
              if (status === 'success') return 'gt-btn-atomic success';
              if (status === 'error') return 'gt-btn-atomic error';
              return 'gt-btn-atomic';
            };

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
                    <TeamForm formString={teamForms[match.teams.home.id]} />
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
                    <TeamForm formString={teamForms[match.teams.away.id]} />
                    <img src={match.teams.away.logo} alt="" className="gt-team-logo" />
                  </div>
                </div>

                <div className="gt-stats-trigger-zone">
                  <button
                    type="button"
                    className={`gt-btn-stats-toggle ${activeStats[fId] ? 'active' : ''}`}
                    onClick={() => toggleStats(fId, match.teams.home.id, match.teams.away.id)}
                  >
                    {loadingStats[fId] ? (
                      <>
                        <span className="gt-spinner-mini"></span> Analizando tendencias...
                      </>
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
                  <Link
                    to={`/liga/${encodeURIComponent(match.league.name.toLowerCase().replace(/ /g, "-"))}`}
                    className="gt-btn-secondary"
                  >
                    Detalles
                  </Link>
                  <button
                    className={getButtonClass()}
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