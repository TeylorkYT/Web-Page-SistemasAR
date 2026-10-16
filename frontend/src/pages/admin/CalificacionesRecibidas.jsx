/**
 * ==============================================================================
 * SISTEMASAR - VISTA 20: CALIFICACIONES Y FEEDBACK (CalificacionesRecibidas.jsx)
 * ==============================================================================
 * Desarrollado por: Teylork (Líder)
 *
 * Adaptado al Documento Definitivo v2.0:
 * - Filtros: Técnico, Rango de fechas (sobre fecha_calificacion) y Puntaje (1 a 5).
 * - Métricas: Promedio general, Técnico mejor valorado y Alertas de tickets
 *   con calificación <= 2 estrellas.
 * - Tabla de historial: Código TKT-id, Técnico, Estrellas, Comentario, Acciones y Paginación.
 * - Modal de detalle: Técnico, Cliente, Calificación, Comentario completo,
 *   sección interactiva "Ver historial completo del ticket" con filas de Historial_Ticket
 *   y acción "Enviar correo al cliente" con mensaje de confirmación.
 * - Consume exclusivamente la capa de servicios adminService.js.
 * ==============================================================================
 */

import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import {
  obtenerCalificacionesSupervision,
  obtenerMetricasSatisfaccion,
  enviarCorreoSeguimientoCliente,
  obtenerHistorialTicketCalificacion,
  obtenerTecnicosParaAsignar
} from "../../services/adminService";
import "./CalificacionesRecibidas.css";

function IconoEngranaje() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );
}

