/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => {
    try {
      const guardada = localStorage.getItem("sesion");
      return guardada ? JSON.parse(guardada) : null;
    } catch {
      localStorage.removeItem("sesion");
      return null;
    }
  });

  const guardarSesion = (datos) => {
    try {
      const nueva = {
        access_token: datos.access_token,
        refresh_token: datos.refresh_token,
        rol: datos.rol,
        nombre: datos.nombre,
      };
      localStorage.setItem("sesion", JSON.stringify(nueva));
      setSesion(nueva);
    } catch (err) {
      console.error("Error al guardar sesión en localStorage:", err);
    }
  };

  const cerrarSesion = () => {
    try {
      localStorage.removeItem("sesion");
    } catch (err) {
      console.error("Error al remover sesión:", err);
    }
    setSesion(null);
  };

  return (
    <AuthContext.Provider value={{ sesion, guardarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);


