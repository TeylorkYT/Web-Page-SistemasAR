import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { obtenerRutaPorRol } from "./rutaPorRol";

export default function RutaProtegida({ rol, children }) {
  const { sesion } = useAuth();

  if (!sesion || !sesion.access_token) {
    return <Navigate to="/login" replace />;
  }

  const rolSesion = (sesion.rol || "").toLowerCase();
  const rolRequerido = (rol || "").toLowerCase();

  const esAdminSesion = rolSesion === "administrador" || rolSesion === "admin";
  const requiereAdmin = rolRequerido === "administrador" || rolRequerido === "admin";

  const coincideRol =
    rolSesion === rolRequerido || (esAdminSesion && requiereAdmin);

  if (!coincideRol) {
    const destino = obtenerRutaPorRol(sesion.rol);
    return <Navigate to={destino} replace />;
  }

  return children ?? <Outlet />;
}
