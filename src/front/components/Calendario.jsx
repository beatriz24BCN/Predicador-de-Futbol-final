import React, { useState, useEffect } from "react";
import "../body.css";


export const Calendario = () => {
    const [partidos, setPartidos] = useState([]);

    useEffect(() => {
        // Datos de ejemplo siguiendo tu regla del 30% en español
        const datosPartidos = [
            { id: 1, equipoLocal: "Real Madrid", equipoVisitante: "Barcelona", estado: "EN VIVO", tiempo: "75'", liga: "La Liga" },
            { id: 2, equipoLocal: "Man. City", equipoVisitante: "Arsenal", estado: "PROGRAMADO", tiempo: "21:00", liga: "Premier League" },
            { id: 3, equipoLocal: "Inter", equipoVisitante: "Milan", estado: "FINALIZADO", tiempo: "FT", liga: "Serie A" },
            { id: 4, equipoLocal: "Bayern", equipoVisitante: "Dortmund", estado: "PROGRAMADO", tiempo: "Tomorrow", liga: "Bundesliga" }
        ];
        setPartidos(datosPartidos);
    }, []);

    return (
        <aside className="calendario-sidebar">
            <div className="calendario-header">
                <h3 className="poppins-semibold">Calendario de <span className="text-teal">Fútbol</span></h3>
            </div>
            
            <div className="lista-partidos-scroll">
                {partidos.map((partido) => (
                    <div key={partido.id} className="partido-card-mini">
                        <div className="partido-top">
                            <span className="liga-tag">{partido.liga}</span>
                            <span className="estado-tag" style={{ color: partido.estado === "EN VIVO" ? "#0EE7AC" : "#BFC3CA" }}>
                                {partido.estado === "EN VIVO" && <span className="dot-live" />}
                                {partido.estado}
                            </span>
                        </div>

                        <div className="partido-body">
                            <div className="equipo-fila">
                                <span className="equipo-nombre">{partido.equipoLocal}</span>
                                {partido.estado === "EN VIVO" && <span className="score">2</span>}
                            </div>
                            <div className="equipo-fila">
                                <span className="equipo-nombre">{partido.equipoVisitante}</span>
                                {partido.estado === "EN VIVO" && <span className="score">1</span>}
                            </div>
                        </div>

                        <div className="partido-footer">
                            <span className="tiempo-text">{partido.tiempo}</span>
                            <button className="btn-primary mini-btn">UNIRME</button>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};