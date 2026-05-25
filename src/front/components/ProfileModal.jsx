import { useEffect, useState } from "react";

export default function ProfileModal({ isOpen, onClose }) {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("user"));
    if (saved) {
      setUser(saved);
      setTeams(saved.teams || []);
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const toggleTeam = (team) => {
    let updated = teams.includes(team)
      ? teams.filter(t => t !== team)
      : [...teams, team];

    setTeams(updated);

    const updatedUser = { ...user, teams: updated };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
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
            <p>{teams.length * 10} puntos</p>
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
          <p className="title">Historial de predicciones</p>
          <small className="empty">Aún no tienes predicciones</small>
        </div>

        {/* LOGOUT */}
        <button className="logout" onClick={logout}>
          Cerrar sesión
        </button>

      </div>
    </div>
  );
}                                                                                                                    