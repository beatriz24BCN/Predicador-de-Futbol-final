import React, { useState, useEffect } from 'react';
import '../Noticias.css'; // Importamos el maquillaje Neón


export const Noticias = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Conexión real con nuestra API de Flask
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (response.ok) {
          const data = await response.json();
          setNews(data); // ¡Inyectamos las noticias reales de Marca!
        }
      } catch (error) {
        console.error("Error cargando noticias:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) return <div className="gt-loader">Buscando las últimas exclusivas...</div>;

  return (
    <div className="gt-news-page animate-fade-in">
      <div className="gt-ranking-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 className="gt-ranking-title"><span>NOTICIAS</span> AL MINUTO</h1>
        <p className="gt-subtitle">La actualidad del fútbol Europeo y Mundial</p>
      </div>

      <div className="gt-news-grid">
        {news.map((item) => (
          <div key={item.id} className="gt-news-card">
            <div className="gt-news-img-container">
              <span className="gt-news-tag">{item.tag}</span>
              <img src={item.image} alt={item.title} className="gt-news-img" />
            </div>

            <div className="gt-news-content">
              <h3 className="gt-news-title">{item.title}</h3>
              <p className="gt-news-desc">{item.description}</p>

              <div className="gt-news-footer">
                <span>📰 {item.source}</span>
                <span>⏱️ {item.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};