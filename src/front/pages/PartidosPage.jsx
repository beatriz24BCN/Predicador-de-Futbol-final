import { useEffect, useState } from "react";

export default function ProfileModal({ isOpen, onClose }) {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      const saved = JSON.parse(localStorage.getItem("user"));
      if (saved) {
        setUser(saved);
        setTeams(saved.teams || []);
      }
    };

    loadUser();

    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (currentUser) {
      let users = JSON.parse(localStorage.getItem("users")) || [];

      const index = users.findIndex(u => u.username === currentUser.username);

      if (index !== -1) {
        users[index] = currentUser;
      } else {
        users.push(currentUser);
      }

      localStorage.setItem("users", JSON.stringify(users));
    }

    const message = localStorage.getItem("welcomeMessage");

    if (message) {
      setToast(message);
      localStorage.removeItem("welcomeMessage");
      setTimeout(() => setToast(null), 2500);
    }

    window.addEventListener("userUpdated", loadUser);

    return () => {
      window.removeEventListener("userUpdated", loadUser);
    };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const toggleTeam = (team) => {
    let updatedTeams = teams.includes(team)
      ? teams.filter(t => t !== team)
      : [...teams, team];

    const updatedUser = {
      ...user,
      teams: updatedTeams
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    setTeams(updatedTeams);
    setUser(updatedUser);

    window.dispatchEvent(new Event("userUpdated"));
  };

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const leagues = {
    "🇪🇸 LaLiga": ["Real Madrid", "Barcelona", "Atlético", "Sevilla"],
    "🏴 Premier League": ["Man City", "Liverpool", "Arsenal", "Chelsea"],
    "🇮🇹 Serie A": ["Juventus", "Milan", "Inter"]
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

          <div className="user-info">
            <h3>{user.username}</h3>
            <p>{user.points || 0} puntos</p>

            {user.points >= 120 && (
              <p style={{ color: "#22c55e", fontSize: "12px" }}>
                🎁 Recoge tu camiseta en la tienda
              </p>
            )}
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
                  <div
                    key={team}
                    className={`team-chip ${teams.includes(team) ? "active" : ""}`}
                    onClick={() => toggleTeam(team)}
                  >
                    <span>{team}</span>
                    {teams.includes(team) && <span>❤️</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="divider"></div>

        {/* RANKING */}
        <div className="section">
          <p className="title">🏆 Ranking</p>

          <p style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px" }}>
            🟩 +3 victoria • 🟦 +1 empate • 🟥 0 derrota
          </p>

          {(() => {
            const users = JSON.parse(localStorage.getItem("users")) || [];

            const sorted = [...users].sort(
              (a, b) => (b.points || 0) - (a.points || 0)
            );

            return sorted.length > 0 ? (
              sorted.map((u, i) => (
                <div key={i} className="ranking-item">

                  <div>
                    <span>#{i + 1} {u.username}</span>

                    {/* 🔥 CUADRADITOS */}
                    <div className="form">
                      {(u.predictions || []).slice(-5).map((p, idx) => (
                        <span
                          key={idx}
                          className={`form-box ${p.resultType}`}
                        ></span>
                      ))}
                    </div>
                  </div>

                  <span>{u.points || 0} pts</span>

                </div>
              ))
            ) : (
              <small>No hay ranking aún</small>
            );
          })()}
        </div>

        <button className="logout" onClick={logout}>
          Cerrar sesión
        </button>

        {toast && <div className="toast">{toast}</div>}

      </div>
    </div>
  );
}