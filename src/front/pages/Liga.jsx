import { useEffect, useState } from "react";

export const Liga = () => {
  const [partidos, setPartidos] = useState([]);

  useEffect(() => {
    console.log("🔥 LIGA MONTADA");

    fetch("/api/fixtures")
      .then((res) => res.json())
      .then((data) => {
        console.log("🔥 DATA RECIBIDA:", data);
        setPartidos(data);
      })
      .catch((err) => console.error("❌ ERROR FETCH:", err));
  }, []);

  return (
    <div style={{ color: "white", padding: "20px", background: "black", minHeight: "100vh" }}>
      <h1>⚽ LIGA FUNCIONANDO</h1>

      <pre style={{ color: "lime" }}>
        {JSON.stringify(partidos, null, 2)}
      </pre>
    </div>
  )
};