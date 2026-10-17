import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import {
  obtenerTicketsTecnico,
  obtenerMetricasDashboardTecnico,
  obtenerTecnicoActual
} from "../../services/tecnicoService";
import "./DashboardTecnico.css";

export default function DashboardTecnico() {
  const navigate = useNavigate();
  const { sesion } = useAuth();

  const [tecnico, setTecnico] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [metricas, setMetricas] = useState({
    ticketsAsignados: 0,
    ticketsEnProceso: 0,
    ticketsResueltos: 0,
    ticketsCerrados: 0
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function cargarDatos() {
      try {
        const [datosTecnico, ticketsAsignados, metricasResumen] = await Promise.all([
          obtenerTecnicoActual(),
          obtenerTicketsTecnico(),
          obtenerMetricasDashboardTecnico()
        ]);

        if (!cancelado) {
          setTecnico(datosTecnico);
          setTickets(ticketsAsignados);
          setMetricas(metricasResumen);
          setCargando(false);
        }
      } catch (error) {
        if (!cancelado) {
          console.error("Error al cargar el dashboard del técnico:", error);
          setCargando(false);
        }
      }
    }

    cargarDatos();

    return () => {
      cancelado = true;
    };
  }, []);

  const nombreTecnico = sesion?.nombre || (tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : "Técnico");

  const manejarCambioMenu = (id) => {
    if (id === "dashboard") {
      navigate("/tecnico");
    } else if (id === "tickets-asignados") {
      navigate("/tecnico/tickets");
    }
  };

  // Cálculo de distribución por prioridad
  const totalTickets = tickets.length || 1;
  const prioridadCounts = {
    Critica: tickets.filter((t) => t.prioridad === "Critica").length,
    Alta: tickets.filter((t) => t.prioridad === "Alta").length,
    Media: tickets.filter((t) => t.prioridad === "Media").length,
    Baja: tickets.filter((t) => t.prioridad === "Baja").length
  };

  // Tickets que requieren atención inmediata (En Proceso o Alta/Crítica sin resolver)
  const ticketsAtencionInmediata = tickets
    .filter((t) => t.estado === "En_Proceso" || t.prioridad === "Critica" || t.prioridad === "Alta")
    .slice(0, 5);

  const tasaResolucion = metricas.ticketsAsignados > 0
    ? Math.round(((metricas.ticketsResueltos + metricas.ticketsCerrados) / metricas.ticketsAsignados) * 100)
    : 100;

  return (
    <Layout
      rol="tecnico"
      itemActivo="dashboard"
      nombreUsuario={nombreTecnico}
      onCambiarItem={manejarCambioMenu}
    >
      <div className="dashboard-tecnico-contenedor">
        {/* Encabezado del Dashboard */}
        <header className="dashboard-tecnico-header">
          <div>
            <h1 className="dashboard-tecnico-titulo">Dashboard Operativo</h1>
            <p className="dashboard-tecnico-subtitulo">
              Bienvenido(a), <strong>{nombreTecnico}</strong>. Resumen analítico de tu carga de soporte y rendimiento.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/tecnico/tickets")}
            style={{
              backgroundColor: "var(--color-primario, #0a369d)",
              color: "white",
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              fontWeight: "600",
              fontSize: "0.9rem",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(10, 54, 157, 0.2)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            📋 Ir a Tickets Asignados ({tickets.length}) →
          </button>
        </header>

        {/* 1. Tarjetas Métricas KPI */}
        <section className="dashboard-tecnico-metricas" aria-label="Métricas del técnico">
          <div className="metrica-card">
            <div className="metrica-card-header">
              <span className="metrica-card-titulo">Total Asignados</span>
              <span className="metrica-card-icono" style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>
                📋
              </span>
            </div>
            <span className="metrica-card-valor">{cargando ? "..." : metricas.ticketsAsignados}</span>
            <span className="metrica-card-desc">Carga total bajo tu responsabilidad</span>
          </div>

          <div className="metrica-card">
            <div className="metrica-card-header">
              <span className="metrica-card-titulo">En Atención Activa</span>
              <span className="metrica-card-icono" style={{ backgroundColor: "#fef3c7", color: "#b45309" }}>
                ⚙️
              </span>
            </div>
            <span className="metrica-card-valor" style={{ color: "#d97706" }}>
              {cargando ? "..." : metricas.ticketsEnProceso}
            </span>
            <span className="metrica-card-desc">En diagnóstico o reparación</span>
          </div>

          <div className="metrica-card">
            <div className="metrica-card-header">
              <span className="metrica-card-titulo">Resueltos</span>
              <span className="metrica-card-icono" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>
                ✅
              </span>
            </div>
            <span className="metrica-card-valor" style={{ color: "#16a34a" }}>
              {cargando ? "..." : metricas.ticketsResueltos}
            </span>
            <span className="metrica-card-desc">Solución técnica aplicada</span>
          </div>

          <div className="metrica-card">
            <div className="metrica-card-header">
              <span className="metrica-card-titulo">Cerrados</span>
              <span className="metrica-card-icono" style={{ backgroundColor: "#f1f5f9", color: "#475569" }}>
                🔒
              </span>
            </div>
            <span className="metrica-card-valor" style={{ color: "#334155" }}>
              {cargando ? "..." : metricas.ticketsCerrados}
            </span>
            <span className="metrica-card-desc">Histórico con ciclo completado</span>
          </div>
        </section>

        {/* 2. Paneles Analíticos: Distribución de Prioridad y Rendimiento */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "28px" }}>
          {/* Panel Distribución por Prioridad */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--color-borde, #e2e8f0)", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "1.05rem", color: "#0f2e5e", fontWeight: 700 }}>
              Distribución por Prioridad
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { etiqueta: "Crítica", valor: prioridadCounts.Critica, color: "#dc2626", bg: "#fef2f2" },
                { etiqueta: "Alta", valor: prioridadCounts.Alta, color: "#ea580c", bg: "#fff7ed" },
                { etiqueta: "Media", valor: prioridadCounts.Media, color: "#0284c7", bg: "#f0f9ff" },
                { etiqueta: "Baja", valor: prioridadCounts.Baja, color: "#64748b", bg: "#f8fafc" }
              ].map((item) => {
                const porcentaje = Math.round((item.valor / totalTickets) * 100);
                return (
                  <div key={item.etiqueta}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                      <span style={{ color: item.color }}>● {item.etiqueta}</span>
                      <span style={{ color: "#475569" }}>{item.valor} ({porcentaje}%)</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", backgroundColor: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${porcentaje}%`,
                          height: "100%",
                          backgroundColor: item.color,
                          borderRadius: "4px",
                          transition: "width 0.4s ease"
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel de Rendimiento y Estado */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid var(--color-borde, #e2e8f0)", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ margin: "0 0 16px", fontSize: "1.05rem", color: "#0f2e5e", fontWeight: 700 }}>
                Rendimiento de Mesa
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                <div style={{ width: "70px", height: "70px", borderRadius: "50%", background: `conic-gradient(#16a34a ${tasaResolucion * 3.6}deg, #e2e8f0 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "54px", height: "54px", borderRadius: "50%", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.95rem", color: "#16a34a" }}>
                    {tasaResolucion}%
                  </div>
                </div>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "0.95rem", color: "#1e293b" }}>Tasa de Resolución</h4>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                    Casos resueltos o cerrados respecto a tu volumen total asignado.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Estado operativo:</span>
              <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold", backgroundColor: "#dcfce7", color: "#15803d" }}>
                🟢 Activo y disponible
              </span>
            </div>
          </div>
        </section>

        {/* 3. Sección: Casos Prioritarios y Recientes */}
        <section className="dashboard-tabla-seccion">
          <div className="dashboard-tabla-header-barra">
            <div>
              <h2 className="dashboard-tabla-titulo">Casos que Requieren Atención Inmediata</h2>
              <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                Tickets en estado "En Proceso" o de alta prioridad asignados a tu cuenta
              </p>
            </div>
            <Link
              to="/tecnico/tickets"
              style={{
                color: "var(--color-primario, #0a369d)",
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none"
              }}
            >
              Ver todos los tickets ({tickets.length}) →
            </Link>
          </div>

          <div className="tabla-responsive-wrapper">
            {cargando ? (
              <div className="estado-vacio-tabla">
                <p className="estado-vacio-texto">Cargando casos prioritarios...</p>
              </div>
            ) : ticketsAtencionInmediata.length === 0 ? (
              <div className="estado-vacio-tabla">
                <div className="estado-vacio-icono">✨</div>
                <p className="estado-vacio-texto">¡Al día! No tienes casos críticos o en proceso pendientes.</p>
                <p className="estado-vacio-subtexto">
                  Todos tus tickets asignados están resueltos o cerrados.
                </p>
              </div>
            ) : (
              <table className="tabla-tickets">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título / Problema</th>
                    <th>Cliente</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketsAtencionInmediata.map((ticket) => (
                    <tr key={ticket.id_ticket}>
                      <td>
                        <span className="ticket-id-tag">#{ticket.id_ticket}</span>
                      </td>
                      <td>
                        <div className="ticket-titulo-texto">{ticket.titulo}</div>
                      </td>
                      <td>
                        <div className="cliente-nombre">
                          {ticket.cliente?.nombre} {ticket.cliente?.apellido}
                        </div>
                      </td>
                      <td>
                        <span className={`badge-prioridad ${ticket.prioridad}`}>
                          {ticket.prioridad}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-estado ${ticket.estado}`}>
                          {ticket.estado.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/tecnico/tickets/${ticket.id_ticket}`}
                          className="btn-ver-detalle"
                          title="Gestionar caso"
                        >
                          Gestionar ➜
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}