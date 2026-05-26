import { useEffect, useState } from "react";

export default function ProfileModal({ isOpen, onClose }) {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const loadUser = () => {
      const saved = JSON.parse(localStorage.getItem("user"));
      if (saved) {
        setUser(saved);
        setTeams(saved.teams || []);
      }
    };

    loadUser();
    window.addEventListener("userUpdated", loadUser);

    return () => {
      window.removeEventListener("userUpdated", loadUser);
    };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  // 🔥 CLICK EN EQUIPO
  const toggleTeam = (team) => {
    let updatedTeams;

    if (teams.includes(team)) {
      updatedTeams = teams.filter(t => t !== team);
    } else {
      updatedTeams = [...teams, team];
    }

    const newPrediction = {
      match: team,
      prediction: "Seleccionado",
      date: new Date().toLocaleDateString()
    };

    const updatedUser = {
      ...user,
      teams: updatedTeams,
      predictions: [
        ...(user.predictions || []),
        newPrediction
      ],
      points: (user.points || 0) + 10 // 🔥 suma puntos
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    // 🔥 ACTUALIZAR RANKING GLOBAL
    let users = JSON.parse(localStorage.getItem("users")) || [];

    const index = users.findIndex(u => u.username === updatedUser.username);

    if (index !== -1) {
      users[index] = updatedUser;
    } else {
      users.push(updatedUser);
    }

    localStorage.setItem("users", JSON.stringify(users));

    setTeams(updatedTeams);
    setUser(updatedUser);

    window.dispatchEvent(new Event("userUpdated"));
  };

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const leagues = {
    "🇪🇸 LaLiga": [
      "Real Madrid", "Barcelona", "Atlético", "Sevilla"
    ],
    "🏴 Premier League": [
      "Man City", "Liverpool", "Arsenal", "Chelsea"
    ],
    "🇮🇹 Serie A": [
      "Juventus", "Milan", "Inter"
    ]
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="profile-card" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="header">
          <h2>Mi Perfil</h2>
          <span className="close" onClick={onClose}>✕</span>
        </div>

        {/* USER */}
        <div className="user-box">
          <div className="avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3>{user.username}</h3>
            <p>{user.points || 0} puntos</p>
          </div>
        </div>

        <div className="divider"></div>

        {/* EQUIPOS */}
        <div className="section">
          <p className="title">Equipos favoritos</p>

          {Object.entries(leagues).map(([league, teamList]) => (
            <div key={league} className="league">
              <p className="league-title">{league}</p>

              <div className="chips">
                {teamList.map(team => (
                  <span
                    key={team}
                    className={teams.includes(team) ? "active" : ""}
                    onClick={() => toggleTeam(team)}
                  >
                    {team}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="divider"></div>

        {/* HISTORIAL */}
        <div className="section">
          <p className="title">Historial</p>

          {user.predictions && user.predictions.length > 0 ? (
            user.predictions.map((p, index) => (
              <div key={index} className="prediction-item">
                <p>{p.match}</p>
                <p>{p.prediction}</p>
                <small>{p.date}</small>
              </div>
            ))
          ) : (
            <small className="empty">Sin actividad</small>
          )}
        </div>

        <div className="divider"></div>

        {/* 🏆 RANKING */}
        <div className="section">
          <p className="title">🏆 Ranking</p>

          {(() => {
            const users = JSON.parse(localStorage.getItem("users")) || [];

            const sorted = [...users].sort(
              (a, b) => (b.points || 0) - (a.points || 0)
            );

            return sorted.length > 0 ? (
              sorted.map((u, i) => (
                <div key={i} className="ranking-item">
                  <span>#{i + 1} {u.username}</span>
                  <span>{u.points || 0} pts</span>
                </div>
              ))
            ) : (
              <small>No hay ranking aún</small>
            );
          })()}
        </div>

        {/* LOGOUT */}
        <button className="logout" onClick={logout}>
          Cerrar sesión
        </button>

      </div>
    </div>
  );
}                                                                                                            