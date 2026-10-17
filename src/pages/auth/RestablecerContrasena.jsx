import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Campo from "../../components/Campo";
import Boton from "../../components/Boton";
import { restablecerContrasena } from "../../services/authService";

export default function RestablecerContrasena() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [guardando, setGuardando] = useState(false);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (!token) {
      setError("No se encontró el token de seguridad en la dirección URL.");
      return;
    }

    if (nuevaContrasena.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden. Por favor verifícalas.");
      return;
    }

    setGuardando(true);
    try {
      await restablecerContrasena(token, nuevaContrasena);
      setExito("¡Contraseña restablecida con éxito! Redirigiendo al inicio de sesión…");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "El enlace de recuperación no es válido o ya fue utilizado.");
    } finally {
      setGuardando(false);
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
            Restablecer Contraseña
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "var(--tamano-texto-sm, 14px)",
              color: "var(--color-texto-secundario, #475569)",
            }}
          >
            Crea una nueva contraseña segura para tu cuenta.
          </p>
        </div>

        {!token && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid var(--color-peligro, #ef4444)",
              color: "var(--color-peligro, #ef4444)",
              padding: "12px",
              borderRadius: "var(--radio-boton, 8px)",
              fontSize: "14px",
              marginBottom: "18px",
              textAlign: "center",
            }}
          >
            <p style={{ margin: "0 0 8px 0" }}>El enlace no contiene un token válido de recuperación.</p>
            <Link
              to="/recuperar"
              style={{
                color: "#b91c1c",
                fontWeight: "600",
                textDecoration: "underline",
              }}
            >
              Solicitar un nuevo enlace
            </Link>
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid var(--color-peligro, #ef4444)",
              color: "var(--color-peligro, #ef4444)",
              padding: "12px",
              borderRadius: "var(--radio-boton, 8px)",
              fontSize: "14px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0 }}>{error}</p>
            {error.includes("expirado") || error.includes("utilizado") || error.includes("inválido") ? (
              <div style={{ marginTop: "8px" }}>
                <Link to="/recuperar" style={{ color: "#b91c1c", fontWeight: "600" }}>
                  Solicitar otro enlace
                </Link>
              </div>
            ) : null}
          </div>
        )}

        {exito && (
          <div
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid var(--color-exito, #16a34a)",
              color: "var(--color-exito, #16a34a)",
              padding: "12px",
              borderRadius: "var(--radio-boton, 8px)",
              fontSize: "14px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            {exito}
          </div>
        )}

        {token && (
          <form onSubmit={manejarEnvio} noValidate>
            <Campo
              etiqueta="Nueva contraseña"
              tipo="password"
              valor={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              requerido
            />

            <Campo
              etiqueta="Confirmar nueva contraseña"
              tipo="password"
              valor={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              placeholder="Repite la nueva contraseña"
              requerido
            />

            <div style={{ marginTop: "16px" }}>
              <Boton
                tipo="submit"
                variante="primario"
                anchoCompleto
                deshabilitado={guardando}
              >
                {guardando ? "Actualizando…" : "Restablecer contraseña"}
              </Boton>
            </div>
          </form>
        )}

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
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
