import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "../body.css";
import "../index.css";

export const Body = () => {
    // 1. Inicializamos el hook de React Router para navegación imperativa
    const navigate = useNavigate(); 

    // 2. Estado local para simular la carga de métricas desde el Backend
    const [userStats, setUserStats] = useState({ total: 0, online: 0 });

    // 3. Simulación de fetch() a futura API de Flask
    useEffect(() => {
        const fetchData = setTimeout(() => {
            setUserStats({ total: 0, online: 0 }); // Datos inyectados dinámicamente
        }, 800); // Simulamos 800ms de latencia de red
        
        return () => clearTimeout(fetchData); // Cleanup function para evitar memory leaks
    }, []);

    // 4. Arquitectura de datos: Añadimos 'path' y un 'id' único (Clean Code)
    const features = [
        { id: "usuarios", title: "Usuarios", icon: "👥", description: "Gestión de perfiles y estadísticas.", path: null },
        { id: "predicciones", title: "Predicciones", icon: "🏆", description: "Sigue las ligas y suma puntos.", path: "/quiniela" },
        { id: "comentarios", title: "Comentarios", icon: "💬", description: "Debate en tiempo real.", path: "/comentarios" }
    ];

    // 5. Manejador de eventos desacoplado
    const handleCardClick = (path) => {
        if (path) navigate(path);
    };

    return (
        <div className="main-content">
            <h1 className="hero-title">Temporada 2026/27</h1>
            <h2 className="hero-subtitle">Tu portal definitivo de fútbol europeo</h2>
            <p className="feature-text">Sigue las mejores ligas, haz predicciones, compite con amigos y vive cada gol como si estuvieras en el estadio.</p>
            
            <div className="features-grid">
                {features.map((item) => (
                    <div 
                        className={`feature-card ${item.path ? "clickable-card" : ""}`} 
                        key={item.id} // Siempre usar IDs únicos, evitar usar el index si es posible
                        onClick={() => handleCardClick(item.path)}
                        style={{ cursor: item.path ? "pointer" : "default" }} // Feedback visual directo
                    >
                        <div className="feature-icon">{item.icon}</div>
                        <h3 className="feature-name">{item.title}</h3>
                        <p className="feature-text">{item.description}</p>
                        
                        {/* 6. Renderizado Condicional para el contador exclusivo de Usuarios */}
                        {item.id === "usuarios" && (
                            <div className="user-stats-container" style={{ marginTop: "15px", display: "flex", gap: "10px", justifyContent: "center" }}>
                                <span style={{ background: "#eee", padding: "5px 10px", borderRadius: "15px", fontSize: "0.85rem", color: "#333" }}>
                                    Total: <b>{userStats.total}</b>
                                </span>
                                <span style={{ background: "#e8f5e9", padding: "5px 10px", borderRadius: "15px", fontSize: "0.85rem", color: "#2e7d32" }}>
                                    Online: <b>{userStats.online}</b> 🟢
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};