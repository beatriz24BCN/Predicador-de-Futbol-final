import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RulesCard } from '../components/RulesCard';
import '../Ranking.css';

export const Ranking = () => {
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);

  const fetchRanking = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ranking?t=${new Date().getTime()}`);
      if (!response.ok) throw new Error("Error al cargar el ranking desde el servidor");
      const data = await response.json();
      setRankingData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  // Función para disparar al Bot Evaluador del Backend
  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const response = await fetch('/api/evaluate', { method: 'POST' });
      const result = await response.json();
      alert(result.msg); // Mostramos el mensaje (ej. "Se evaluaron 5 predicciones nuevas")
      await fetchRanking(); // Recargamos el ranking para ver los nuevos puntos
    } catch (err) {
      alert("Error al intentar evaluar predicciones: " + err.message);
    } finally {
      setEvaluating(false);
    }
  };

  const getMedal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRowClass = (rank) => {
    if (rank === 1) return "rank-1";
    if (rank === 2) return "rank-2";
    if (rank === 3) return "rank-3";
    return "";
  };

  if (loading) return <div className="gt-loader">Calculando posiciones globales...</div>;
  if (error) return <div className="gt-error-container">{error}</div>;

  return (
    <div className="gt-ranking-container animate-fade-in">

      <div className="gt-ranking-header">
        <h1 className="gt-ranking-title"><span>RANKING</span> GLOBAL</h1>
        <RulesCard />
        <p className="gt-subtitle">Los mejores predictores de la temporada</p>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <Link to="/quiniela" className="gt-btn-secondary">
            ← Volver a la Quiniela
          </Link>

          {/* NUEVO: Botón para llamar al Bot Evaluador */}
          <button
            onClick={handleEvaluate}
            disabled={evaluating}
            className="gt-btn-atomic"
            style={{ borderColor: 'var(--neon-green)', color: 'var(--neon-green)' }}
          >
            {evaluating ? "Evaluando partidos..." : "⚡ Actualizar Puntuaciones"}
          </button>
        </div>
      </div>

      {rankingData.length === 0 ? (
        <div className="gt-no-matches">Aún no hay predicciones evaluadas en el sistema. ¡Sé el primero en participar!</div>
      ) : (
        <div className="gt-ranking-list">
          {rankingData.map((user, index) => (
            <div
              key={user.user_id}
              className={`gt-ranking-card ${getRowClass(user.rank)}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="gt-rank-position">{getMedal(user.rank)}</div>
              <div className="gt-rank-user">
                {user.username}
                {user.rank === 1 && <span style={{ fontSize: '0.8rem', marginLeft: '5px' }}>👑</span>}
              </div>
              <div className="gt-rank-points">
                {user.points} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PTS</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="gt-support-alert">
        ¿Problemas con tus predicciones o notas algún error? <br />
        Contacta a Soporte Técnico: <strong>+1 (555) 123-4567</strong> | <a href="mailto:soporte@quiniela.app">soporte@quiniela.app</a>
      </div>
    </div>
  );
};