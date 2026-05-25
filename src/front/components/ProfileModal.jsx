import { useEffect, useState } from "react";

export default function ProfileModal({ isOpen, onClose }) {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUser(savedUser);
      setTeams(savedUser.teams || []);
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const toggleTeam = (team) => {
    let updatedTeams;

    if (teams.includes(team)) {
      updatedTeams = teams.filter(t => t !== team);
    } else {
      updatedTeams = [...teams, team];
    }

    setTeams(updatedTeams);

    const updatedUser = {
      ...user,
      teams: updatedTeams
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.clear();
    window.location.reload(); // 🔥 actualiza toda la app
  };

  const leagues = {
    "🇪🇸 LaLiga": [
      "Real Madrid", "Barcelona", "Atlético", "Sevilla",
      "Valencia", "Betis", "Villarreal", "Real Sociedad"
    ],
    "🏴 Premier League": [
      "Man City", "Liverpool", "Arsenal", "Chelsea",
      "Man United", "Tottenham"
    ],
    "🇮🇹 Serie A": [
      "Juventus", "Milan", "Inter", "Napoli", "Roma", "Lazio"
    ],
    "🇩🇪 Bundesliga": [
      "Bayern", "Dortmund", "Leipzig", "Leverkusen"
    ],
    "🇫🇷 Ligue 1": [
      "PSG", "Marseille", "Lyon", "Monaco"
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

        {/* USER INFO */}
        <div className="user-box">
          <div className="avatar">
            {user.username?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3>{user.username}</h3>
            <p>{user.points || teams.length * 10} puntos</p>
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
                    className={teams.includes(team) ? "chip active" : "chip"}
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