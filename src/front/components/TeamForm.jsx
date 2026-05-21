import React from 'react';
import '../TeamForm.css';


export const TeamForm = ({ formString }) => {
  if (!formString) return <div className="gt-form-fallback">N/A</div>;

  // Cortamos a los últimos 5 partidos si la API devuelve más
  const lastFive = formString.split('').slice(-5);

  return (
    <div className="gt-team-form-dots">
      {lastFive.map((result, index) => {
        let statusClass = 'draw';
        if (result === 'W') statusClass = 'win';
        if (result === 'L') statusClass = 'loss';

        return (
          <span key={index} className={`gt-form-dot ${statusClass}`} title={`Resultado: ${result}`}>
            {result}
          </span>
        );
      })}
    </div>
  );
};