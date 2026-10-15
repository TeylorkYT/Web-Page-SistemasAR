/**
 * ==============================================================================
 * SISTEMASAR - VISTA 20: CALIFICACIONES Y FEEDBACK (CalificacionesRecibidas.jsx)
 * ==============================================================================
 * Desarrollado por: Teylork (Líder)
 *
 * Implementa la Vista 20 según los Mockups:
 * - Filtros de búsqueda: Técnico, Rango temporal y Puntaje.
 * - Métricas de satisfacción: Promedio general (4.5/5), Mejor valorado (Diana M. 4.9/5)
 *   y Alertas de tickets con baja calificación.
 * - Historial de calificaciones: Tabla con estrellas, texto resumido y botón de acción.
 * - Modal de detalle del ticket: Comentario íntegro, contacto y acciones de seguimiento.
 * - Consumo exclusivo mediante la capa de servicios (adminService.js).
 * ==============================================================================
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  obtenerCalificacionesSupervision,
  obtenerMetricasSatisfaccion,
  enviarCorreoSeguimientoCliente
} from "../../services/adminService";
import "./CalificacionesRecibidas.css";

// Icono SVG de Engranaje para acciones
function IconoEngranaje() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );
}

export default function CalificacionesRecibidas() {
  const navigate = useNavigate();

  // Estados de datos
  const [calificaciones, setCalificaciones] = useState([]);
  const [metricas, setMetricas] = useState({
    promedioGeneral: "4.5",
    mejorValorado: { nombre: "Diana M.", promedio: "4.9" },
    alertasBajaCalif: 2
  });

  // Filtros de búsqueda
  const [filtroTecnico, setFiltroTecnico] = useState("todos");
  const [filtroRango, setFiltroRango] = useState("este_mes");
  const [filtroPuntaje, setFiltroPuntaje] = useState("todos");

  // Estados de interacción
  const [cargando, setCargando] = useState(true);
  const [alerta, setAlerta] = useState(null);
  const [ticketModal, setTicketModal] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ tipo, mensaje });
    setTimeout(() => {
      setAlerta(null);
    }, 4500);
  };

  // Carga inicial y reactiva a cambios de filtros
  useEffect(() => {
    let cancelado = false;

    Promise.all([
      obtenerCalificacionesSupervision({
        tecnico: filtroTecnico,
        rango: filtroRango,
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
  }, [filtroTecnico, filtroRango, filtroPuntaje]);

  // Manejador para enviar correo al cliente desde el modal
  const manejarEnviarCorreo = async () => {
    if (!ticketModal) return;

    try {
      const resp = await enviarCorreoSeguimientoCliente(
        ticketModal.codigo_ticket,
        ticketModal.contacto
      );
      mostrarAlerta("exito", resp.mensaje);
      setTicketModal(null);
    } catch (err) {
      mostrarAlerta("error", "No se pudo enviar el correo: " + err.message);
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

  return (
    <Layout
      rol="administrador"
      itemActivo="calificaciones"
      nombreUsuario="Marlon Monsalve"
      onCambiarItem={manejarCambioItemMenu}
    >
      <div className="calificaciones-pagina">
        {/* Encabezado principal */}
        <header className="calificaciones-header-principal">
          <h1 className="calificaciones-titulo-principal">
            Calificaciones y feedback de clientes
          </h1>
        </header>

        {/* Notificación visual */}
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
         * 1. FILTROS DE BÚSQUEDA (Mockup superior)
         * -------------------------------------------------------------------- */}
        <section className="seccion-filtros-calificaciones" aria-label="Filtros de búsqueda">
          <h2 className="filtros-titulo">Filtros de búsqueda</h2>

          <div className="filtros-inputs-fila">
            {/* Filtro: Técnico */}
            <div className="filtro-caja-select">
              <span className="filtro-icono">👤</span>
              <select
                className="filtro-select-nativo"
                value={filtroTecnico}
                onChange={(e) => setFiltroTecnico(e.target.value)}
                aria-label="Filtrar por técnico"
              >
                <option value="todos">Técnico: todos ▾</option>
                <option value="Carlos T.">Carlos T.</option>
                <option value="Diana M.">Diana M.</option>
                <option value="Luis F.">Luis F.</option>
                <option value="Andrés R.">Andrés R.</option>
              </select>
            </div>

            {/* Filtro: Rango */}
            <div className="filtro-caja-select">
              <span className="filtro-icono">📅</span>
              <select
                className="filtro-select-nativo"
                value={filtroRango}
                onChange={(e) => setFiltroRango(e.target.value)}
                aria-label="Filtrar por rango de tiempo"
              >
                <option value="este_mes">Rango: este mes ▾</option>
                <option value="todos">Rango: todos los meses ▾</option>
              </select>
            </div>

            {/* Filtro: Puntaje */}
            <div className="filtro-caja-select">
              <span className="filtro-icono">🔢</span>
              <select
                className="filtro-select-nativo"
                value={filtroPuntaje}
                onChange={(e) => setFiltroPuntaje(e.target.value)}
                aria-label="Filtrar por puntaje"
              >
                <option value="todos">Puntaje: todos (ej. mos) ▾</option>
                <option value="5">★★★★★ (5 estrellas)</option>
                <option value="4">★★★★ (4 estrellas)</option>
                <option value="3">★★★ (3 estrellas)</option>
                <option value="2">★★ (2 estrellas)</option>
                <option value="1">★ (1 estrella)</option>
              </select>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------------
         * 2. MÉTRICAS DE SATISFACCIÓN (3 Tarjetas según Mockup)
         * -------------------------------------------------------------------- */}
        <section className="seccion-metricas-satisfaccion" aria-label="Métricas de satisfacción">
          <h2 className="metricas-titulo">Métricas de satisfacción</h2>

          <div className="metricas-cards-grid">
            {/* Tarjeta 1: Promedio General */}
            <div className="tarjeta-satisfaccion">
              <div className="icono-caja-satisfaccion estrella">⭐</div>
              <div className="satisfaccion-info">
                <span className="satisfaccion-label">Promedio general</span>
                <span className="satisfaccion-valor">
                  <span className="valor-verde">{metricas.promedioGeneral}</span>/5
                </span>
              </div>
            </div>

            {/* Tarjeta 2: Mejor Valorado */}
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

            {/* Tarjeta 3: Alertas */}
            <div className="tarjeta-satisfaccion">
              <div className="icono-caja-satisfaccion alerta">⚠️</div>
              <div className="satisfaccion-info">
                <span className="satisfaccion-label">Alertas</span>
                <span className="satisfaccion-valor">
                  <span className="valor-rojo">
                    {metricas.alertasBajaCalif} tickets con baja calif.
                  </span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------------
         * 3. HISTORIAL DE CALIFICACIONES (Tabla según Mockup)
         * -------------------------------------------------------------------- */}
        <section className="seccion-historial-calificaciones" aria-label="Historial de calificaciones">
          <h2 className="historial-titulo">Historial de calificaciones</h2>

          <div className="tabla-calificaciones-contenedor">
            <table className="tabla-calificaciones">
              <thead>
                <tr>
                  <th scope="col">Ticket</th>
                  <th scope="col">Técnico</th>
                  <th scope="col">Calif.</th>
                  <th scope="col">Comentario</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "28px" }}>
                      Cargando historial de calificaciones...
                    </td>
                  </tr>
                ) : calificaciones.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "28px", color: "#64748b" }}>
                      No se encontraron calificaciones con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  calificaciones.map((item) => {
                    const esBajaCalif = item.puntuacion <= 2 || item.esAlerta;
                    return (
                      <tr key={item.id_calificacion}>
                        <td>
                          <span className="ticket-codigo-texto">{item.codigo_ticket}</span>
                        </td>
                        <td>{item.tecnico}</td>
                        <td>
                          <span className="estrellas-contenedor">
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
                        <td>
                          <button
                            type="button"
                            className="boton-engranaje-accion"
                            title="Ver detalle del feedback"
                            aria-label={`Ver detalles del ticket ${item.codigo_ticket}`}
                            onClick={() => setTicketModal(item)}
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
          <div className="paginacion-contenedor">
            <button
              type="button"
              className="paginacion-boton"
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
            >
              Anterior
            </button>
            <span>Página {paginaActual} de 8</span>
            <button
              type="button"
              className="paginacion-boton"
              onClick={() => setPaginaActual((prev) => Math.min(8, prev + 1))}
            >
              Siguiente
            </button>
          </div>
        </section>

        {/* ====================================================================
         * 4. MODAL: DETALLE DEL TICKET (MOCKUP 2)
         * ==================================================================== */}
        {ticketModal && (
          <div className="modal-superposicion" onClick={() => setTicketModal(null)}>
            <div
              className="modal-detalle-ticket-contenedor"
              onClick={(e) => e.stopPropagation()}
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
                    <span className="modal-dato-clave">Técnico asignado:</span>
                    <span className="modal-dato-valor">{ticketModal.tecnico}</span>
                  </div>

                  <div className="modal-dato-fila">
                    <span className="modal-dato-clave">Cliente:</span>
                    <span className="modal-dato-valor">
                      {ticketModal.cliente} (contacto: {ticketModal.contacto})
                    </span>
                  </div>

                  <div className="modal-dato-fila">
                    <span className="modal-dato-clave">Calificación:</span>
                    <span className="modal-dato-valor modal-calif-roja">
                      ★ ({ticketModal.puntuacion}/5)
                    </span>
                  </div>
                </div>

                <div className="modal-bloque-comentario">
                  <h4 className="modal-comentario-titulo">Comentario íntegro</h4>
                  <p className="modal-comentario-caja">
                    {ticketModal.comentario_completo}
                  </p>
                </div>
              </div>

              <div className="modal-footer-detalle">
                <button
                  type="button"
                  className="boton-modal-historial"
                  onClick={() => {
                    navigate("/cliente/tickets/1");
                  }}
                >
                  Ver historial completo del ticket
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