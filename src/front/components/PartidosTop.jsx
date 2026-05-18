export default function PartidosTop({ setPartido }) {
  const partidos = [
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
      away: "Napoli",
      homeLogo: "https://crests.football-data.org/98.png",
      awayLogo: "https://crests.football-data.org/113.png",
    },
  ];

  return (
    <div className="grid-partidos">
      {partidos.map((p) => (
        <div key={p.id} className="card-partido" onClick={() => setPartido(p)}>
          <div className="equipos">

            <div className="equipo">
              <img src={p.homeLogo} />
              <span>{p.home}</span>
            </div>

            <span className="vs">VS</span>

            <div className="equipo">
              <img src={p.awayLogo} />
              <span>{p.away}</span>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}