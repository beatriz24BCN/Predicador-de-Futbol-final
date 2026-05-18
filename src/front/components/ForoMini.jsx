import { useState, useEffect } from "react";
import "../body.css";

export default function ForoMini() {
  const [temas, setTemas] = useState([]);
  const [nuevo, setNuevo] = useState("");

  // 🔥 CARGAR TEMAS
  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem("foro")) || [
      "¿Quién ganará la Champions?"
    ];
    setTemas(guardados);
  }, []);

  // 🔥 GUARDAR TEMAS
  const guardar = (lista) => {
    localStorage.setItem("foro", JSON.stringify(lista));
  };

  // 🔥 AGREGAR TEMA
  const agregar = () => {
    if (!nuevo.trim()) return;

    const nuevosTemas = [nuevo, ...temas];

    setTemas(nuevosTemas);
    guardar(nuevosTemas);

    setNuevo("");
  };

  // 🔥 BORRAR TEMA
  const borrarTema = (index) => {
    const nuevosTemas = temas.filter((_, i) => i !== index);
    setTemas(nuevosTemas);
    guardar(nuevosTemas);
  };

  return (
    <div className="foro-container">

      <h2>💬 Foro</h2>

      {/* INPUT */}
      <div className="input-box">
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          placeholder="Crear tema..."
        />

        <button onClick={agregar}>
          Crear
        </button>
      </div>

      {/* LISTA DE TEMAS */}
      <div className="lista-temas">
        {temas.length === 0 ? (
          <p style={{ color: "#aaa" }}>No hay temas todavía</p>
        ) : (
          temas.map((tema, i) => (
            <div key={i} className="tema-card">

              <span>{tema}</span>

              <button
                className="borrar-btn"
                onClick={() => borrarTema(i)}
              >
                ❌
              </button>

            </div>
          ))
        )}
      </div>

    </div>
  );
}