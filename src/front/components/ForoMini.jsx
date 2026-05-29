import { useState, useEffect } from "react";
import "../body.css";

export default function ForoMini() {
  const [temas, setTemas] = useState([]);
  const [nuevo, setNuevo] = useState("");

  const [usuario, setUsuario] = useState("");
  const [contador, setContador] = useState(0);

  const LIMITE = 3; // 🔥 máximo temas por usuario

  // 🔥 pedir usuario
  useEffect(() => {
    if (!usuario) {
      const nombre = prompt("Pon tu nombre de usuario:");
      if (nombre) {
        setUsuario(nombre);
      }
    }
  }, [usuario]);

  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem("foro")) || [
      { texto: "¿Quién ganará la Champions?", usuario: "Rigo" }
    ];
    setTemas(guardados);
  }, []);

  const guardar = (lista) => {
    localStorage.setItem("foro", JSON.stringify(lista));
  };

  const agregar = () => {
    if (!nuevo.trim()) return;

    // 🔥 SI LLEGA AL LÍMITE → CAMBIAR USUARIO
    if (contador >= LIMITE) {
      alert("Has llegado al límite de temas con este usuario");

      const nombre = prompt("Nuevo usuario:");
      if (nombre) {
        setUsuario(nombre);
        setContador(0);
      }
      return;
    }

    const nuevosTemas = [
      {
        texto: nuevo,
        usuario: usuario
      },
      ...temas
    ];

    setTemas(nuevosTemas);
    guardar(nuevosTemas);
    setNuevo("");

    setContador(contador + 1);
  };

  return (
    <div className="foro-container">

      <h2>💬 Foro</h2>

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

      <div className="lista-temas">
        {temas.length === 0 ? (
          <p style={{ color: "#aaa" }}>No hay temas todavía</p>
        ) : (
          temas.map((tema, i) => (
            <div key={i} className="tema-card">

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