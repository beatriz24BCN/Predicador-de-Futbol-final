import React from "react";
import "../body.css";

export const Body = () => {
	const features = [
		{ title: "Usuarios", icon: "👥", description: "Gestión de perfiles y estadísticas." },
		{ title: "Predicciones", icon: "🏆", description: "Sigue las ligas y suma puntos." },
		{ title: "Comentarios", icon: "💬", description: "Debate en tiempo real." }
	];

	return (
		<div className="main-content">
			<h1 className="hero-title">Temporada 2026/27</h1>
			<h2 className="hero-subtitle">Tu portal definitivo de fútbol europeo</h2>
			<p className="feature-text">Sigue las mejores ligas, haz predicciones, compite con amigos y vive cada gol como si estuvieras en el estadio.</p>
			
			<div className="features-grid">
				{features.map((item, index) => (
					<div className="feature-card" key={index}>
						<div className="feature-icon">{item.icon}</div>
						<h3 className="feature-name">{item.title}</h3>
						<p className="feature-text">{item.description}</p>
					</div>
				))}
			</div>
		</div>
	);
};