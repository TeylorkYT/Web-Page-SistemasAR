import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import EstadoBadge from "../../components/EstadoBadge";
import { useAuth } from "../../context/AuthContext";
import { obtenerDashboardCliente } from "../../services/clienteService";

export default function DashboardCliente() {
  const navigate = useNavigate();
  const { sesion } = useAuth();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resultado = await obtenerDashboardCliente();
        setDatos(resultado);
      } catch (error) {
        console.error("Error al cargar dashboard:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const nombreUsuario = sesion?.nombre
    ? `${sesion.nombre} ${sesion.apellido || ""}`.trim()
    : "Cliente";

  if (cargando) {
    return (
      <Layout rol="cliente" itemActivo="dashboard" nombreUsuario={nombreUsuario}>
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Cargando panel...</div>
      </Layout>
    );
  }

  return (
    <Layout rol="cliente" itemActivo="dashboard" nombreUsuario={nombreUsuario}>
      <div style={{ padding: "24px", fontFamily: "var(--fuente-principal, sans-serif)", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.75rem", color: "var(--color-texto-principal, #0f172a)", fontWeight: 700 }}>
              Mi Panel de Control
            </h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.95rem" }}>
              Bienvenido(a), {nombreUsuario}. Gestiona tus solicitudes de soporte técnico.
            </p>
          </div>
          <Link
            to="/cliente/tickets/nuevo"
            style={{
              backgroundColor: "var(--color-primario, #0a369d)",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 2px 4px rgba(10, 54, 157, 0.2)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span>+</span> Nuevo Ticket
          </Link>
        </div>
        
        {/* Tarjetas de Resumen */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          <TarjetaResumen titulo="Total Tickets" valor={datos?.resumen?.total} color="#0f172a" icono="📋" />
          <TarjetaResumen titulo="Abiertos" valor={datos?.resumen?.abiertos} color="#eab308" icono="⏳" />
          <TarjetaResumen titulo="En Proceso" valor={datos?.resumen?.enProceso} color="#3b82f6" icono="🔧" />
          <TarjetaResumen titulo="Resueltos / Cerrados" valor={(datos?.resumen?.resueltos || 0) + (datos?.resumen?.cerrados || 0)} color="#16a34a" icono="✅" />
        </div>

        {/* Tabla de Tickets Recientes */}
        <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid var(--color-borde, #e2e8f0)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "1.15rem", margin: 0, fontWeight: 700, color: "#1e293b" }}>Mis tickets recientes</h2>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#64748b" }}>Últimas solicitudes reportadas en la plataforma</p>
            </div>
            <Link to="/cliente/tickets" style={{ color: "var(--color-primario, #0a369d)", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
              Ver todos →
            </Link>
          </div>
          
          {datos?.ticketsRecientes && datos.ticketsRecientes.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <th style={{ padding: "12px 14px" }}>ID</th>
                    <th style={{ padding: "12px 14px" }}>Título</th>
                    <th style={{ padding: "12px 14px" }}>Equipo</th>
                    <th style={{ padding: "12px 14px" }}>Estado</th>
                    <th style={{ padding: "12px 14px", textAlign: "right" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.ticketsRecientes.map((ticket) => (
                    <tr key={ticket.id_ticket} style={{ borderBottom: "1px solid #f1f5f9", transition: "background-color 0.15s ease" }}>
                      <td style={{ padding: "14px", fontWeight: "bold" }}>
                        <Link
                          to={`/cliente/tickets/${ticket.id_ticket}`}
                          style={{ color: "var(--color-primario, #0a369d)", textDecoration: "none" }}
                        >
                          #{ticket.id_ticket}
                        </Link>
                      </td>
                      <td style={{ padding: "14px" }}>
                        <Link
                          to={`/cliente/tickets/${ticket.id_ticket}`}
                          style={{ color: "#1e293b", textDecoration: "none", fontWeight: 600 }}
                        >
                          {ticket.titulo}
                        </Link>
                      </td>
                      <td style={{ padding: "14px", color: "#64748b", fontSize: "0.9rem" }}>
                        {ticket.nombre_equipo || "—"}
                      </td>
                      <td style={{ padding: "14px" }}>
                        <EstadoBadge estado={ticket.estado} />
                      </td>
                      <td style={{ padding: "14px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                          {(ticket.estado === "Resuelto" || ticket.estado === "Cerrado") && !ticket.calificado && (
                            <button
                              type="button"
                              onClick={() => navigate(`/cliente/tickets/${ticket.id_ticket}/calificar`)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1px solid #fde047",
                                backgroundColor: "#fefce8",
                                color: "#854d0e",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer"
                              }}
                            >
                              ★ Calificar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => navigate(`/cliente/tickets/${ticket.id_ticket}`)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              backgroundColor: "#f8fafc",
                              color: "#334155",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            Ver detalle →
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#64748b" }}>
              <p style={{ margin: "0 0 12px" }}>No tienes tickets registrados aún.</p>
              <Link
                to="/cliente/tickets/nuevo"
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  backgroundColor: "var(--color-primario, #0a369d)",
                  color: "white",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              >
                Crear tu primer ticket
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function TarjetaResumen({ titulo, valor, color, icono }) {
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        borderLeft: `4px solid ${color}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        borderTop: "1px solid #e2e8f0",
        borderRight: "1px solid #e2e8f0",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <div>
        <p style={{ margin: "0 0 6px 0", fontSize: "14px", color: "#64748b", fontWeight: "600" }}>{titulo}</p>
        <h2 style={{ margin: 0, fontSize: "28px", color: color, fontWeight: 700 }}>{valor || 0}</h2>
      </div>
      {icono && <span style={{ fontSize: "28px", opacity: 0.85 }}>{icono}</span>}
    </div>
  );
}