import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * El autoregistro público ha sido deshabilitado.
 * La creación de usuarios (Clientes, Técnicos y Administradores)
 * es gestionada exclusivamente por el Administrador del sistema.
 */
export default function Registro() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login", { replace: true });
  }, [navigate]);

  return null;
}