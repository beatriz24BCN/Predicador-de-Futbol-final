export const PartidoCard = ({
  liga,
  local,
  visitante,
  resultado,
  fecha,
  estado,
}) => {
  const getColor = () => {
    switch (estado?.toLowerCase()) {
      case "finalizado":
        return "#666";
      case "en vivo":
        return "red";
      case "proximo":
        return "green";
      default:
        return "white";
    }
  };

  return (
    <div
      style={{
        background: "#1e1e1e",
        margin: "10px auto",
        padding: "15px",
        borderRadius: "12px",
        width: "320px",
        borderLeft: `5px solid ${getColor()}`,
        color: "white",
      }}
    >
      <small>{liga}</small>

      <h3>
        {local} vs {visitante}
      </h3>

      <div>{resultado || "VS"}</div>

      <small>{fecha}</small>

      <div style={{ color: getColor(), fontWeight: "bold" }}>
        {estado}
      </div>
    </div>
  );
};