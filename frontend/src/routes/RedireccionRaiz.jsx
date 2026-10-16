import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Redirección inteligente de raíz (/) y rutas no encontradas (*) según la sesión activa.
 * - Sin sesión -> /login
 * - Con sesión -> Dashboard correspondiente al rol (cliente, técnico o admin)
 */
export default function RedireccionRaiz() {
  const { sesion } = useAuth();

  if (!sesion || !sesion.access_token) {
    return <Navigate to="/login" replace />;
  }

  const rol = (sesion.rol || "").toLowerCase();
  if (rol === "cliente") return <Navigate to="/cliente" replace />;
  if (rol === "tecnico") return <Navigate to="/tecnico" replace />;
  if (rol === "administrador") return <Navigate to="/admin" replace />;

  return <Navigate to="/login" replace />;
}
