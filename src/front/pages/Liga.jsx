import { useParams } from "react-router-dom";
import { partidos } from "../data/partidos";

export const Liga = () => {
  const { nombre } = useParams();

  console.log("URL PARAM nombre:", nombre);
  console.log("PARTIDOS:", partidos);

  return (
    <div style={{ color: "white", textAlign: "center" }}>
      <h1>DEBUG LIGA</h1>

      <p>Nombre URL: {nombre}</p>

      <pre>{JSON.stringify(partidos, null, 2)}</pre>
    </div>
  );
};