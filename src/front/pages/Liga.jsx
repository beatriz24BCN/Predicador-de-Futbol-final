import { useParams } from "react-router-dom";
import { partidos } from "../data/partidos";
import { PartidoCard } from "../components/PartidoCard";

export const Liga = () => {
  const { nombre } = useParams();

  const partidosLiga = partidos
    .filter((p) => p.liga === nombre)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const nombresLigas = {
    laliga: "La Liga",
    "premier-league": "Premier League",
    worldcup: "Mundial 2026",
  };

  return (
    <div
      style={{
        color: "white",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1>{nombresLigas[nombre]}</h1>

      {partidosLiga.length === 0 ? (
        <p>No hay partidos</p>
      ) : (
        partidosLiga.map((p) => (
          <PartidoCard key={p.id} {...p} />
        ))
      )}
    </div>
  );
};