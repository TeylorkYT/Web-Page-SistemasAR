import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import { obtenerDashboardCliente } from "../../services/clienteService";

export default function DashboardCliente() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resultado = await obtenerDashboardCliente(1); // id_cliente = 1 (Laura)
        setDatos(resultado);
      } catch (error) {
        console.error("Error al cargar dashboard:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  if (cargando) {
    return (
      <Layout>
        <div style={{ padding: "20px", textAlign: "center" }}>Cargando panel...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: "20px", fontFamily: "var(--fuente-principal, sans-serif)" }}>
        <h1 style={{ marginBottom: "20px", color: "var(--color-texto-principal, #0f172a)" }}>
          Mi Panel de Control
        </h1>
        
        {/* Tarjetas de Resumen */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "20px", 
          marginBottom: "30px" 
        }}>
          <TarjetaResumen titulo="Total Tickets" valor={datos?.resumen.total} color="#0f172a" />
          <TarjetaResumen titulo="Abiertos" valor={datos?.resumen.abiertos} color="#eab308" />
          <TarjetaResumen titulo="En Proceso" valor={datos?.resumen.enProceso} color="#3b82f6" />
          <TarjetaResumen 
            titulo="Resueltos / Cerrados" 
            valor={(datos?.resumen.resueltos || 0) + (datos?.resumen.cerrados || 0)} 
            color="#16a34a" 
          />
        </div>

        {/* Tabla de Tickets Recientes */}
        <div style={{ 
          backgroundColor: "white", 
          padding: "20px", 
          borderRadius: "8px", 
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          border: "1px solid var(--color-borde, #e2e8f0)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h2 style={{ fontSize: "18px", margin: 0 }}>Mis tickets recientes</h2>
            <Link to="/cliente/crear" style={{
              backgroundColor: "var(--color-primario, #0a369d)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "bold"
            }}>
              + Nuevo Ticket
            </Link>
          </div>
          
          {datos?.ticketsRecientes && datos.ticketsRecientes.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#64748b" }}>
                    <th style={{ padding: "12px 8px" }}>ID</th>
                    <th style={{ padding: "12px 8px" }}>Título</th>
                    <th style={{ padding: "12px 8px" }}>Equipo</th>
                    <th style={{ padding: "12px 8px" }}>Fecha</th>
                    <th style={{ padding: "12px 8px" }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.ticketsRecientes.map((ticket) => (
                    <tr key={ticket.id_ticket} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 8px", fontWeight: "bold" }}>#{ticket.id_ticket}</td>
                      <td style={{ padding: "12px 8px" }}>{ticket.titulo}</td>
                      <td style={{ padding: "12px 8px", color: "#64748b" }}>{ticket.nombre_equipo}</td>
                      <td style={{ padding: "12px 8px", color: "#64748b" }}>{ticket.fecha_creacion}</td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          backgroundColor: ticket.estado === "Abierto" ? "#fef08a" : ticket.estado === "En_Proceso" ? "#bfdbfe" : "#bbf7d0",
                          color: ticket.estado === "Abierto" ? "#854d0e" : ticket.estado === "En_Proceso" ? "#1e40af" : "#166534"
                        }}>
                          {ticket.estado.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: "#64748b" }}>No tienes tickets registrados aún.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Subcomponente para las tarjetas de resumen
function TarjetaResumen({ titulo, valor, color }) {
  return (
    <div style={{
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "8px",
      borderLeft: `4px solid ${color}`,
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      borderTop: "1px solid #e2e8f0",
      borderRight: "1px solid #e2e8f0",
      borderBottom: "1px solid #e2e8f0"
    }}>
      <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#64748b", fontWeight: "600" }}>{titulo}</p>
      <h2 style={{ margin: 0, fontSize: "28px", color: color }}>{valor || 0}</h2>
    </div>
  );
}