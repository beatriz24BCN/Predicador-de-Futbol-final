import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Noticias.css';

export const NewsCarousel = () => {
  const carouselRef = useRef(null);
  const navigate = useNavigate();
  const [news, setNews] = useState([]); // 🔥 Estado para las noticias reales

  // 🔥 Conectamos el Carrusel a Flask
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (response.ok) {
          const data = await response.json();
          setNews(data);
        }
      } catch (error) {
        console.error("Error cargando noticias:", error);
      }
    };
    fetchNews();
  }, []);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Si no hay noticias aún, no renderizamos el contenedor vacío
  if (news.length === 0) return null;

  return (
    <div className="gt-carousel-wrapper animate-fade-in">
      <div className="gt-carousel-header">
        <h2 className="gt-carousel-title">Última Hora ⚡</h2>
        
        <div className="gt-carousel-controls">
          <button className="gt-carousel-btn" onClick={scrollLeft}>❮</button>
          <button className="gt-carousel-btn" onClick={scrollRight}>❯</button>
          <button 
            className="gt-btn-atomic" 
            style={{ marginLeft: '10px', fontSize: '0.8rem', padding: '8px 15px' }}
            onClick={() => navigate('/noticias')}
          >
            Ver Todas
          </button>
        </div>
      </div>

      <div className="gt-carousel-track-container" ref={carouselRef}>
        <div className="gt-carousel-track">
          {news.map((item) => (
            <div 
              key={item.id} 
              className="gt-news-card gt-carousel-card"
              onClick={() => navigate('/noticias')}
            >
              <div className="gt-news-img-container">
                <span className="gt-news-tag">{item.tag}</span>
                <img src={item.image} alt={item.title} className="gt-news-img" />
              </div>
              <div className="gt-news-content">
                <h3 className="gt-news-title" style={{ fontSize: '1rem' }}>{item.title}</h3>
                <div className="gt-news-footer" style={{ marginTop: 'auto' }}>
                  <span>📰 {item.source}</span>
                  <span>⏱️ {item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};