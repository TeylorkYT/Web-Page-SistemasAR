import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => {
    const guardada = localStorage.getItem("sesion");
    return guardada ? JSON.parse(guardada) : null;
  });

  const guardarSesion = (datos) => {
    const nueva = {
      access_token: datos.access_token,
      refresh_token: datos.refresh_token,
      rol: datos.rol,
      nombre: datos.nombre,
    };
    localStorage.setItem("sesion", JSON.stringify(nueva));
    setSesion(nueva);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("sesion");
    setSesion(null);
  };

  return (
    <AuthContext.Provider value={{ sesion, guardarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
