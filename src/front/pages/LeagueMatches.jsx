import { PartidoCard } from "../components/PartidoCard";
import { Link } from "react-router-dom";

export const LeagueMatches = () => {
  const matches = [
    {
      local: "Real Madrid",
      visitante: "Barcelona",
      resultado: "2 - 1",
      estado: "En vivo",
      fecha: "2026-05-12",
      liga: "La Liga",
    },
    {
      local: "Atlético",
      visitante: "Sevilla",
      resultado: "1 - 0",
      estado: "Finalizado",
      fecha: "2026-05-10",
      liga: "La Liga",
    },
  ];

  return (
    <div>
      <h1>La Liga</h1>

      {matches.map((match, index) => (
        <PartidoCard
          key={index}
          local={match.local}
          visitante={match.visitante}
          resultado={match.resultado}
          estado={match.estado}
          fecha={match.fecha}
          liga={match.liga}
        />
      ))}
    </div>
  );
};