export default function CalificacionesRecibidas() {
  // Estados de datos
  const [calificaciones, setCalificaciones] = useState([]);
  const [tecnicosLista, setTecnicosLista] = useState([]);
  const [metricas, setMetricas] = useState({
    promedioGeneral: "0.0",
    mejorValorado: { nombre: "...", promedio: "0.0" },
    alertasBajaCalif: 0
  });

  // Filtros
  const [filtroTecnico, setFiltroTecnico] = useState("todos");
  const [filtroRango, setFiltroRango] = useState("todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [filtroPuntaje, setFiltroPuntaje] = useState("todos");

  // Estados de interacción
  const [cargando, setCargando] = useState(true);
  const [alerta, setAlerta] = useState(null);
  const [ticketModal, setTicketModal] = useState(null);
  const [historialTicket, setHistorialTicket] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [correoEnviado, setCorreoEnviado] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);

  const elementosPorPagina = 5;

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ tipo, mensaje });
    setTimeout(() => {
      setAlerta(null);
    }, 4500);
  };

  // Cargar lista de técnicos para el selector de filtro
  useEffect(() => {
    obtenerTecnicosParaAsignar()
      .then((lista) => setTecnicosLista(lista))
      .catch((e) => console.error(e));
  }, []);

  // Carga reactiva de calificaciones y métricas
  useEffect(() => {
    let cancelado = false;

    Promise.all([
      obtenerCalificacionesSupervision({
        tecnico: filtroTecnico,
        rango: filtroRango,
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
        puntaje: filtroPuntaje
      }),
      obtenerMetricasSatisfaccion()
    ])
      .then(([listaCalif, datosMetricas]) => {
        if (!cancelado) {
          setCalificaciones(listaCalif);
          setMetricas(datosMetricas);
          setCargando(false);
        }
      })
      .catch((err) => {
        if (!cancelado) {
          mostrarAlerta("error", "Error al cargar calificaciones: " + err.message);
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [filtroTecnico, filtroRango, fechaInicio, fechaFin, filtroPuntaje]);

  // Manejar apertura de modal
  const abrirDetalleModal = (item) => {
    setTicketModal(item);
    setMostrarHistorial(false);
    setHistorialTicket([]);
    setCorreoEnviado(false);
  };

  // Ver historial completo del ticket (Requisito D4)
  const cargarHistorial = async () => {
    if (!ticketModal) return;
    setCargandoHistorial(true);
    setMostrarHistorial(true);
    try {
      const filas = await obtenerHistorialTicketCalificacion(ticketModal.id_ticket);
      setHistorialTicket(filas);
    } catch (err) {
      mostrarAlerta("error", "Error al cargar historial: " + err.message);
    } finally {
      setCargandoHistorial(false);
    }
  };

  // Enviar correo al cliente (Requisito D4)
  const manejarEnviarCorreo = async () => {
    if (!ticketModal) return;
    try {
      const respuesta = await enviarCorreoSeguimientoCliente(
        ticketModal.id_ticket,
        ticketModal.contacto
      );
      setCorreoEnviado(true);
      mostrarAlerta("exito", respuesta.mensaje);
    } catch (err) {
      mostrarAlerta("error", "Error al enviar correo: " + err.message);
    }
  };

  // Paginación
  const indiceUltimo = paginaActual * elementosPorPagina;
  const indicePrimero = indiceUltimo - elementosPorPagina;
  const calificacionesPaginadas = calificaciones.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(calificaciones.length / elementosPorPagina) || 1;

  return (
    <Layout
      rol="administrador"
      itemActivo="calificaciones"
      nombreUsuario="Carlos Administrador"
    >
      <div className="calificaciones-pagina">
        <header className="calificaciones-header-principal">
          <div>
            <h1 className="calificaciones-titulo-principal">Supervisión de Calificaciones</h1>
            <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "0.95rem" }}>
              Auditoría de satisfacción y alertas de servicio técnico (Documento Definitivo v2.0)
            </p>
          </div>
        </header>

        {alerta && (
          <div className={`calificaciones-alerta calificaciones-alerta-${alerta.tipo}`}>
            <span>{alerta.mensaje}</span>
            <button
              type="button"
              className="calificaciones-alerta-cerrar"
              onClick={() => setAlerta(null)}
              aria-label="Cerrar notificación"
            >
              ×
            </button>
          </div>
        )}

        {/* --------------------------------------------------------------------
         * 1. BARRA DE FILTROS SUPERIOR
         * -------------------------------------------------------------------- */}
        <section className="seccion-filtros-calificaciones" aria-label="Filtros de calificaciones">
          <div className="filtros-contenedor-flex" style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
            {/* Filtro: Técnico */}
            <div className="filtro-caja-select">
              <span className="filtro-icono">👤</span>
              <select
                className="filtro-select-nativo"
                value={filtroTecnico}
                onChange={(e) => setFiltroTecnico(e.target.value)}
                aria-label="Filtrar por técnico"
              >
                <option value="todos">[Todos los técnicos]</option>
                {tecnicosLista.map((tec) => (
                  <option key={tec.id_tecnico} value={tec.nombre}>
                    {tec.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro: Rango de Fechas */}
            <div className="filtro-caja-select">
              <span className="filtro-icono">📅</span>
              <select
                className="filtro-select-nativo"
                value={filtroRango}
                onChange={(e) => {
                  setFiltroRango(e.target.value);
                  setFechaInicio("");
                  setFechaFin("");
                }}
                aria-label="Filtrar por rango de tiempo"
              >
                <option value="todos">Todo el historial</option>
                <option value="este_mes">Agosto 2026</option>
              </select>
            </div>

            {/* Selector de Fechas Personalizadas */}
            <div style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "0.85rem", color: "#475569" }}>
              <span>Desde:</span>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
              <span>Hasta:</span>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
              />
            </div>

            {/* Filtro: Puntaje de 1 a 5 */}
            <div className="filtro-caja-select">
              <span className="filtro-icono">⭐</span>
              <select
                className="filtro-select-nativo"
                value={filtroPuntaje}
                onChange={(e) => setFiltroPuntaje(e.target.value)}
                aria-label="Filtrar por puntaje"
              >
                <option value="todos">[Todos los puntajes]</option>
                <option value="5">★★★★★ (5 estrellas)</option>
                <option value="4">★★★★ (4 estrellas)</option>
                <option value="3">★★★ (3 estrellas)</option>
                <option value="2">★★ (2 estrellas - Alerta)</option>
                <option value="1">★ (1 estrella - Alerta crítica)</option>
              </select>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------------
         * 2. MÉTRICAS DE SATISFACCIÓN (3 Tarjetas)
         * -------------------------------------------------------------------- */}
        <section className="seccion-metricas-satisfaccion" aria-label="Métricas de satisfacción">
          <h2 className="metricas-titulo">Métricas de satisfacción</h2>

          <div className="metricas-cards-grid">
            <div className="tarjeta-satisfaccion">
              <div className="icono-caja-satisfaccion estrella">⭐</div>
              <div className="satisfaccion-info">
                <span className="satisfaccion-label">Promedio general</span>
                <span className="satisfaccion-valor">
                  <span className="valor-verde">{metricas.promedioGeneral}</span>/5
                </span>
              </div>
            </div>

            <div className="tarjeta-satisfaccion">
              <div className="icono-caja-satisfaccion trofeo">🏆</div>
              <div className="satisfaccion-info">
                <span className="satisfaccion-label">Mejor valorado</span>
                <span className="satisfaccion-valor">
                  <span className="valor-morado">
                    {metricas.mejorValorado.nombre} ({metricas.mejorValorado.promedio}/5)
                  </span>
                </span>
              </div>
            </div>

            <div className="tarjeta-satisfaccion">
              <div className="icono-caja-satisfaccion alerta">⚠️</div>
              <div className="satisfaccion-info">
                <span className="satisfaccion-label">Alertas de baja calificación</span>
                <span className="satisfaccion-valor">
                  <span className="valor-rojo">
                    {metricas.alertasBajaCalif} ticket(s) ≤ 2 estrellas
                  </span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------------
         * 3. HISTORIAL DE CALIFICACIONES (Tabla)
         * -------------------------------------------------------------------- */}
        <section className="seccion-historial-calificaciones" aria-label="Historial de calificaciones">
          <h2 className="historial-titulo">Historial de calificaciones ({calificaciones.length})</h2>

          <div className="tabla-calificaciones-contenedor">
            <table className="tabla-calificaciones">
              <thead>
                <tr>
                  <th scope="col">Ticket</th>
                  <th scope="col">Técnico</th>
                  <th scope="col">Calif.</th>
                  <th scope="col">Comentario</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "28px" }}>
                      Cargando historial de calificaciones...
                    </td>
                  </tr>
                ) : calificaciones.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "28px", color: "#64748b" }}>
                      No se encontraron calificaciones con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  calificacionesPaginadas.map((item) => {
                    const esBajaCalif = item.puntuacion <= 2 || item.esAlerta;
                    return (
                      <tr key={item.id_calificacion}>
                        <td>
                          <span className="ticket-codigo-texto">{item.codigo_ticket}</span>
                        </td>
                        <td>{item.tecnico}</td>
                        <td>
                          <span className="estrellas-contenedor" style={{ color: esBajaCalif ? "#dc2626" : "#f59e0b" }}>
                            {"★".repeat(item.puntuacion)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`comentario-texto ${
                              esBajaCalif ? "alerta" : ""
                            }`}
                          >
                            {item.comentario_resumen}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.85rem", color: "#64748b" }}>
                          {item.fecha}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="boton-engranaje-accion"
                            title="Ver detalle del feedback"
                            aria-label={`Ver detalles del ticket ${item.codigo_ticket}`}
                            onClick={() => abrirDetalleModal(item)}
                          >
                            <IconoEngranaje />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="paginacion-contenedor">
              <button
                type="button"
                className="paginacion-boton"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
              >
                Anterior
              </button>
              <span>Página {paginaActual} de {totalPaginas}</span>
              <button
                type="button"
                className="paginacion-boton"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
              >
                Siguiente
              </button>
            </div>
          )}
        </section>

        {/* --------------------------------------------------------------------
         * 4. MODAL: DETALLE DE CALIFICACIÓN Y HISTORIAL COMPLETO DEL TICKET (D4)
         * -------------------------------------------------------------------- */}
        {ticketModal && (
          <div className="modal-superposicion" onClick={() => setTicketModal(null)}>
            <div
              className="modal-detalle-ticket-contenedor"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "600px" }}
            >
              <div className="modal-header-detalle">
                <h3 className="modal-titulo-detalle">
                  Detalle del ticket #{ticketModal.codigo_ticket}
                </h3>
                <button
                  type="button"
                  className="modal-boton-cerrar"
                  onClick={() => setTicketModal(null)}
                  aria-label="Cerrar modal"
                >
                  ×
                </button>
              </div>

              <div className="modal-cuerpo-detalle">
                <div className="modal-grid-datos">
                  <div className="modal-dato-fila">
                    <span className="modal-dato-clave">Técnico evaluado:</span>
                    <span className="modal-dato-valor">{ticketModal.tecnico}</span>
                  </div>

                  <div className="modal-dato-fila">
                    <span className="modal-dato-clave">Cliente:</span>
                    <span className="modal-dato-valor">
                      {ticketModal.cliente} (contacto: {ticketModal.contacto || "N/A"})
                    </span>
                  </div>

                  <div className="modal-dato-fila">
                    <span className="modal-dato-clave">Calificación:</span>
                    <span className={`modal-dato-valor ${ticketModal.puntuacion <= 2 ? "modal-calif-roja" : ""}`}>
                      {"★".repeat(ticketModal.puntuacion)} ({ticketModal.puntuacion}/5)
                    </span>
                  </div>

                  <div className="modal-dato-fila">
                    <span className="modal-dato-clave">Fecha de calificación:</span>
                    <span className="modal-dato-valor">{ticketModal.fecha_calificacion}</span>
                  </div>
                </div>

                <div className="modal-bloque-comentario">
                  <h4 className="modal-comentario-titulo">Comentario íntegro del cliente</h4>
                  <p className="modal-comentario-caja">
                    {ticketModal.comentario_completo}
                  </p>
                </div>

                {correoEnviado && (
                  <div style={{ marginTop: "12px", padding: "10px 14px", background: "#ecfdf5", color: "#065f46", borderRadius: "6px", fontSize: "0.85rem" }}>
                    ✓ Correo de seguimiento enviado exitosamente al cliente ({ticketModal.correo_cliente || ticketModal.contacto}).
                  </div>
                )}

                {/* Sección interactiva: Ver historial completo del ticket (Requisito D4) */}
                {mostrarHistorial && (
                  <div style={{ marginTop: "18px", borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
                    <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", color: "#1e293b", fontWeight: 700 }}>
                      Historial completo de auditoría (Historial_Ticket)
                    </h4>
                    {cargandoHistorial ? (
                      <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Cargando eventos de auditoría...</p>
                    ) : historialTicket.length === 0 ? (
                      <p style={{ color: "#64748b", fontSize: "0.85rem" }}>No se encontraron registros de auditoría para este ticket.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto" }}>
                        {historialTicket.map((h) => (
                          <div
                            key={h.id_historial}
                            style={{
                              padding: "8px 10px",
                              backgroundColor: "#f8fafc",
                              borderRadius: "6px",
                              borderLeft: "3px solid #2563eb",
                              fontSize: "0.8rem"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, color: "#0f172a" }}>
                              <span>[{h.tipo_accion}] {h.estado_nuevo ? `→ ${h.estado_nuevo}` : ""}</span>
                              <span style={{ color: "#64748b", fontSize: "0.75rem" }}>{h.fecha_accion}</span>
                            </div>
                            <div style={{ color: "#475569", marginTop: "2px" }}>{h.detalles}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-footer-detalle">
                <button
                  type="button"
                  className="boton-modal-historial"
                  onClick={cargarHistorial}
                >
                  {mostrarHistorial ? "Refrescar historial" : "Ver historial completo del ticket"}
                </button>

                <button
                  type="button"
                  className="boton-modal-correo"
                  onClick={manejarEnviarCorreo}
                >
                  Enviar correo al cliente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}