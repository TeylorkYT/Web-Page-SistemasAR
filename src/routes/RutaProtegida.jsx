import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { rutaPorRol } from "./rutaPorRol";

export default function RutaProtegida({ rol, children }) {
  const { sesion } = useAuth();

  if (!sesion) {
    return <Navigate to="/login" replace />;
  }
  if (sesion.rol !== rol) {
    return <Navigate to={rutaPorRol[sesion.rol]} replace />;
  }
  return children ?? <Outlet />;
}
