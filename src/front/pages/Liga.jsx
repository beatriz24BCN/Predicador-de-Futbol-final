import React, { useEffect, useState } from "react";

export const Liga = () => {
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🏆 Calendario Oficial FIFA Mundial 2026 en estricto orden cronológico por días
  const partidosMundial = [
    {
      id: 1,
      diaLabel: "DÍA 1",
      fecha: "Jueves 11 de Junio",
      estadio: "Estadio Azteca, Ciudad de México",
      grupo: "Grupo A",
      status: "PRÓX",
      teams: { home: { name: "México", bandera: "🇲🇽" }, away: { name: "Sudáfrica", bandera: "🇿🇦" } }
    },
    {
      id: 2,
      diaLabel: "DÍA 1",
      fecha: "Jueves 11 de Junio",
      estadio: "Estadio Guadalajara, Zapopan",
      grupo: "Grupo A",
      status: "PRÓX",
      teams: { home: { name: "Corea del Sur", bandera: "🇰🇷" }, away: { name: "Chequia", bandera: "🇨🇿" } }
    },
    {
      id: 3,
      diaLabel: "DÍA 2",
      fecha: "Viernes 12 de Junio",
      estadio: "Estadio de Toronto, Toronto",
      grupo: "Grupo B",
      status: "PRÓX",
      teams: { home: { name: "Canadá", bandera: "🇨🇦" }, away: { name: "Bosnia y Her.", bandera: "🇧🇦" } }
    },
    {
      id: 4,
      diaLabel: "DÍA 2",
      fecha: "Viernes 12 de Junio",
      estadio: "Estadio de Los Ángeles, Los Ángeles",
      grupo: "Grupo D",
      status: "PRÓX",
      teams: { home: { name: "Estados Unidos", bandera: "🇺🇸" }, away: { name: "Paraguay", bandera: "🇵🇾" } }
    },
    {
      id: 5,
      diaLabel: "DÍA 3",
      fecha: "Sábado 13 de Junio",
      estadio: "Estadio de Boston, Boston",
      grupo: "Grupo C",
      status: "PRÓX",
      teams: { home: { name: "Haití", bandera: "🇭🇹" }, away: { name: "Escocia", bandera: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" } }
    },
    {
      id: 6,
      diaLabel: "DÍA 3",
      fecha: "Sábado 13 de Junio",
      estadio: "BC Place, Vancouver",
      grupo: "Grupo D",
      status: "PRÓX",
      teams: { home: { name: "Australia", bandera: "🇦🇺" }, away: { name: "Turquía", bandera: "🇹🇷" } }
    },
    {
      id: 7,
      diaLabel: "DÍA 3",
      fecha: "Sábado 13 de Junio",
      estadio: "Estadio Nueva York/Nueva Jersey",
      grupo: "Grupo C",
      status: "PRÓX",
      teams: { home: { name: "Brasil", bandera: "🇧🇷" }, away: { name: "Marruecos", bandera: "🇲🇦" } }
    },
    {
      id: 8,
      diaLabel: "DÍA 3",
      fecha: "Sábado 13 de Junio",
      estadio: "Estadio de San Francisco",
      grupo: "Grupo B",
      status: "PRÓX",
      teams: { home: { name: "Catar", bandera: "🇶🇦" }, away: { name: "Suiza", bandera: "🇨🇭" } }
    },
    {
      id: 9,
      diaLabel: "DÍA 4",
      fecha: "Domingo 14 de Junio",
      estadio: "Estadio de Houston, Houston",
      grupo: "Grupo E",
      status: "PRÓX",
      teams: { home: { name: "Alemania", bandera: "🇩🇪" }, away: { name: "Curazao", bandera: "🇨🇼" } }
    },
    {
      id: 10,
      diaLabel: "DÍA 4",
      fecha: "Domingo 14 de Junio",
      estadio: "Estadio de Dallas, Dallas",
      grupo: "Grupo F",
      status: "PRÓX",
      teams: { home: { name: "Países Bajos", bandera: "🇳🇱" }, away: { name: "Japón", bandera: "🇯🇵" } }
    },
    {
      id: 11,
      diaLabel: "DÍA 4",
      fecha: "Domingo 14 de Junio",
      estadio: "Estadio de Filadelfia, Filadelfia",
      grupo: "Grupo E",
      status: "PRÓX",
      teams: { home: { name: "Costa de Marfil", bandera: "🇨🇮" }, away: { name: "Ecuador", bandera: "🇪🇨" } }
    },
    {
      id: 12,
      diaLabel: "DÍA 4",
      fecha: "Domingo 14 de Junio",
      estadio: "Estadio Monterrey, Monterrey",
      grupo: "Grupo F",
      status: "PRÓX",
      teams: { home: { name: "Suecia", bandera: "🇸🇪" }, away: { name: "Túnez", bandera: "🇹🇳" } }
    },
    {
      id: 13,
      diaLabel: "DÍA 5",
      fecha: "Lunes 15 de Junio",
      estadio: "Estadio de Atlanta, Atlanta",
      grupo: "Grupo H",
      status: "PRÓX",
      teams: { home: { name: "España", bandera: "🇪🇸" }, away: { name: "Cabo Verde", bandera: "🇨🇻" } }
    },
    {
      id: 14,
      diaLabel: "DÍA 5",
      fecha: "Lunes 15 de Junio",
      estadio: "Estadio de Seattle, Seattle",
      grupo: "Grupo G",
      status: "PRÓX",
      teams: { home: { name: "Bélgica", bandera: "🇧🇪" }, away: { name: "Egipto", bandera: "🇪🇬" } }
    },
    {
      id: 15,
      diaLabel: "DÍA 5",
      fecha: "Lunes 15 de Junio",
      estadio: "Estadio de Miami, Miami",
      grupo: "Grupo H",
      status: "PRÓX",
      teams: { home: { name: "Arabia Saudí", bandera: "🇸🇦" }, away: { name: "Uruguay", bandera: "🇺🇾" } }
    }
  ];

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setPartidos(partidosMundial);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="liga-container py-4">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@700&family=Inter:wght@400;600&display=swap');
          
          .liga-container {
            font-family: 'Inter', sans-serif;
            background-color: #0f172a;
            min-height: 100vh;
            color: white;
            max-width: 950px;
            margin: 0 auto;
            padding: 20px;
          }

          .liga-header {
            font-family: 'Urbanist', sans-serif;
            border-bottom: 1px solid #334155;
            padding-bottom: 15px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            text-transform: uppercase;
          }

          .match-row {
            background-color: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            overflow: hidden;
          }

          .day-badge {
            position: absolute;
            top: 0;
            left: 0;
            background-color: #10b981;
            color: white;
            font-size: 0.65rem;
            font-weight: 800;
            padding: 4px 14px;
            border-bottom-right-radius: 10px;
            letter-spacing: 1px;
          }

          .group-badge {
            position: absolute;
            top: 0;
            right: 0;
            background-color: #334155;
            color: #94a3b8;
            font-size: 0.65rem;
            font-weight: 700;
            padding: 4px 12px;
            border-bottom-left-radius: 10px;
            letter-spacing: 0.5px;
          }

          .match-main-info {
            display: grid;
            grid-template-columns: 1fr 110px 1fr;
            width: 100%;
            align-items: center;
            margin-top: 15px;
          }

          .team-container {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 600;
            font-size: 1.05rem;
          }

          .team-local { 
            justify-content: flex-end; 
            text-align: right; 
          }
          
          .team-visit { 
            justify-content: flex-start; 
            text-align: left; 
          }

          .flag-icon {
            font-size: 1.4rem;
            line-height: 1;
          }

          .score-box {
            background-color: #020617;
            color: #fbbf24;
            font-family: 'Urbanist', sans-serif;
            font-size: 1rem;
            padding: 6px 14px;
            border-radius: 8px;
            text-align: center;
            font-weight: 700;
            min-width: 90px;
            border: 1px solid #334155;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .match-status-footer {
            margin-top: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            color: #94a3b8;
            letter-spacing: 0.3px;
            display: flex;
            gap: 8px;
            align-items: center;
          }

          .match-date {
            color: #fbbf24;
            font-weight: 700;
          }

          .divider-dot {
            color: #475569;
          }
        `}
      </style>

      {/* ENCABEZADO OFICIAL */}
      <div className="liga-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "1.8rem" }}>🏆</span>
          <div>
            <span style={{ fontSize: "1.3rem", fontWeight: "800", display: "block", lineHeight: "1.1", letterSpacing: "0.5px" }}>MUNDIAL FIFA 2026</span>
            <span style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: "600" }}>CALENDARIO CRONOLÓGICO OFICIAL</span>
          </div>
        </div>
        <div style={{ fontSize: "0.85rem", color: "#fbbf24", fontWeight: "700", letterSpacing: "0.5px" }}>Fase de Grupos</div>
      </div>

      {/* LISTADO DE PARTIDOS DÍA A DÍA */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
      ) : (
        <div className="partidos-list">
          {partidos.map((match) => {
            return (
              <div key={match.id} className="match-row">
                {/* Etiquetas de Día y Grupo */}
                <div className="day-badge">{match.diaLabel}</div>
                <div className="group-badge">{match.grupo}</div>

                <div className="match-main-info">
                  {/* Local */}
                  <div className="team-container team-local">
                    <span>{match.teams.home.name}</span>
                    <span className="flag-icon">{match.teams.home.bandera}</span>
                  </div>

                  {/* Estado / Horario */}
                  <div className="score-box">{match.status}</div>

                  {/* Visitante */}
                  <div className="team-container team-visit">
                    <span className="flag-icon">{match.teams.away.bandera}</span>
                    <span>{match.teams.away.name}</span>
                  </div>
                </div>

                {/* Footer de la tarjeta con fecha y estadio */}
                <div className="match-status-footer">
                  <span className="match-date">{match.fecha}</span>
                  <span className="divider-dot">•</span>
                  <span>{match.estadio}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};