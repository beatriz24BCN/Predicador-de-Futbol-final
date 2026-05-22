import { useEffect, useState } from "react";
import { getPartidos } from "../services/api";

export default function PartidosTop({ setPartido }) {
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getPartidos();
        console.log("DATOS API:", data);

        if (data && data.length > 0) {
          setPartidos(data.slice(0, 6));
        } else {
          fallback();
        }
      } catch (error) {
        console.error("ERROR API:", error);
        fallback();
      } finally {
        setLoading(false);
      }
    };

    const fallback = () => {
      setPartidos([
        {
          id: 1,
          home: "Real Madrid",
          away: "Barcelona",
          homeLogo: "https://crests.football-data.org/86.png",
          awayLogo: "https://crests.football-data.org/81.png",
        },
        {
          id: 2,
          home: "Manchester City",
          away: "Liverpool",
          homeLogo: "https://crests.football-data.org/65.png",
          awayLogo: "https://crests.football-data.org/64.png",
        },
        {
          id: 3,
          home: "PSG",
          away: "Bayern",
          homeLogo: "https://crests.football-data.org/524.png",
          awayLogo: "https://crests.football-data.org/5.png",
        },
        {
          id: 4,
          home: "Juventus",
          away: "Inter",
          homeLogo: "https://crests.football-data.org/109.png",
          awayLogo: "https://crests.football-data.org/108.png",
        },
        {
          id: 5,
          home: "Arsenal",
          away: "Chelsea",
          homeLogo: "https://crests.football-data.org/57.png",
          awayLogo: "https://crests.football-data.org/61.png",
        },
        {
          id: 6,
          home: "Milan",
          away: "Napoles",
          homeLogo: "https://crests.football-data.org/98.png",
          awayLogo: "https://crests.football-data.org/113.png",
        },
      ]);
    };

    cargar();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Cargando partidos...</p>;
  }

  return (
    <div className="grid-partidos">
      {partidos.map((p, i) => {
        const homeName = p.teams ? p.teams.home.name : p.home;
        const awayName = p.teams ? p.teams.away.name : p.away;

        const homeLogo = p.teams ? p.teams.home.logo : p.homeLogo;
        const awayLogo = p.teams ? p.teams.away.logo : p.awayLogo;

        return (
          <div
            key={i}
            className="card-partido"
            onClick={() => setPartido(p)}
          >
            <div className="equipos">

              <div className="equipo">
                <img src={homeLogo} alt={homeName} />
                <span>{homeName}</span>
              </div>

              <span className="vs">VS</span>

              <div className="equipo">
                <img src={awayLogo} alt={awayName} />
                <span>{awayName}</span>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}                                                                                                                