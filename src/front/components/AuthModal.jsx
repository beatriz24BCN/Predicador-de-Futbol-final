import { useState } from "react";

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    setError("");

    // VALIDACIONES
    if (!password || (!isLogin && (!username || !email))) {
      setError("Completa todos los campos");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener mínimo 6 caracteres");
      return;
    }

    if (!isLogin) {
      // REGISTRO
      const user = { username, email, password };
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("session", "true");

    } else {
      // LOGIN
      const savedUser = JSON.parse(localStorage.getItem("user"));

      if (
        savedUser &&
        savedUser.email === email &&
        savedUser.password === password
      ) {
        localStorage.setItem("session", "true");
      } else {
        setError("Email o contraseña incorrectos");
        return;
      }
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        {/* TABS */}
        <div className="tabs">
          <button
            className={!isLogin ? "active" : ""}
            onClick={() => setIsLogin(false)}
          >
            Registro
          </button>

          <button
            className={isLogin ? "active" : ""}
            onClick={() => setIsLogin(true)}
          >
            Iniciar sesión
          </button>
        </div>

        {/* FORM */}
        <div className="form">
          {!isLogin && (
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña (6+ caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* ERROR */}
          {error && <p className="error">{error}</p>}
        </div>

        {/* BOTONES */}
        <div className="actions">
          <button className="cancel" onClick={onClose}>
            Cancelar
          </button>

          <button className="continue" onClick={handleSubmit}>
            Continuar
          </button>
        </div>

      </div>
    </div>
  );
}