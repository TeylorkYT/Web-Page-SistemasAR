import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Campo from "../../components/Campo";
import Boton from "../../components/Boton";
import { registrarCliente } from "../../services/authService";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const navigate = useNavigate();

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");
    setMensajeExito("");

    if (!nombre.trim() || !apellido.trim() || !correo.trim()) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      await registrarCliente({
        nombre: nombre,
        apellido: apellido,
        correo_electronico: correo
      });
      setMensajeExito("¡Registro exitoso! Redirigiendo al login...");
      
      // Limpiamos el formulario
      setNombre("");
      setApellido("");
      setCorreo("");
      
      // Redirigimos automáticamente al login después de 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setError(err.message || "Error al registrar el cliente.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-fondo-app, #f4f6f9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "var(--fuente-principal, sans-serif)",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--color-superficie, #ffffff)",
          padding: "36px 32px",
          borderRadius: "var(--radio-tarjeta, 12px)",
          boxShadow: "var(--sombra-elevada, 0 8px 24px rgba(15, 23, 42, 0.12))",
          border: "1px solid var(--color-borde, #e2e8f0)",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1
            style={{
              margin: "0 0 6px 0",
              fontSize: "var(--tamano-texto-xl, 24px)",
              color: "var(--color-texto-principal, #0f172a)",
            }}
          >
            Crear una cuenta
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "var(--tamano-texto-sm, 14px)",
              color: "var(--color-texto-secundario, #475569)",
            }}
          >
            Regístrate como cliente en SistemasAR
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid var(--color-peligro, #ef4444)",
              color: "var(--color-peligro, #ef4444)",
              padding: "10px 12px",
              borderRadius: "var(--radio-boton, 8px)",
              fontSize: "14px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {mensajeExito && (
          <div
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid var(--color-exito, #16a34a)",
              color: "var(--color-exito, #16a34a)",
              padding: "10px 12px",
              borderRadius: "var(--radio-boton, 8px)",
              fontSize: "14px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            {mensajeExito}
          </div>
        )}

        <form onSubmit={manejarEnvio} noValidate>
          <Campo
            etiqueta="Nombre"
            tipo="text"
            valor={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            requerido
          />
          <Campo
            etiqueta="Apellido"
            tipo="text"
            valor={apellido}
            onChange={(e) => setApellido(e.target.value)}
            placeholder="Tu apellido"
            requerido
          />
          <Campo
            etiqueta="Correo electrónico"
            tipo="email"
            valor={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="ejemplo@prueba.com"
            requerido
          />

          <div style={{ marginTop: "20px" }}>
            <Boton tipo="submit" variante="primario" anchoCompleto>
              Registrarse
            </Boton>
          </div>
        </form>

        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontSize: "14px",
            color: "var(--color-texto-secundario, #475569)",
          }}
        >
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--color-primario, #0a369d)",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}