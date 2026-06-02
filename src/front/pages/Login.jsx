import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export const Login = () => {
    // 1. Traemos la función "dispatch" para enviar acciones a la bóveda global
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); // Evitamos que la página se recargue
        
        try {
            // 2. Le preguntamos a Flask si las credenciales son válidas
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "correo@ejemplo.com", password: "123" })
            });

            if (response.ok) {
                const data = await response.json(); 
                // Flask nos devuelve algo como: { token: "eyJh...", user: { id: 2, username: "daniel" } }
                
                // 3. ¡AQUÍ VA EL BLOQUE! Inyectamos la sesión en el store global
                dispatch({ 
                    type: "login", 
                    payload: { token: data.token, user: data.user } 
                });

                alert("¡Bienvenido de vuelta!");
                navigate("/ranking"); // Lo enviamos a ver su tarjeta iluminada 🚀

            } else {
                alert("Correo o contraseña incorrectos");
            }
            
        } catch (error) {
            console.error("Error en el login:", error);
        }
    };

    return (
        // ... tu formulario HTML con onSubmit={handleSubmit} ...
        <form onSubmit={handleSubmit}>
            <button type="submit">Iniciar Sesión</button>
        </form>
    );
};