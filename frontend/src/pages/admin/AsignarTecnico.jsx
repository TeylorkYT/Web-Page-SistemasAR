/**
 * ==============================================================================
 * SISTEMASAR - VISTA 16: ASIGNACIÓN DE TÉCNICO A TICKET (AsignarTecnico.jsx)
 * ==============================================================================
 * Desarrollado por: Teylork (Líder)
 *
 * Adaptado al Documento Definitivo v2.0:
 * - Tickets pendientes: estado Abierto sin técnico.
 * - Filtro por prioridad con los 4 valores oficiales: Baja, Media, Alta, Critica (con color propio).
 * - Detalle del ticket: código "TKT-" + id, cliente (nombre y apellido), título,
 *   descripción, categorías (desde Ticket_Categoria) y fecha de creación.
 * - Selección de un solo técnico con disponibilidad y carga de tickets en En_Proceso.
 *   Técnicos en Fuera_de_Servicio aparecen deshabilitados; técnicos con 5 tickets muestran alerta.
 * - Ajuste de prioridad antes de asignar.
 * - Al asignar guarda id_tecnico, id_asignado_por, prioridad y pasa a En_Proceso,
 *   saliendo de la lista de pendientes.
 * - Consume exclusivamente la capa de servicios adminService.js.
 * ==============================================================================
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  obtenerTicketsPendientes,
  obtenerTecnicosParaAsignar,
  asignarTecnicoATicket
} from "../../services/adminService";
import "./AsignarTecnico.css";

export default function AsignarTecnico() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  // Estados de datos
  const [tickets, setTickets] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [ticketSeleccionadoId, setTicketSeleccionadoId] = useState(null);
  const [tecnicoSeleccionadoId, setTecnicoSeleccionadoId] = useState(null);
  const [prioridadAjustada, setPrioridadAjustada] = useState("Media");
  const [filtroPrioridad, setFiltroPrioridad] = useState("TODAS");

  const [cargando, setCargando] = useState(true);
  const [asignando, setAsignando] = useState(false);
  const [alerta, setAlerta] = useState(null);

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ tipo, mensaje });
    setTimeout(() => {
      setAlerta(null);
    }, 4500);
  };

  // Carga inicial reactiva
  useEffect(() => {
    let cancelado = false;

    Promise.all([obtenerTicketsPendientes("TODAS"), obtenerTecnicosParaAsignar()])
      .then(([listaTickets, listaTecnicos]) => {
        if (cancelado) return;
        setTickets(listaTickets);
        setTecnicos(listaTecnicos);

        if (listaTickets.length > 0) {
          const buscado = paramId
            ? listaTickets.find((t) => String(t.id_ticket) === String(paramId))
            : null;
          const elegido = buscado ? buscado : listaTickets[0];
          setTicketSeleccionadoId(elegido.id_ticket);
          setPrioridadAjustada(elegido.prioridad);
        }

        // Seleccionar primer técnico habilitado
        const primerHabilitado = listaTecnicos.find((t) => !t.deshabilitado);
        if (primerHabilitado) {
          setTecnicoSeleccionadoId(primerHabilitado.id_tecnico);
        }

        setCargando(false);
      })
      .catch((err) => {
        if (!cancelado) {
          mostrarAlerta("error", "Error al cargar datos: " + err.message);
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [paramId]);

  // Actualizar prioridad seleccionada al cambiar de ticket
  const seleccionarTicket = (tkt) => {
    setTicketSeleccionadoId(tkt.id_ticket);
    setPrioridadAjustada(tkt.prioridad);
  };

  // Manejar cambio de filtro de prioridad
  const manejarCambioFiltro = async (nuevaPrioridad) => {
    setFiltroPrioridad(nuevaPrioridad);
    try {
      const filtrados = await obtenerTicketsPendientes(nuevaPrioridad);
      setTickets(filtrados);
      if (filtrados.length > 0 && !filtrados.some((t) => t.id_ticket === ticketSeleccionadoId)) {
        setTicketSeleccionadoId(filtrados[0].id_ticket);
        setPrioridadAjustada(filtrados[0].prioridad);
      }
    } catch (err) {
      mostrarAlerta("error", "Error al filtrar tickets: " + err.message);
    }
  };

  // Asignar técnico al ticket seleccionado
  const manejarAsignarTecnico = async () => {
    if (!ticketSeleccionadoId) {
      mostrarAlerta("error", "Debe seleccionar un ticket pendiente");
      return;
    }
    if (!tecnicoSeleccionadoId) {
      mostrarAlerta("error", "Debe seleccionar un técnico responsable");
      return;
    }

    const tecnicoElegido = tecnicos.find((t) => t.id_tecnico === tecnicoSeleccionadoId);
    if (tecnicoElegido?.deshabilitado) {
      mostrarAlerta("error", "El técnico seleccionado se encuentra Fuera de Servicio");
      return;
    }

    setAsignando(true);
    try {
      const respuesta = await asignarTecnicoATicket(
        ticketSeleccionadoId,
        tecnicoSeleccionadoId,
        prioridadAjustada
      );
      mostrarAlerta("exito", respuesta.mensaje);

      // Quitar de lista local de tickets
      const restantes = tickets.filter((t) => t.id_ticket !== ticketSeleccionadoId);
      setTickets(restantes);

      // Recargar lista de técnicos para refrescar contador de tickets en proceso
      const nuevosTecnicos = await obtenerTecnicosParaAsignar();
      setTecnicos(nuevosTecnicos);

      // Seleccionar automáticamente el siguiente ticket si queda alguno
      if (restantes.length > 0) {
        setTicketSeleccionadoId(restantes[0].id_ticket);
        setPrioridadAjustada(restantes[0].prioridad);
      } else {
        setTicketSeleccionadoId(null);
      }
    } catch (err) {
      mostrarAlerta("error", err.message || "Error al asignar el técnico");
    } finally {
      setAsignando(false);
    }
  };

  const ticketActivo = tickets.find((t) => t.id_ticket === ticketSeleccionadoId);
  const tecnicoSeleccionado = tecnicos.find((t) => t.id_tecnico === tecnicoSeleccionadoId);

  return (
    <Layout
      rol="administrador"
      itemActivo="asignacion"
      nombreUsuario="Carlos Administrador"
    >
      <div className="asignar-pagina">
        <header className="asignar-header-principal">
          <h1 className="asignar-titulo-principal">Asignación de Técnico a Ticket</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "0.95rem" }}>
            Bandeja de triaje y balanceo de carga técnica (Documento Definitivo v2.0)
          </p>
        </header>

        {alerta && (
          <div className={`asignar-alerta asignar-alerta-${alerta.tipo}`}>
            <span>{alerta.mensaje}</span>
            <button
              type="button"
              className="asignar-alerta-cerrar"
              onClick={() => setAlerta(null)}
              aria-label="Cerrar notificación"
            >
              ×
            </button>
          </div>
        )}

        {cargando ? (
          <div className="asignar-vacio">
            <p>Cargando tickets pendientes y técnicos...</p>
          </div>
        ) : (
          <div className="asignar-grid">
            {/* --------------------------------------------------------------
             * COLUMNA IZQUIERDA: TICKETS PENDIENTES (Abierto sin técnico)
             * -------------------------------------------------------------- */}
            <section className="columna-tickets" aria-labelledby="titulo-pendientes">
              <div className="columna-tickets-header">
                <h2 id="titulo-pendientes" className="columna-tickets-titulo">
                  Tickets Pendientes ({tickets.length})
                </h2>

                <select
                  className="filtro-prioridad-select"
                  value={filtroPrioridad}
                  onChange={(e) => manejarCambioFiltro(e.target.value)}
                  aria-label="Filtrar por prioridad"
                >
                  <option value="TODAS">[Todas las prioridades]</option>
                  <option value="Critica">Crítica</option>
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>

              {tickets.length === 0 ? (
                <div className="asignar-vacio">
                  <p>No hay tickets pendientes con este filtro de prioridad.</p>
                </div>
              ) : (
                <div className="tickets-pendientes-lista">
                  {tickets.map((tkt) => {
                    const estaSeleccionado = tkt.id_ticket === ticketSeleccionadoId;
                    const clasePrioridad = tkt.prioridad.toLowerCase();

                    return (
                      <div
                        key={tkt.id_ticket}
                        className={`tarjeta-ticket-pendiente ${
                          estaSeleccionado ? "seleccionado" : ""
                        }`}
                        onClick={() => seleccionarTicket(tkt)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            seleccionarTicket(tkt);
                          }
                        }}
                      >
                        <div className="tarjeta-ticket-top">
                          <span className="tarjeta-ticket-id">
                            {tkt.codigo}
                          </span>
                          <span className={`badge-prioridad ${clasePrioridad}`}>
                            [{tkt.prioridad}]{" "}
                            {(tkt.prioridad === "Alta" || tkt.prioridad === "Critica") && "⚠️"}
                          </span>
                        </div>

                        <div className="tarjeta-ticket-cuerpo">
                          <div className="tarjeta-ticket-linea">
                            <span className="ticket-icono-sutil">👤</span>
                            <span className="ticket-etiqueta-gris">Cliente:</span>
                            <span className="ticket-valor-destacado">{tkt.cliente}</span>
                          </div>

                          <div className="tarjeta-ticket-linea">
                            <span className="ticket-icono-sutil">📋</span>
                            <span className="ticket-etiqueta-gris">Título:</span>
                            <span className="ticket-valor-destacado">{tkt.titulo}</span>
                          </div>

                          <div className="tarjeta-ticket-linea">
                            <span className="ticket-icono-sutil">🏷️</span>
                            <span className="ticket-etiqueta-gris">Categorías:</span>
                            <span className="ticket-valor-destacado">
                              {Array.isArray(tkt.categorias) ? tkt.categorias.join(", ") : tkt.categoria}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* --------------------------------------------------------------
             * COLUMNA DERECHA: DETALLE DEL TICKET Y ASIGNACIÓN
             * -------------------------------------------------------------- */}
            <section className="columna-detalle" aria-labelledby="titulo-detalle">
              <div className="panel-detalle-asignacion">
                <h2 id="titulo-detalle" className="detalle-header-titulo">
                  Detalle y Asignación
                </h2>

                {ticketActivo ? (
                  <>
                    <div className="detalle-datos-tabla">
                      <div className="detalle-dato-fila">
                        <span className="detalle-dato-clave">Código:</span>
                        <span className="detalle-dato-valor id-destacado">
                          {ticketActivo.codigo}
                        </span>
                      </div>
                      <div className="detalle-dato-fila">
                        <span className="detalle-dato-clave">Cliente:</span>
                        <span className="detalle-dato-valor">{ticketActivo.cliente}</span>
                      </div>
                      <div className="detalle-dato-fila">
                        <span className="detalle-dato-clave">Título:</span>
                        <span className="detalle-dato-valor">{ticketActivo.titulo}</span>
                      </div>
                      <div className="detalle-dato-fila">
                        <span className="detalle-dato-clave">Categorías:</span>
                        <span className="detalle-dato-valor">
                          {Array.isArray(ticketActivo.categorias)
                            ? ticketActivo.categorias.join(", ")
                            : ticketActivo.categoria}
                        </span>
                      </div>
                      <div className="detalle-dato-fila">
                        <span className="detalle-dato-clave">Modalidad:</span>
                        <span className="detalle-dato-valor">{ticketActivo.modalidad || "Presencial"}</span>
                      </div>
                      <div className="detalle-dato-fila">
                        <span className="detalle-dato-clave">Creación:</span>
                        <span className="detalle-dato-valor">
                          {ticketActivo.fecha_creacion}
                        </span>
                      </div>
                    </div>

                    <div className="detalle-bloque-descripcion">
                      <h3 className="detalle-desc-titulo">Descripción de la falla:</h3>
                      <p className="detalle-desc-parrafo">
                        {ticketActivo.descripcion}
                      </p>
                    </div>

                    {/* Ajuste de Prioridad antes de asignar (Requisito D3) */}
                    <div style={{ marginTop: "18px", padding: "14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <label htmlFor="ajuste-prioridad" style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                        Ajustar nivel de prioridad antes de asignar:
                      </label>
                      <select
                        id="ajuste-prioridad"
                        value={prioridadAjustada}
                        onChange={(e) => setPrioridadAjustada(e.target.value)}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem", fontWeight: 600 }}
                      >
                        <option value="Critica">Crítica (SLA Urgente)</option>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media (Por defecto)</option>
                        <option value="Baja">Baja</option>
                      </select>
                    </div>

                    {/* Selector de técnico */}
                    <div className="seccion-seleccionar-tecnico">
                      <h3 className="seleccionar-tecnico-titulo">Seleccionar Técnico Asignado</h3>

                      {tecnicoSeleccionado?.alertaCarga && (
                        <div style={{ padding: "8px 12px", background: "#fffbeb", border: "1px solid #fef3c7", color: "#b45309", borderRadius: "6px", marginBottom: "12px", fontSize: "0.85rem" }}>
                          ⚠️ <strong>Alerta:</strong> Este técnico ya tiene 5 tickets en proceso simultáneos.
                        </div>
                      )}

                      <div className="lista-opciones-tecnicos" role="radiogroup">
                        {tecnicos.map((tec) => {
                          const estaSeleccionado = tec.id_tecnico === tecnicoSeleccionadoId;
                          const esFueraServicio = tec.deshabilitado;
                          const esDisponible = tec.disponibilidad === "Disponible";

                          return (
                            <div
                              key={tec.id_tecnico}
                              className={`opcion-tecnico-item ${estaSeleccionado ? "seleccionado" : ""} ${esFueraServicio ? "deshabilitado" : ""}`}
                              onClick={() => {
                                if (!esFueraServicio) {
                                  setTecnicoSeleccionadoId(tec.id_tecnico);
                                }
                              }}
                              style={{
                                opacity: esFueraServicio ? 0.5 : 1,
                                cursor: esFueraServicio ? "not-allowed" : "pointer"
                              }}
                            >
                              <div className="tecnico-radio-contenedor">
                                <input
                                  type="radio"
                                  id={`radio-tecnico-${tec.id_tecnico}`}
                                  name="tecnicoSeleccionado"
                                  className="tecnico-radio-input"
                                  checked={estaSeleccionado}
                                  disabled={esFueraServicio}
                                  onChange={() => setTecnicoSeleccionadoId(tec.id_tecnico)}
                                />
                                <label
                                  htmlFor={`radio-tecnico-${tec.id_tecnico}`}
                                  className="tecnico-nombre-label"
                                >
                                  {tec.nombre} ({tec.especialidad})
                                </label>
                              </div>

                              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                                  {tec.ticketsEnProceso} en proceso
                                </span>
                                <span
                                  className={`tecnico-badge-disponibilidad ${
                                    esDisponible ? "libre" : "ocupado"
                                  }`}
                                >
                                  ● {tec.estado}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Botón de asignación */}
                    <button
                      type="button"
                      className="boton-asignar-tecnico-accion"
                      onClick={manejarAsignarTecnico}
                      disabled={asignando || !tecnicoSeleccionadoId || tecnicoSeleccionado?.deshabilitado}
                    >
                      {asignando ? "ASIGNANDO..." : "ASIGNAR TÉCNICO"}
                    </button>
                  </>
                ) : (
                  <div className="asignar-vacio">
                    <p>No hay ningún ticket seleccionado para asignar.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}