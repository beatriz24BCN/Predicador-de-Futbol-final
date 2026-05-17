import { useState } from "react";
import PartidosTop from "../components/PartidosTop";
import ComentariosPartido from "../components/ComentariosPartido";
import ForoMini from "../components/ForoMini";
import "../body.css";

export default function Comentarios() {
  const [partido, setPartido] = useState(null);

  return (
    <div className="contenedor">

      <div>
        <PartidosTop setPartido={setPartido} />
        <ComentariosPartido partido={partido} />
      </div>

      <ForoMini />

    </div>
  );
}