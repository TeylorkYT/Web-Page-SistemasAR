import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Campo from "../../components/Campo";
import Boton from "../../components/Boton";
import { solicitarRecuperacion } from "../../services/authService";

export default function RecuperarContrasena() {
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [segundosBloqueo, setSegundosBloqueo] = useState(0);

  useEffect(() => {
    if (segundosBloqueo <= 0) return;
    const temporizador = setInterval(() => {
      setSegundosBloqueo((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(temporizador);
  }, [segundosBloqueo]);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!correo.trim()) {
      setError("Por favor ingresa tu correo electrónico registrado.");
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await solicitarRecuperacion(correo);
      setMensaje(respuesta.mensaje || "Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña.");
      setSegundosBloqueo(20);
    } catch (err) {
      setError(err.message || "Ocurrió un error al procesar tu solicitud.");
    } finally {
      setEnviando(false);
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
            Recuperar Contraseña
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "var(--tamano-texto-sm, 14px)",
              color: "var(--color-texto-secundario, #475569)",
            }}
          >
            Ingresa tu correo y te enviaremos las instrucciones.
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

        {mensaje && (
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
            {mensaje}
          </div>
        )}

        <form onSubmit={manejarEnvio} noValidate>
          <Campo
            etiqueta="Correo electrónico"
            tipo="email"
            valor={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="ejemplo@prueba.com"
            requerido
          />

          <div style={{ marginTop: "10px" }}>
            <Boton
              tipo="submit"
              variante="primario"
              anchoCompleto
              deshabilitado={enviando || segundosBloqueo > 0}
            >
              {enviando
                ? "Enviando…"
                : segundosBloqueo > 0
                ? `Espera ${segundosBloqueo}s para reenviar`
                : "Enviar instrucciones"}
            </Boton>
          </div>
        </form>

        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontSize: "14px",
          }}
        >
          <Link
            to="/login"
            style={{
              color: "var(--color-primario, #0a369d)",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Volver al Login
          </Link>
        </div>
      </div>
    </div>
  );
}