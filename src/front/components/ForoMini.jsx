import { useState, useEffect } from "react";
import "../body.css";

export default function ForoMini() {
  const [temas, setTemas] = useState([]);
  const [nuevo, setNuevo] = useState("");

  // 🔥 CARGAR TEMAS
  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem("foro")) || [
      { texto: "¿Quién ganará la Champions?", usuario: "Rigo" }
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

    const nuevosTemas = [
      {
        texto: nuevo,
        usuario: "Rigo" // 🔥 luego dinámico
      },
      ...temas
    ];

    setTemas(nuevosTemas);
    guardar(nuevosTemas);
    setNuevo("");
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

              {/* 🔥 USUARIO + TEXTO */}
              <span>
                <strong>{tema.usuario || "Rigo"}</strong>: {tema.texto}
              </span>

            </div>
          ))
        )}
      </div>

    </div>
  );
}                                                                                                                     