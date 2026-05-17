import { useState } from "react";
import "../body.css";

export default function ForoMini() {
  const [temas, setTemas] = useState(["¿Quién ganará la Champions?"]);
  const [nuevo, setNuevo] = useState("");

  const agregar = () => {
    if (!nuevo) return;
    setTemas([nuevo, ...temas]);
    setNuevo("");
  };

  return (
    <div className="card">
      <h2>💬 Foro</h2>

      <input
        className="input"
        value={nuevo}
        onChange={(e) => setNuevo(e.target.value)}
      />

      <button className="boton" onClick={agregar}>
        Crear
      </button>

      {temas.map((t, i) => (
        <div key={i}>{t}</div>
      ))}
    </div>
  );
}