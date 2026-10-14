import { useState } from "react";
import { iniciarSesion } from "../services/auth";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  const enviar = async (evento) => {
    evento.preventDefault();
    setError("");
    try {
      const datos = await iniciarSesion(correo, contrasena);
      console.log("Inicio de sesión exitoso:", datos);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <form onSubmit={enviar}>
      <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="Correo" required />
      <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="Contraseña" required />
      {error && <p>{error}</p>}
      <button type="submit">Ingresar</button>
    </form>
  );
}