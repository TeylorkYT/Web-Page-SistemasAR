/**
 * ==============================================================================
 * SISTEMASAR - VISTA 16: ASIGNACIÓN DE TÉCNICO A TICKET (AsignarTecnico.jsx)
 * ==============================================================================
 * Desarrollado por: Teylork (Líder)
 *
 * Implementa la Vista 16 según el Mockup:
 * - Columna Izquierda: Listado de tickets pendientes con filtro por prioridad
 *   (Alta, Media, Baja), código, cliente, tipo de falla y selección activa.
 * - Columna Derecha: Detalle completo del ticket seleccionado y selector
 *   de técnicos con disponibilidad y carga de trabajo en tiempo real.
 * - Botón "ASIGNAR TÉCNICO" con retroalimentación inmediata.
 * - Consumo exclusivo a través de la capa de servicios (adminService.js).
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

  // Carga inicial mediante servicios con patrón seguro para React 19
  useEffect(() => {
    let cancelado = false;

    Promise.all([obtenerTicketsPendientes("TODAS"), obtenerTecnicosParaAsignar()])
      .then(([listaTickets, listaTecnicos]) => {
        if (cancelado) return;
        setTickets(listaTickets);
        setTecnicos(listaTecnicos);

        // Seleccionar ticket por defecto: si viene por URL o el primero de la lista
        if (listaTickets.length > 0) {
          const buscado = paramId
            ? listaTickets.find((t) => String(t.id_ticket) === String(paramId))
            : null;
          setTicketSeleccionadoId(buscado ? buscado.id_ticket : listaTickets[0].id_ticket);
        }

        // Seleccionar primer técnico por defecto (ej. Diana M. según mockup)
        if (listaTecnicos.length > 0) {
          setTecnicoSeleccionadoId(listaTecnicos[0].id_tecnico);
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

  // Manejar cambio de filtro de prioridad
  const manejarCambioFiltro = async (nuevaPrioridad) => {
    setFiltroPrioridad(nuevaPrioridad);
    try {
      const filtrados = await obtenerTicketsPendientes(nuevaPrioridad);
      setTickets(filtrados);
      if (filtrados.length > 0 && !filtrados.some((t) => t.id_ticket === ticketSeleccionadoId)) {
        setTicketSeleccionadoId(filtrados[0].id_ticket);
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

    setAsignando(true);
    try {
      const respuesta = await asignarTecnicoATicket(ticketSeleccionadoId, tecnicoSeleccionadoId);
      mostrarAlerta("exito", respuesta.mensaje);

      // Actualizar listado local de tickets removiendo el asignado
      const restantes = tickets.filter((t) => t.id_ticket !== ticketSeleccionadoId);
      setTickets(restantes);

      // Actualizar lista de técnicos (carga incrementada)
      const nuevosTecnicos = await obtenerTecnicosParaAsignar();
      setTecnicos(nuevosTecnicos);

      // Seleccionar automáticamente el siguiente ticket si queda alguno
      if (restantes.length > 0) {
        setTicketSeleccionadoId(restantes[0].id_ticket);
      } else {
        setTicketSeleccionadoId(null);
      }
    } catch (err) {
      mostrarAlerta("error", err.message || "Error al asignar el técnico");
    } finally {
      setAsignando(false);
    }
  };

  // Navegación del menú lateral
  const manejarCambioItemMenu = (id) => {
    const rutas = {
      dashboard: "/admin",
      usuarios: "/admin/usuarios",
      asignacion: "/admin/tickets/1/asignar",
      categorias: "/admin/categorias",
      inventario: "/admin/inventario",
      reportes: "/admin/reportes",
      calificaciones: "/admin/calificaciones"
    };
    if (rutas[id]) navigate(rutas[id]);
  };

  const ticketActivo = tickets.find((t) => t.id_ticket === ticketSeleccionadoId);

  return (
    <Layout
      rol="administrador"
      itemActivo="asignacion"
      nombreUsuario="Marlon Monsalve"
      onCambiarItem={manejarCambioItemMenu}
    >
      <div className="asignar-pagina">
        {/* Encabezado principal */}
        <header className="asignar-header-principal">
          <h1 className="asignar-titulo-principal">Asignación de Técnico a Ticket</h1>
        </header>

        {/* Notificación de alerta */}
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
             * COLUMNA IZQUIERDA: TICKETS PENDIENTES
             * -------------------------------------------------------------- */}
            <section className="columna-tickets" aria-labelledby="titulo-pendientes">
              <div className="columna-tickets-header">
                <h2 id="titulo-pendientes" className="columna-tickets-titulo">
                  Tickets Pendientes
                </h2>

                <select
                  className="filtro-prioridad-select"
                  value={filtroPrioridad}
                  onChange={(e) => manejarCambioFiltro(e.target.value)}
                  aria-label="Filtrar por prioridad"
                >
                  <option value="TODAS">[Filtro: Prioridad ▾]</option>
                  <option value="ALTA">Alta</option>
                  <option value="MEDIA">Media</option>
                  <option value="BAJA">Baja</option>
                </select>
              </div>

              {tickets.length === 0 ? (
                <div className="asignar-vacio">
                  <p>No hay tickets pendientes con este filtro.</p>
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
                        onClick={() => setTicketSeleccionadoId(tkt.id_ticket)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setTicketSeleccionadoId(tkt.id_ticket);
                          }
                        }}
                      >
                        <div className="tarjeta-ticket-top">
                          <span className="tarjeta-ticket-id">
                            ID: {tkt.codigo}
                          </span>
                          <span className={`badge-prioridad ${clasePrioridad}`}>
                            [{tkt.prioridad}]{" "}
                            {(tkt.prioridad === "ALTA" || tkt.prioridad === "CRITICA") && "⚠️"}
                          </span>
                        </div>

                        <div className="tarjeta-ticket-cuerpo">
                          <div className="tarjeta-ticket-linea">
                            <span className="ticket-icono-sutil">👤</span>
                            <span className="ticket-etiqueta-gris">Cliente:</span>
                            <span className="ticket-valor-destacado">{tkt.cliente}</span>
                          </div>

                          <div className="tarjeta-ticket-linea">
                            <span className="ticket-icono-sutil">
                              {tkt.categoria === "Hardware" ? "💻" : "🌐"}
                            </span>
                            <span className="ticket-etiqueta-gris">Falla:</span>
                            <span className="ticket-valor-destacado">{tkt.falla}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* --------------------------------------------------------------
             * COLUMNA DERECHA: DETALLE Y ASIGNACIÓN
             * -------------------------------------------------------------- */}
            <section className="columna-detalle" aria-labelledby="titulo-detalle">
              <div className="panel-detalle-asignacion">
                <h2 id="titulo-detalle" className="detalle-header-titulo">
                  Detalle y Asignación
                </h2>

                {ticketActivo ? (
                  <>
                    {/* Metadatos en formato clave-valor */}
                    <div className="detalle-datos-tabla">
                      <div className="detalle-dato-fila">
                        <span className="detalle-dato-clave">ID:</span>
                        <span className="detalle-dato-valor id-destacado">
                          #{ticketActivo.codigo}
                        </span>
                      </div>
                      <div className="detalle-dato-fila">
                        <span className="detalle-dato-clave">Cliente:</span>
                        <span className="detalle-dato-valor">{ticketActivo.cliente}</span>
                      </div>
                      <div className="detalle-dato-fila">
                        <span className="detalle-dato-clave">Falla:</span>
                        <span className="detalle-dato-valor">{ticketActivo.falla}</span>
                      </div>
                      <div className="detalle-dato-fila">
                        <span className="detalle-dato-clave">Categoría:</span>
                        <span className="detalle-dato-valor">{ticketActivo.categoria}</span>
                      </div>
                      <div className="detalle-dato-fila">
                        <span className="detalle-dato-clave">Creación:</span>
                        <span className="detalle-dato-valor">
                          {ticketActivo.fecha_creacion_texto}
                        </span>
                      </div>
                    </div>

                    {/* Descripción del ticket */}
                    <div className="detalle-bloque-descripcion">
                      <h3 className="detalle-desc-titulo">Descripción:</h3>
                      <p className="detalle-desc-parrafo">
                        {ticketActivo.descripcion}
                      </p>
                    </div>

                    {/* Selector de técnico */}
                    <div className="seccion-seleccionar-tecnico">
                      <h3 className="seleccionar-tecnico-titulo">Seleccionar Técnico</h3>

                      <div className="lista-opciones-tecnicos" role="radiogroup">
                        {tecnicos.map((tec) => {
                          const estaSeleccionado = tec.id_tecnico === tecnicoSeleccionadoId;
                          const esLibre = tec.cargaTickets === 0 || tec.estado === "Libre";

                          return (
                            <div
                              key={tec.id_tecnico}
                              className={`opcion-tecnico-item ${
                                estaSeleccionado ? "seleccionado" : ""
                              }`}
                              onClick={() => setTecnicoSeleccionadoId(tec.id_tecnico)}
                            >
                              <div className="tecnico-radio-contenedor">
                                <input
                                  type="radio"
                                  id={`radio-tecnico-${tec.id_tecnico}`}
                                  name="tecnicoSeleccionado"
                                  className="tecnico-radio-input"
                                  checked={estaSeleccionado}
                                  onChange={() => setTecnicoSeleccionadoId(tec.id_tecnico)}
                                />
                                <label
                                  htmlFor={`radio-tecnico-${tec.id_tecnico}`}
                                  className="tecnico-nombre-label"
                                >
                                  {tec.nombre}
                                </label>
                              </div>

                              <span
                                className={`tecnico-badge-disponibilidad ${
                                  esLibre ? "libre" : "ocupado"
                                }`}
                              >
                                ● {tec.estado} ●
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Botón de acción */}
                    <button
                      type="button"
                      className="boton-asignar-tecnico-accion"
                      onClick={manejarAsignarTecnico}
                      disabled={asignando || !tecnicoSeleccionadoId}
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