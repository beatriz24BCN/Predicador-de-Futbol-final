import { useState, useEffect } from "react";

export default function PartidosPage() {
  const [selected, setSelected] = useState({});

  const leagues = {
    "🇪🇸 LaLiga": [
      { id: 1, home: "Real Madrid", away: "Barcelona" },
      { id: 2, home: "Atlético", away: "Sevilla" }
    ],
    "🏴 Premier League": [
      { id: 3, home: "Man City", away: "Liverpool" },
      { id: 4, home: "Arsenal", away: "Chelsea" }
    ],
    "🇮🇹 Serie A": [
      { id: 5, home: "Juventus", away: "Inter" },
      { id: 6, home: "Milan", away: "Napoli" }
    ]
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.predictions) {
      const saved = {};
      user.predictions.forEach(p => {
        saved[p.match] = p.prediction;
      });
      setSelected(saved);
    }
  }, []);

  const savePredictions = () => {
    let currentUser = JSON.parse(localStorage.getItem("user"));

    if (!currentUser) {
      currentUser = {
        username: "Invitado",
        teams: [],
        predictions: []
      };
    }

    if (Object.keys(selected).length === 0) {
      alert("Selecciona al menos un partido");
      return;
    }

    const newPredictions = Object.keys(selected).map(match => ({
      match,
      prediction: selected[match],
      date: new Date().toLocaleDateString()
    }));

    const updatedUser = {
      ...currentUser,
      predictions: newPredictions
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    window.dispatchEvent(new Event("userUpdated"));

    alert("Predicciones guardadas 🔥");
  };

  return (
    <div className="matches-container">
      <h2>Partidos de hoy</h2>

      {Object.entries(leagues).map(([league, matches]) => (
        <div key={league} className="league-section">

          <h3 className="league-title">{league}</h3>

          {matches.map(match => {
            const matchName = `${match.home} vs ${match.away}`;

            return (
              <div key={match.id} className="match-card">

                <p className="teams">
                  {match.home} vs {match.away}
                </p>

                <div className="options">
                  {["1", "X", "2"].map(option => (
                    <button
                      key={option}
                      type="button"
                      className={
                        "option-btn " +
                        (selected[matchName] === option ? "active" : "")
                      }
                      onClick={() => {
                        console.log("CLICK:", matchName, option);

                        setSelected(prev => {
                          const updated = {
                            ...prev,
                            [matchName]: option
                          };

                          console.log("UPDATED:", updated);
                          return updated;
                        });
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>

              </div>
            );
          })}

        </div>
      ))}

      <button type="button" className="save-btn" onClick={savePredictions}>
        Guardar predicciones
      </button>
    </div>
  );
}