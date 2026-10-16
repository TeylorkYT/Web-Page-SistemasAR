/**
 * ==============================================================================
 * SISTEMASAR - VISTA 11: DETALLE DE TICKET ASIGNADO (DetalleTicketTecnico.jsx)
 * ==============================================================================
 * Desarrollado por: Cristian (Responsable del Módulo Técnico)
 *
 * Cumple con los requerimientos del Daily 2:
 * - Datos completos del ticket y opción interactiva de cambiar su estado.
 * - Criterio de aceptación explícito: "Vista 11: cambiar el estado actualiza el estado mostrado".
 * - Botón de acción directo para registrar avance (/tecnico/tickets/:id/avance).
 * - Consume datos exclusivamente desde la capa de servicios (tecnicoService.js).
 * ==============================================================================
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import Boton from "../../components/Boton";
import {
  obtenerDetalleTicket,
  cambiarEstadoTicket,
  obtenerTecnicoActual
} from "../../services/tecnicoService";
import "./DetalleTicketTecnico.css";

export default function DetalleTicketTecnico() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados
  const [tecnico, setTecnico] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estado del selector y feedback
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [actualizandoEstado, setActualizandoEstado] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    let cancelado = false;

    obtenerTecnicoActual().then((datos) => {
      if (!cancelado) setTecnico(datos);
    });

    obtenerDetalleTicket(id)
      .then((datos) => {
        if (!cancelado) {
          setTicket(datos);
          setEstadoSeleccionado(datos.estado);
          setCargando(false);
        }
      })
      .catch((err) => {
        if (!cancelado) {
          setError(err.message || "Error al cargar el detalle del ticket.");
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

  // Manejar cambio de estado del ticket
  const manejarGuardarEstado = async () => {
    if (!ticket || estadoSeleccionado === ticket.estado) return;

    setActualizandoEstado(true);
    setMensajeExito("");

    try {
      const ticketActualizado = await cambiarEstadoTicket(ticket.id_ticket, estadoSeleccionado);
      setTicket((prev) => ({
        ...prev,
        ...ticketActualizado,
        // Agregamos de inmediato la nueva entrada al historial local
        historial: [
          {
            id_historial: Date.now(),
            id_ticket: ticket.id_ticket,
            tipo_accion: "Cambio_Estado",
            estado_anterior: ticket.estado,
            estado_nuevo: estadoSeleccionado,
            fecha_accion: new Date().toISOString().replace("T", " ").substring(0, 19),
            detalles: `Estado actualizado a ${estadoSeleccionado.replace("_", " ")}.`
          },
          ...(prev.historial || [])
        ]
      }));

      setMensajeExito(`Estado actualizado correctamente a "${estadoSeleccionado.replace("_", " ")}".`);
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert("No se pudo actualizar el estado.");
    } finally {
      setActualizandoEstado(false);
    }
  };

  const manejarCambioMenu = (itemId) => {
    if (itemId === "dashboard" || itemId === "tickets-asignados") {
      navigate("/tecnico");
    } else if (itemId === "inventario-repuestos") {
      navigate("/tecnico/inventario");
    }
  };

  if (cargando) {
    return (
      <Layout rol="tecnico" itemActivo="tickets-asignados" nombreUsuario="Diana Paz">
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          <h2>Cargando ticket #{id}...</h2>
        </div>
      </Layout>
    );
  }

  if (error || !ticket) {
    return (
      <Layout rol="tecnico" itemActivo="tickets-asignados" nombreUsuario="Diana Paz">
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h2 style={{ color: "#dc2626" }}>Ticket no encontrado</h2>
          <p>{error || "El ticket solicitado no existe o no tienes permisos."}</p>
          <Boton variante="secundario" onClick={() => navigate("/tecnico")} texto="Volver al Dashboard" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      rol="tecnico"
      itemActivo="tickets-asignados"
      nombreUsuario={tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : "Diana Paz"}
      onCambiarItem={manejarCambioMenu}
    >
      <div className="detalle-ticket-contenedor">
        {/* Header Principal */}
        <header className="detalle-ticket-header">
          <div className="detalle-ticket-titulo-grupo">
            <span className="ticket-id-badge">#{ticket.id_ticket}</span>
            <h1 className="detalle-ticket-titulo">{ticket.titulo}</h1>
          </div>
          <div className="detalle-ticket-acciones-header">
            <Boton
              variante="secundario"
              onClick={() => navigate("/tecnico")}
              texto="⬅ Mis Tickets"
            />
            <Boton
              variante="primario"
              onClick={() => navigate(`/tecnico/tickets/${ticket.id_ticket}/avance`)}
              texto="📝 Registrar Avance"
            />
          </div>
        </header>

        {/* Notificación de éxito al cambiar estado */}
        {mensajeExito && (
          <div className="alerta-exito-flotante" role="alert">
            <span>✅ {mensajeExito}</span>
            <button
              type="button"
              onClick={() => setMensajeExito("")}
              style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. Barra de Control de Estado Rápido (Criterio de aceptación explícito) */}
        <section className="control-estado-banner" aria-label="Cambio de estado del ticket">
          <div className="control-estado-info">
            <span className="control-estado-label">Estado Actual:</span>
            <span className={`badge-estado ${ticket.estado}`}>
              {ticket.estado.replace("_", " ")}
            </span>
            <span className={`badge-prioridad ${ticket.prioridad}`} style={{ marginLeft: "8px" }}>
              Prioridad: {ticket.prioridad}
            </span>
          </div>

          <div className="control-estado-selector-box">
            <label htmlFor="select-estado" style={{ fontSize: "0.9rem", fontWeight: 600, color: "#334155" }}>
              Cambiar estado a:
            </label>
            <select
              id="select-estado"
              className="select-cambio-estado"
              value={estadoSeleccionado}
              onChange={(e) => setEstadoSeleccionado(e.target.value)}
              disabled={actualizandoEstado}
            >
              <option value="Abierto">Abierto</option>
              <option value="En_Proceso">En Proceso</option>
              <option value="Resuelto">Resuelto</option>
              <option value="Cerrado">Cerrado</option>
            </select>
            <Boton
              variante="primario"
              onClick={manejarGuardarEstado}
              deshabilitado={actualizandoEstado || estadoSeleccionado === ticket.estado}
              texto={actualizandoEstado ? "Guardando..." : "Actualizar Estado"}
            />
          </div>
        </section>

        {/* 2. Grid Principal con Información y Bitácora */}
        <div className="detalle-grid-principal">
          {/* Columna Izquierda: Información del problema y Bitácora */}
          <div>
            {/* Descripción del Requerimiento */}
            <div className="detalle-card">
              <h2 className="detalle-card-titulo">📋 Descripción del Problema</h2>
              <div className="detalle-descripcion-box">{ticket.descripcion}</div>

              {ticket.nombresCategorias && ticket.nombresCategorias.length > 0 && (
                <div style={{ marginTop: "14px" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>
                    Categorías de servicio:
                  </span>
                  <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                    {ticket.nombresCategorias.map((c, i) => (
                      <span key={i} className="cat-chip" style={{ fontSize: "0.85rem", padding: "4px 10px" }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Historial de Avances y Acciones */}
            <div className="detalle-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 className="detalle-card-titulo" style={{ margin: 0, border: "none", padding: 0 }}>
                  🕒 Historial del Ticket
                </h2>
                <button
                  type="button"
                  onClick={() => navigate(`/tecnico/tickets/${ticket.id_ticket}/avance`)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0a369d",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "0.88rem"
                  }}
                >
                  + Agregar nuevo avance
                </button>
              </div>

              <div className="timeline-historial">
                {ticket.historial && ticket.historial.length > 0 ? (
                  ticket.historial.map((item, idx) => (
                    <div key={item.id_historial || idx} className="timeline-item">
                      <div className="timeline-punto" />
                      <div className="timeline-contenido">
                        <div className="timeline-header">
                          <span className="timeline-tipo">{item.tipo_accion}</span>
                          <span className="timeline-fecha">{item.fecha_accion}</span>
                        </div>
                        <div className="timeline-detalles">{item.detalles}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>No hay registros en el historial todavía.</p>
                )}
              </div>
            </div>

            {/* Comentarios de Bitácora */}
            {ticket.comentarios && ticket.comentarios.length > 0 && (
              <div className="detalle-card">
                <h2 className="detalle-card-titulo">💬 Comentarios Registrados</h2>
                {ticket.comentarios.map((c) => (
                  <div key={c.id_comentario} className="comentario-item">
                    <div className="comentario-autor-fila">
                      <span className="comentario-autor">
                        {c.autor} ({c.rolAutor})
                      </span>
                      <span style={{ color: "#94a3b8" }}>{c.fecha_creacion}</span>
                    </div>
                    <div className="comentario-texto">{c.contenido}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Columna Derecha: Cliente, Equipo y Metadatos */}
          <div>
            {/* Tarjeta del Cliente */}
            <div className="detalle-card">
              <h2 className="detalle-card-titulo">👤 Datos del Cliente</h2>
              <div className="campo-fila">
                <span className="campo-etiqueta">Nombre:</span>
                <span className="campo-valor">
                  {ticket.cliente.nombre} {ticket.cliente.apellido}
                </span>
              </div>
              <div className="campo-fila">
                <span className="campo-etiqueta">Correo:</span>
                <span className="campo-valor">{ticket.cliente.correo_electronico}</span>
              </div>
            </div>

            {/* Tarjeta del Equipo */}
            <div className="detalle-card">
              <h2 className="detalle-card-titulo">💻 Equipo Registrado</h2>
              {ticket.equipo ? (
                <>
                  <div className="campo-fila">
                    <span className="campo-etiqueta">Tipo:</span>
                    <span className="campo-valor">{ticket.equipo.tipo}</span>
                  </div>
                  <div className="campo-fila">
                    <span className="campo-etiqueta">Marca / Modelo:</span>
                    <span className="campo-valor">
                      {ticket.equipo.marca} {ticket.equipo.modelo}
                    </span>
                  </div>
                  <div className="campo-fila">
                    <span className="campo-etiqueta">Número Serial:</span>
                    <span className="campo-valor" style={{ fontFamily: "monospace", color: "#0a369d" }}>
                      {ticket.equipo.serial}
                    </span>
                  </div>
                  {ticket.equipo.sistema_operativo && (
                    <div className="campo-fila">
                      <span className="campo-etiqueta">Sistema Op.:</span>
                      <span className="campo-valor">{ticket.equipo.sistema_operativo}</span>
                    </div>
                  )}
                  <div className="campo-fila">
                    <span className="campo-etiqueta">Estado Equipo:</span>
                    <span className="campo-valor">{ticket.equipo.estado_equipo}</span>
                  </div>
                </>
              ) : (
                <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>No hay equipo asociado a este ticket.</p>
              )}
            </div>

            {/* Tiempos y Fechas */}
            <div className="detalle-card">
              <h2 className="detalle-card-titulo">📅 Tiempos del Ticket</h2>
              <div className="campo-fila">
                <span className="campo-etiqueta">Creación:</span>
                <span className="campo-valor">{ticket.fecha_creacion}</span>
              </div>
              <div className="campo-fila">
                <span className="campo-etiqueta">Resolución:</span>
                <span className="campo-valor">
                  {ticket.fecha_resolucion || "Pendiente"}
                </span>
              </div>
              <div className="campo-fila">
                <span className="campo-etiqueta">Cierre formal:</span>
                <span className="campo-valor">{ticket.fecha_cierre || "Abierto"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}