import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { obtenerRutaPorRol } from "./rutaPorRol";

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

  const destino = obtenerRutaPorRol(sesion.rol);
  return <Navigate to={destino} replace />;
}
