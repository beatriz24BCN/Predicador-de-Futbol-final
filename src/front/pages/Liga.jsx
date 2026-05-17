import React, { useEffect, useState } from "react";

export const Liga = () => {
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatosSegunAcademia = () => {
      // 1. Tomamos la URL base que da la academia
      let URI = import.meta.env.VITE_BACKEND_URL || "";
      
      // 2. PARÁMETRO CODESPACES: Si la URI apunta a localhost pero estás en la nube,
      // calculamos la URL real usando el dominio actual de tu navegador
      if (URI.includes("localhost") && window.location.host.includes("github.dev")) {
        const hostCorregido = window.location.host.replace("-3000", "-3001");
        URI = `${window.location.protocol}//${hostCorregido}`;
      }
      
      console.log("Conectando de forma segura a:", `${URI}/api/fixtures`);
      
      fetch(`${URI}/api/fixtures`)
        .then((res) => {
          if (!res.ok) throw new Error("Error en la respuesta de la API");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setPartidos(data);
            setError(null);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Asegúrate de que el puerto 3001 (Backend) esté configurado en 'Public' en la pestaña Ports.");
          setLoading(false);
        });
    };

    cargarDatosSegunAcademia();
    const temporizador = setInterval(cargarDatosSegunAcademia, 15000);
    return () => clearInterval(temporizador);
  }, []);

  const partidosEnVivo = partidos.filter((p) => p.status === "LIVE");
  const partidosOtros = partidos.filter((p) => p.status !== "LIVE");

  return (
    <div className="container py-5 text-white" style={{ fontFamily: "sans-serif" }}>
      <h1 className="text-center fw-bold mb-4">KickHub Real Live</h1>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success"></div>
          <p className="mt-2 text-muted">Cargando partidos de la API oficial...</p>
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-md-8">
            {error && (
              <div className="alert alert-warning text-dark text-center fw-bold mb-4" style={{ fontSize: "14px" }}>
                ⚠️ {error}
              </div>
            )}

            <h5 className="text-success mb-3">📡 EN VIVO TRANSMITIENDO ({partidosEnVivo.length})</h5>
            {partidosEnVivo.length > 0 ? (
              partidosEnVivo.map((p) => (
                <div key={p.id} className="p-3 mb-2 rounded" style={{ backgroundColor: "#1e293b" }}>
                  <div className="d-flex justify-content-between">
                    <span>{p.home} <b>{p.score}</b> {p.away}</span>
                    <span className="badge bg-success">{p.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted small">No hay partidos en juego en este instante.</p>
            )}

            <h5 className="text-muted mt-4 mb-3">✓ OTROS PARTIDOS / PROGRAMADOS ({partidosOtros.length})</h5>
            {partidosOtros.map((p) => (
              <div key={p.id} className="p-3 mb-2 rounded" style={{ backgroundColor: "#0f172a", opacity: 0.8 }}>
                <div className="d-flex justify-content-between">
                  <span>{p.home} <b className="text-muted">VS</b> {p.away}</span>
                  <span className="text-muted small">{p.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};