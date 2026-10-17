/**
 * ==============================================================================
 * SISTEMASAR - VISTA 14: DASHBOARD GENERAL DEL ADMINISTRADOR (DashboardAdmin.jsx)
 * ==============================================================================
 * Desarrollado por: Teylork (Líder)
 *
 * Implementa la Vista 14 según el Mockup de administrador:
 * - 3 Tarjetas métricas superiores: Tickets totales (120), Tickets abiertos (25), Técnicos activos (12).
 * - Gráfico comparativo de tickets abiertos vs cerrados con opción de alternar vista semanal.
 * - Tabla inferior de técnicos activos en este momento (Nombre, Estado, Ticket actual).
 * - Consume datos exclusivamente desde la capa de servicios (adminService.js).
 * ==============================================================================
 */

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { obtenerMetricasDashboard } from "../../services/adminService";
import "./DashboardAdmin.css";

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const { sesion } = useAuth();

  // Estados de datos
  const [metricas, setMetricas] = useState({
    ticketsTotales: 120,
    ticketsAbiertos: 25,
    tecnicosActivos: 12,
    graficoSemanal: [],
    graficoMensual: [],
    tecnicosMonitoreo: []
  });

  const [cargando, setCargando] = useState(true);
  const [comparativoSemanal, setComparativoSemanal] = useState(true);
  const [columnaActiva, setColumnaActiva] = useState(null);

  // Carga inicial mediante el servicio con patrón de suscripción asíncrona limpia
  useEffect(() => {
    let cancelado = false;

    obtenerMetricasDashboard()
      .then((datos) => {
        if (!cancelado) {
          setMetricas(datos);
          setCargando(false);
        }
      })
      .catch((err) => {
        if (!cancelado) {
          console.error("Error al cargar métricas:", err);
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, []);

  // Navegación rápida entre módulos desde el sidebar
  const manejarCambioItemMenu = (id) => {
    const rutas = {
      dashboard: "/admin",
      asignacion: "/admin/asignacion",
      tickets: "/admin/tickets",
      usuarios: "/admin/usuarios",
      categorias: "/admin/categorias",
      reportes: "/admin/reportes",
      calificaciones: "/admin/calificaciones"
    };
    if (rutas[id]) navigate(rutas[id]);
  };

  // Conjunto de datos a mostrar en el gráfico según el checkbox
  const datosGrafico = comparativoSemanal
    ? metricas.graficoSemanal || []
    : metricas.graficoMensual || [];

  return (
    <Layout
      rol="administrador"
      itemActivo="dashboard"
      nombreUsuario={sesion?.nombre || "Administrador"}
      onCambiarItem={manejarCambioItemMenu}
    >
      <div className="dashboard-admin-pagina">
        {/* Encabezado principal */}
        <header className="dashboard-admin-header">
          <h1 className="dashboard-admin-titulo">Dashboard general</h1>
        </header>

        {/* --------------------------------------------------------------------
         * 1. TRES TARJETAS DE MÉTRICAS PRINCIPALES (Mockup superior)
         * -------------------------------------------------------------------- */}
        <section className="dashboard-metricas-grid" aria-label="Métricas clave">
          <div className="tarjeta-metrica">
            <span className="metrica-etiqueta">Tickets totales</span>
            <span className="metrica-valor">
              {cargando ? "..." : metricas.ticketsTotales}
            </span>
          </div>

          <div className="tarjeta-metrica">
            <span className="metrica-etiqueta">Tickets abiertos</span>
            <span className="metrica-valor">
              {cargando ? "..." : metricas.ticketsAbiertos}
            </span>
          </div>

          <div className="tarjeta-metrica">
            <span className="metrica-etiqueta">Tickets cerrados</span>
            <span className="metrica-valor" style={{ color: "#059669" }}>
              {cargando ? "..." : metricas.ticketsCerrados ?? 0}
            </span>
          </div>

          <div className="tarjeta-metrica">
            <span className="metrica-etiqueta">Técnicos activos</span>
            <span className="metrica-valor">
              {cargando ? "..." : metricas.tecnicosActivos}
            </span>
          </div>
        </section>

        {/* --------------------------------------------------------------------
         * 2. SECCIÓN: MÉTRICAS — TICKETS ABIERTOS VS CERRADOS (Gráfico)
         * -------------------------------------------------------------------- */}
        <section className="dashboard-seccion-grafico" aria-labelledby="titulo-grafico">
          <h2 id="titulo-grafico" className="seccion-grafico-titulo">
            Métricas — tickets abiertos vs cerrados
          </h2>

          <div className="grafico-card-contenedor">
            {/* Visualización de Barras simples según v2.0 */}
            <div className="grafico-barras-area" role="img" aria-label="Gráfico de barras de tickets">
              {datosGrafico.map((barra, indice) => {
                const estaActiva = columnaActiva === indice;
                return (
                  <div
                    key={barra.etiqueta || indice}
                    className={`grafico-barra-columna ${estaActiva ? "activa" : ""}`}
                    onMouseEnter={() => setColumnaActiva(indice)}
                    onMouseLeave={() => setColumnaActiva(null)}
                  >
                    <div className="grafico-barra-tooltip">
                      {barra.abiertos} abiertos / {barra.cerrados} cerrados
                    </div>

                    <div
                      className="grafico-barra-visual"
                      style={{ height: `${barra.porcentaje}%` }}
                    />

                    <span className="grafico-barra-etiqueta">{barra.etiqueta}</span>
                  </div>
                );
              })}
            </div>

            {/* Control comparativo semanal */}
            <div className="grafico-control-inferior">
              <label className="grafico-checkbox-label">
                <input
                  type="checkbox"
                  className="grafico-checkbox-input"
                  checked={comparativoSemanal}
                  onChange={(e) => setComparativoSemanal(e.target.checked)}
                />
                <span>gráfico comparativo semanal</span>
              </label>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------------
         * 3. SECCIÓN: TÉCNICOS ACTIVOS EN ESTE MOMENTO (Tabla)
         * -------------------------------------------------------------------- */}
        <section className="dashboard-seccion-tecnicos" aria-labelledby="titulo-tecnicos">
          <h2 id="titulo-tecnicos" className="seccion-tecnicos-titulo">
            Técnicos activos en este momento
          </h2>

          <div className="tabla-tecnicos-contenedor">
            <table className="tabla-tecnicos">
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Ticket actual</th>
                </tr>
              </thead>
              <tbody>
                {metricas.tecnicosMonitoreo && metricas.tecnicosMonitoreo.length > 0 ? (
                  metricas.tecnicosMonitoreo.map((tec) => {
                    const estadoNorm = (tec.estado || "").toLowerCase();
                    const claseBadge =
                      estadoNorm === "ocupado"
                        ? "ocupado"
                        : estadoNorm === "en_almuerzo"
                        ? "en-almuerzo"
                        : "libre";
                    const idTicketLimpio = tec.ticketActual ? tec.ticketActual.replace(/^TKT-/i, "") : "1";
                    return (
                      <tr key={tec.id}>
                        <td>
                          <strong>{tec.nombre}</strong>
                        </td>
                        <td>
                          <span className={`estado-tecnico-badge ${claseBadge}`}>
                            ● {tec.estado.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td>
                          {tec.ticketActual && tec.ticketActual !== "-" ? (
                            <Link
                              to={`/admin/tickets/${idTicketLimpio}/asignar`}
                              className="ticket-enlace"
                              title="Ver detalle de asignación"
                            >
                              {tec.ticketActual}
                            </Link>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", color: "#64748b" }}>
                      No hay técnicos registrados en este momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}