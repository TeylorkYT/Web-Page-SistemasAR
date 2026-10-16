/**
 * ==============================================================================
 * SISTEMASAR - VISTA 10: DASHBOARD DEL TÉCNICO (DashboardTecnico.jsx)
 * ==============================================================================
 * Desarrollado por: Cristian (Responsable del Módulo Técnico)
 *
 * Cumple con los requerimientos del Daily 2:
 * - Muestra los tickets asignados al técnico en sesión (Diana Paz).
 * - Consume datos exclusivamente desde la capa de servicios (tecnicoService.js).
 * - Sin fetch directo ni importación directa de datosFalsos.js.
 * - Integra tarjetas de resumen métrico y tabla con filtro por estado.
 * - Enlaces directos al detalle de ticket (/tecnico/tickets/:id).
 * ==============================================================================
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import Boton from "../../components/Boton";
import {
  obtenerTicketsTecnico,
  obtenerMetricasDashboardTecnico,
  obtenerTecnicoActual
} from "../../services/tecnicoService";
import "./DashboardTecnico.css";

export default function DashboardTecnico() {
  const navigate = useNavigate();

  // Estados
  const [tecnico, setTecnico] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [metricas, setMetricas] = useState({
    ticketsAsignados: 0,
    ticketsEnProceso: 0,
    ticketsResueltos: 0,
    ticketsCerrados: 0,
    disponiblesRepuestos: 0
  });
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("Todos");

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

  // Manejo de navegación en menú lateral
  const manejarCambioMenu = (id) => {
    if (id === "dashboard" || id === "tickets-asignados") {
      navigate("/tecnico");
    } else if (id === "inventario-repuestos") {
      navigate("/tecnico/inventario");
    }
  };

  // Filtrado de tickets según pestaña activa
  const ticketsFiltrados = tickets.filter((t) => {
    if (filtroEstado === "Todos") return true;
    return t.estado === filtroEstado;
  });

  return (
    <Layout
      rol="tecnico"
      itemActivo="dashboard"
      nombreUsuario={tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : "Diana Paz"}
      onCambiarItem={manejarCambioMenu}
    >
      <div className="dashboard-tecnico-contenedor">
        {/* Encabezado del Dashboard */}
        <header className="dashboard-tecnico-header">
          <div>
            <h1 className="dashboard-tecnico-titulo">Dashboard del Técnico</h1>
            <p className="dashboard-tecnico-subtitulo">
              Bienvenida(o), {tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : "Diana Paz"}.
              Aquí puedes gestionar tus tickets asignados y consultar el inventario.
            </p>
          </div>
          <div className="dashboard-tecnico-acciones-rapidas">
            <Boton
              variante="secundario"
              onClick={() => navigate("/tecnico/inventario")}
              texto="📦 Consultar Inventario"
            />
          </div>
        </header>

        {/* 1. Tarjetas Métricas */}
        <section className="dashboard-tecnico-metricas" aria-label="Métricas del técnico">
          <div className="metrica-card">
            <div className="metrica-card-header">
              <span className="metrica-card-titulo">Tickets Asignados</span>
              <span className="metrica-card-icono" style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>
                📋
              </span>
            </div>
            <span className="metrica-card-valor">{cargando ? "..." : metricas.ticketsAsignados}</span>
            <span className="metrica-card-desc">Bajo tu responsabilidad directa</span>
          </div>

          <div className="metrica-card">
            <div className="metrica-card-header">
              <span className="metrica-card-titulo">En Proceso</span>
              <span className="metrica-card-icono" style={{ backgroundColor: "#fef3c7", color: "#b45309" }}>
                ⚙️
              </span>
            </div>
            <span className="metrica-card-valor" style={{ color: "#d97706" }}>
              {cargando ? "..." : metricas.ticketsEnProceso}
            </span>
            <span className="metrica-card-desc">Atención técnica activa</span>
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
            <span className="metrica-card-desc">Trabajo técnico finalizado</span>
          </div>

          <div className="metrica-card">
            <div className="metrica-card-header">
              <span className="metrica-card-titulo">Repuestos Disp.</span>
              <span className="metrica-card-icono" style={{ backgroundColor: "#f1f5f9", color: "#475569" }}>
                📦
              </span>
            </div>
            <span className="metrica-card-valor" style={{ color: "#334155" }}>
              {cargando ? "..." : metricas.disponiblesRepuestos}
            </span>
            <span className="metrica-card-desc">En inventario para servicio</span>
          </div>
        </section>

        {/* 2. Sección de Tickets Asignados */}
        <section className="dashboard-tabla-seccion">
          <div className="dashboard-tabla-header-barra">
            <h2 className="dashboard-tabla-titulo">Mis Tickets Asignados</h2>

            {/* Pestañas de Filtro */}
            <div className="filtros-pills" role="tablist">
              {["Todos", "En_Proceso", "Resuelto", "Cerrado"].map((estado) => (
                <button
                  key={estado}
                  type="button"
                  className={`filtro-pill-btn ${filtroEstado === estado ? "activo" : ""}`}
                  onClick={() => setFiltroEstado(estado)}
                >
                  {estado === "Todos" ? "Todos" : estado.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de contenido */}
          <div className="tabla-responsive-wrapper">
            {cargando ? (
              <div className="estado-vacio-tabla">
                <p className="estado-vacio-texto">Cargando tickets asignados...</p>
              </div>
            ) : ticketsFiltrados.length === 0 ? (
              <div className="estado-vacio-tabla">
                <div className="estado-vacio-icono">📭</div>
                <p className="estado-vacio-texto">No hay tickets en este estado</p>
                <p className="estado-vacio-subtexto">
                  {filtroEstado === "Todos"
                    ? "Actualmente no tienes tickets asignados en el sistema."
                    : `No tienes tickets con estado "${filtroEstado.replace("_", " ")}".`}
                </p>
              </div>
            ) : (
              <table className="tabla-tickets">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título / Problema</th>
                    <th>Cliente</th>
                    <th>Equipo</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketsFiltrados.map((ticket) => (
                    <tr key={ticket.id_ticket}>
                      <td>
                        <span className="ticket-id-tag">#{ticket.id_ticket}</span>
                      </td>
                      <td>
                        <div className="ticket-titulo-texto">{ticket.titulo}</div>
                        {ticket.nombresCategorias && ticket.nombresCategorias.length > 0 && (
                          <div className="ticket-categorias-tags">
                            {ticket.nombresCategorias.map((cat, idx) => (
                              <span key={idx} className="cat-chip">
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="cliente-nombre">
                          {ticket.cliente.nombre} {ticket.cliente.apellido}
                        </div>
                        <div className="cliente-correo">{ticket.cliente.correo_electronico}</div>
                      </td>
                      <td>
                        {ticket.equipo ? (
                          <div>
                            <div className="equipo-resumen">
                              {ticket.equipo.tipo} - {ticket.equipo.marca} {ticket.equipo.modelo}
                            </div>
                            <div className="equipo-serial">S/N: {ticket.equipo.serial}</div>
                          </div>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>No asignado</span>
                        )}
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
                          title="Ver detalle del ticket"
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