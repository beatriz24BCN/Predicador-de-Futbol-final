import { useState } from "react";
import { FaHeart, FaFire, FaComment } from "react-icons/fa";

export default function ComentariosPartido({ partido }) {
  const [comentarios, setComentarios] = useState([]);
  const [texto, setTexto] = useState("");

  const agregar = () => {
    if (!texto.trim()) return;

    setComentarios([...comentarios, { texto, likes: 0 }]);
    setTexto("");
  };

  const darLike = (i) => {
    const nuevos = [...comentarios];
    nuevos[i].likes++;
    setComentarios(nuevos);
  };

  if (!partido) return <p>Selecciona un partido</p>;

  return (
    <div className="card">
      <h3>
        ⚽ {partido.teams.home.name} vs {partido.teams.away.name}
      </h3>

      {comentarios.map((c, i) => (
        <div key={i} className={`card ${c.likes >= 3 ? "top" : ""}`}>
          <FaComment /> {c.texto}

          <span className="like-btn" onClick={() => darLike(i)}>
            <FaHeart /> {c.likes}
          </span>

          {c.likes >= 3 && <span><FaFire /> TOP</span>}
        </div>
      ))}

      <input
        className="input"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

      <button className="boton" onClick={agregar}>
        Enviar
      </button>
    </div>
  );
}