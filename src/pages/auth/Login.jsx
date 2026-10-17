import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Campo from "../../components/Campo";
import Boton from "../../components/Boton";
import { iniciarSesion } from "../../services/authService";
import { obtenerRutaPorRol } from "../../routes/rutaPorRol";
import { useAuth } from "../../context/AuthContext";
import { reiniciarBaseDeDatos } from "../../api/mockDataStore";

const CUENTAS_DEMO = [
  {
    rol: "Administrador",
    nombre: "Carlos Administrador",
    correo: "admin@prueba.com",
    icono: "👑",
    color: "#7c3aed",
    bg: "#f5f3ff",
    borde: "#ddd6fe",
    descripcion: "Gestión completa de usuarios, categorías, técnicos y reportes",
  },
  {
    rol: "Tecnico",
    nombre: "Diana Paz",
    correo: "tecnico@prueba.com",
    icono: "🛠️",
    color: "#0284c7",
    bg: "#f0f9ff",
    borde: "#bae6fd",
    descripcion: "Atención de tickets asignados, registro de avance y soluciones",
  },
  {
    rol: "Cliente",
    nombre: "Laura Ramírez",
    correo: "cliente@prueba.com",
    icono: "👤",
    color: "#059669",
    bg: "#ecfdf5",
    borde: "#a7f3d0",
    descripcion: "Creación de tickets, equipos personales y calificaciones",
  },
];

export default function Login() {
  const [correo_electronico, setCorreoElectronico] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const navigate = useNavigate();
  const { sesion, guardarSesion } = useAuth();

  // Si ya hay sesión activa, redirigir al panel correspondiente
  useEffect(() => {
    if (sesion?.rol) {
      navigate(obtenerRutaPorRol(sesion.rol), { replace: true });
    }
  }, [sesion, navigate]);

  const ejecutarLogin = async (correo, pass) => {
    setError("");
    setCargando(true);
    try {
      const respuesta = await iniciarSesion(correo.trim(), pass);
      guardarSesion(respuesta);
      const destino = obtenerRutaPorRol(respuesta.rol);
      navigate(destino, { replace: true });
    } catch (err) {
      setError(err.message || "Correo o contraseña incorrectos");
    } finally {
      setCargando(false);
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!correo_electronico.trim() || !contrasena.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }
    await ejecutarLogin(correo_electronico, contrasena);
  };

  const seleccionarCuentaDemo = async (cuenta, entrarDirecto = false) => {
    setCorreoElectronico(cuenta.correo);
    setContrasena("Prueba123*");
    setError("");

    if (entrarDirecto) {
      await ejecutarLogin(cuenta.correo, "Prueba123*");
    }
  };

  const manejarReiniciarDatos = () => {
    reiniciarBaseDeDatos();
    setMensajeExito("Base de datos de prueba restaurada al estado original.");
    setTimeout(() => setMensajeExito(""), 3500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-fondo-app, #f4f6f9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "var(--fuente-principal, sans-serif)",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--color-superficie, #ffffff)",
          padding: "36px 32px",
          borderRadius: "var(--radio-tarjeta, 14px)",
          boxShadow: "var(--sombra-elevada, 0 10px 30px rgba(15, 23, 42, 0.08))",
          border: "1px solid var(--color-borde, #e2e8f0)",
          width: "100%",
          maxWidth: "480px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <div
            style={{
              display: "inline-block",
              backgroundColor: "var(--color-primario, #0a369d)",
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: "20px",
              padding: "8px 18px",
              borderRadius: "var(--radio-boton, 8px)",
              marginBottom: "12px",
              letterSpacing: "0.5px",
            }}
          >
            SistemasAR
          </div>
          <h1
            style={{
              margin: "0 0 6px 0",
              fontSize: "24px",
              color: "var(--color-texto-principal, #0f172a)",
              fontWeight: 700,
            }}
          >
            Iniciar sesión
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "var(--color-texto-secundario, #64748b)",
            }}
          >
            Sistema de Gestión de Tickets de Soporte Técnico
          </p>
        </div>

        {/* Sección de Cuentas de Demostración */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "14px 14px 10px 14px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Credenciales de prueba (1-Clic)
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "#16a34a",
                backgroundColor: "#dcfce7",
                padding: "2px 8px",
                borderRadius: "12px",
                fontWeight: 600,
              }}
            >
              Pass: Prueba123*
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {CUENTAS_DEMO.map((cuenta) => (
              <div
                key={cuenta.rol}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  backgroundColor: cuenta.bg,
                  border: `1px solid ${cuenta.borde}`,
                  borderRadius: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                  <span style={{ fontSize: "18px" }}>{cuenta.icono}</span>
                  <div style={{ overflow: "hidden" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: cuenta.color,
                        lineHeight: 1.2,
                      }}
                    >
                      {cuenta.rol} • {cuenta.nombre}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#64748b",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {cuenta.correo}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => seleccionarCuentaDemo(cuenta, true)}
                    disabled={cargando}
                    style={{
                      padding: "5px 10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      backgroundColor: cuenta.color,
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "opacity 0.2s",
                    }}
                    title={`Entrar directamente como ${cuenta.rol}`}
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => seleccionarCuentaDemo(cuenta, false)}
                    disabled={cargando}
                    style={{
                      padding: "5px 8px",
                      fontSize: "11px",
                      backgroundColor: "#ffffff",
                      color: "#475569",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                    title="Llenar campos del formulario"
                  >
                    Llenar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {mensajeExito && (
          <div
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #86efac",
              color: "#166534",
              padding: "10px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            ✓ {mensajeExito}
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid var(--color-peligro, #ef4444)",
              color: "var(--color-peligro, #ef4444)",
              padding: "10px 12px",
              borderRadius: "var(--radio-boton, 8px)",
              fontSize: "13px",
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

          <div style={{ textAlign: "right", marginBottom: "16px" }}>
            <Link
              to="/recuperar"
              style={{
                fontSize: "13px",
                color: "var(--color-primario, #0a369d)",
                textDecoration: "none",
              }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Boton tipo="submit" variante="primario" anchoCompleto deshabilitado={cargando}>
            {cargando ? "Validando credenciales..." : "Ingresar con credenciales"}
          </Boton>
        </form>

        <div
          style={{
            marginTop: "18px",
            paddingTop: "14px",
            borderTop: "1px solid var(--color-borde, #e2e8f0)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px",
            color: "var(--color-texto-secundario, #64748b)",
          }}
        >
          <div>
            ¿Cliente nuevo?{" "}
            <Link
              to="/registro"
              style={{
                color: "var(--color-primario, #0a369d)",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Regístrate
            </Link>
          </div>

          <button
            type="button"
            onClick={manejarReiniciarDatos}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              fontSize: "11px",
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
            }}
            title="Restaura tickets y datos iniciales de datosFalsos"
          >
            Reset datos demo
          </button>
        </div>
      </div>
    </div>
  );
}