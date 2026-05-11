import { useParams } from "react-router-dom";

export const Liga = () => {
  const { nombre } = useParams();

  return (
    <div style={{ color: "white", textAlign: "center", marginTop: "40px" }}>
      <h1>Liga: {nombre}</h1>
      <p>Aquí irá el contenido de la liga</p>
    </div>
  );
};