import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Campo from "../../components/Campo";
import Boton from "../../components/Boton";
import { iniciarSesion } from "../../services/authService";
import { rutaPorRol } from "../../routes/rutaPorRol";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [correo_electronico, setCorreoElectronico] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { sesion, guardarSesion } = useAuth();

  // Si ya hay sesión activa, redirigir al panel correspondiente
  useEffect(() => {
    if (sesion?.rol && rutaPorRol[sesion.rol]) {
      navigate(rutaPorRol[sesion.rol], { replace: true });
    }
  }, [sesion, navigate]);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");

    if (!correo_electronico.trim() || !contrasena.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setCargando(true);
    try {
      const respuesta = await iniciarSesion(correo_electronico.trim(), contrasena);
      guardarSesion(respuesta);
      const destino = rutaPorRol[respuesta.rol] || "/cliente";
      navigate(destino, { replace: true });
    } catch (err) {
      setError(err.message || "Correo o contraseña incorrectos");
    } finally {
      setCargando(false);
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
          <div
            style={{
              display: "inline-block",
              backgroundColor: "var(--color-primario, #0a369d)",
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: "20px",
              padding: "10px 18px",
              borderRadius: "var(--radio-boton, 8px)",
              marginBottom: "12px",
            }}
          >
            SistemasAR
          </div>
          <h1
            style={{
              margin: "0 0 6px 0",
              fontSize: "var(--tamano-texto-xl, 24px)",
              color: "var(--color-texto-principal, #0f172a)",
            }}
          >
            Iniciar sesión
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "var(--tamano-texto-sm, 14px)",
              color: "var(--color-texto-secundario, #475569)",
            }}
          >
            Ingresa tus credenciales para acceder al sistema
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

        <form onSubmit={manejarEnvio} noValidate>
          <Campo
            etiqueta="Correo electrónico"
            tipo="email"
            valor={correo_electronico}
            onChange={(e) => setCorreoElectronico(e.target.value)}
            placeholder="ejemplo@prueba.com"
            deshabilitado={cargando}
            requerido
          />
          <Campo
            etiqueta="Contraseña"
            tipo="password"
            valor={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="Ingresa tu contraseña"
            deshabilitado={cargando}
            requerido
          />

          <div style={{ textAlign: "right", marginBottom: "18px" }}>
            <Link
              to="/recuperar"
              style={{
                fontSize: "14px",
                color: "var(--color-primario, #0a369d)",
                textDecoration: "none",
              }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Boton tipo="submit" variante="primario" anchoCompleto deshabilitado={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </Boton>
        </form>

        <div
          style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid var(--color-borde, #e2e8f0)",
            textAlign: "center",
            fontSize: "14px",
            color: "var(--color-texto-secundario, #475569)",
          }}
        >
          ¿Eres cliente nuevo?{" "}
          <Link
            to="/registro"
            style={{
              color: "var(--color-primario, #0a369d)",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}