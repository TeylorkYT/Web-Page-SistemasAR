import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import EstadoBadge from "../../components/EstadoBadge";
import { useAuth } from "../../context/AuthContext";
import { listarTickets, obtenerTicket } from "../../services/ticketsService";
import { listarTecnicos } from "../../services/reportesService";

export default function HistorialTickets() {
  const navigate = useNavigate();
  const { sesion } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("Todas");
  const [filtroTecnico, setFiltroTecnico] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  // Modal de Auditoría / Detalle Completo
  const [ticketAuditoria, setTicketAuditoria] = useState(null);
  const [cargandoAuditoria, setCargandoAuditoria] = useState(false);

  useEffect(() => {
    let cancelado = false;

    async function cargarDatos() {
      try {
        const [listaTickets, listaTecnicos] = await Promise.all([
          listarTickets({ todos: true }),
          listarTecnicos()
        ]);

        if (!cancelado) {
          setTickets(listaTickets);
          setTecnicos(listaTecnicos);
          setCargando(false);
        }
      } catch (err) {
        if (!cancelado) {
          console.error("Error al cargar historial de tickets:", err);
          setCargando(false);
        }
      }
    }

    cargarDatos();

    return () => {
      cancelado = true;
    };
  }, []);

  const abrirAuditoria = async (idTicket) => {
    setCargandoAuditoria(true);
    try {
      const detalle = await obtenerTicket(idTicket);
      setTicketAuditoria(detalle);
    } catch (err) {
      alert("No se pudo cargar la auditoría del ticket: " + err.message);
    } finally {
      setCargandoAuditoria(false);
    }
  };

  const cerrarAuditoria = () => {
    setTicketAuditoria(null);
  };

  // Contadores
  const conteo = {
    total: tickets.length,
    abiertos: tickets.filter((t) => t.estado === "Abierto").length,
    enProceso: tickets.filter((t) => t.estado === "En_Proceso").length,
    resueltos: tickets.filter((t) => t.estado === "Resuelto").length,
    cerrados: tickets.filter((t) => t.estado === "Cerrado").length,
  };

  // Filtrado de tickets
  const ticketsFiltrados = tickets.filter((t) => {
    const coincideEstado = filtroEstado === "Todos" ? true : t.estado === filtroEstado;
    const coincidePrioridad = filtroPrioridad === "Todas" ? true : t.prioridad === filtroPrioridad;

    let coincideTecnico = true;
    if (filtroTecnico === "sin_asignar") {
      coincideTecnico = !t.id_tecnico;
    } else if (filtroTecnico !== "Todos") {
      coincideTecnico = String(t.id_tecnico) === String(filtroTecnico);
    }

    if (!coincideEstado || !coincidePrioridad || !coincideTecnico) return false;

    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    const cliente = String(t.cliente_nombre || "").toLowerCase();
    const tecnico = String(t.tecnico_nombre || "").toLowerCase();
    const cats = (t.categorias || []).map((c) => String(c).toLowerCase());

    return (
      String(t.id_ticket).includes(q) ||
      String(t.titulo || "").toLowerCase().includes(q) ||
      cliente.includes(q) ||
      tecnico.includes(q) ||
      cats.some((c) => c.includes(q))
    );
  });

  const nombreUsuario = sesion?.nombre || "Administrador";

  return (
    <Layout rol="administrador" itemActivo="tickets" nombreUsuario={nombreUsuario}>
      <div style={{ padding: "24px", maxWidth: "1350px", margin: "0 auto", fontFamily: "var(--fuente-principal, sans-serif)" }}>
        {/* Encabezado */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.75rem", color: "#0f2e5e", fontWeight: 700 }}>
              Historial General de Tickets
            </h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.95rem" }}>
              Auditoría centralizada, estados y trazabilidad de todos los tickets del sistema ({tickets.length} registrados).
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/asignacion")}
            style={{
              backgroundColor: "var(--color-primario, #0a369d)",
              color: "white",
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(10, 54, 157, 0.2)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span>🛠️</span> Bandeja de Asignación ({conteo.abiertos})
          </button>
        </header>

        {/* Tarjetas KPI de Estado */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <TarjetaMini titulo="Total Tickets" valor={conteo.total} color="#0f172a" icono="📋" />
          <TarjetaMini titulo="Abiertos (Pendientes)" valor={conteo.abiertos} color="#eab308" icono="⏳" />
          <TarjetaMini titulo="En Atención Técnica" valor={conteo.enProceso} color="#0284c7" icono="⚙️" />
          <TarjetaMini titulo="Resueltos" valor={conteo.resueltos} color="#16a34a" icono="✅" />
          <TarjetaMini titulo="Cerrados / Archivados" valor={conteo.cerrados} color="#475569" icono="🔒" />
        </div>

        {/* Panel de Filtros y Búsqueda */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 22px", marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center", justifyContent: "space-between" }}>
            {/* Buscador */}
            <input
              type="search"
              placeholder="Buscar por #ID, título, cliente, técnico o categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.9rem",
                minWidth: "280px",
                flex: "1 1 300px",
                backgroundColor: "#ffffff",
                outline: "none"
              }}
            />

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              {/* Filtro por prioridad */}
              <select
                value={filtroPrioridad}
                onChange={(e) => setFiltroPrioridad(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  fontWeight: 600,
                  outline: "none"
                }}
              >
                <option value="Todas">Todas las Prioridades</option>
                <option value="Critica">Crítica</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>

              {/* Filtro por técnico */}
              <select
                value={filtroTecnico}
                onChange={(e) => setFiltroTecnico(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  fontWeight: 600,
                  outline: "none"
                }}
              >
                <option value="Todos">Todos los Técnicos</option>
                <option value="sin_asignar">⚠️ Sin Asignar</option>
                {tecnicos.map((t) => (
                  <option key={t.id_usuario} value={String(t.id_usuario)}>
                    {t.nombre} {t.apellido}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pestañas de estado */}
          <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap" }}>
            {["Todos", "Abierto", "En_Proceso", "Resuelto", "Cerrado"].map((est) => {
              const activo = filtroEstado === est;
              return (
                <button
                  key={est}
                  type="button"
                  onClick={() => setFiltroEstado(est)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: activo ? "1px solid #0a369d" : "1px solid #e2e8f0",
                    backgroundColor: activo ? "#0a369d" : "#f8fafc",
                    color: activo ? "#ffffff" : "#475569",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {est === "Todos" ? "Todos" : est.replace("_", " ")}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabla Principal */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          {cargando ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              Cargando historial de tickets...
            </div>
          ) : ticketsFiltrados.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <span style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}>📭</span>
              <p style={{ margin: 0, fontWeight: 600, color: "#1e293b" }}>No se encontraron tickets con los criterios indicados.</p>
              <button
                type="button"
                onClick={() => {
                  setFiltroEstado("Todos");
                  setFiltroPrioridad("Todas");
                  setFiltroTecnico("Todos");
                  setBusqueda("");
                }}
                style={{
                  marginTop: "12px",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <th style={{ padding: "12px 14px" }}>ID</th>
                    <th style={{ padding: "12px 14px" }}>Título / Requerimiento</th>
                    <th style={{ padding: "12px 14px" }}>Cliente</th>
                    <th style={{ padding: "12px 14px" }}>Técnico Asignado</th>
                    <th style={{ padding: "12px 14px" }}>Prioridad</th>
                    <th style={{ padding: "12px 14px" }}>Estado</th>
                    <th style={{ padding: "12px 14px" }}>Fecha Creación</th>
                    <th style={{ padding: "12px 14px", textAlign: "right" }}>Acción / Auditoría</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketsFiltrados.map((t) => {
                    const colorPrioridad =
                      t.prioridad === "Critica" ? "#dc2626" :
                      t.prioridad === "Alta" ? "#ea580c" :
                      t.prioridad === "Media" ? "#0284c7" : "#64748b";

                    return (
                      <tr key={t.id_ticket} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "14px", fontWeight: "bold" }}>
                          <span style={{ color: "var(--color-primario, #0a369d)" }}>#{t.id_ticket}</span>
                        </td>
                        <td style={{ padding: "14px" }}>
                          <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>{t.titulo}</div>
                          {t.categorias && t.categorias.length > 0 && (
                            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                              {t.categorias.map((cat, idx) => (
                                <span key={idx} style={{ fontSize: "11px", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#475569" }}>
                                  {cat}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "14px" }}>
                          <div style={{ fontWeight: 600, color: "#334155" }}>{t.cliente_nombre || "Cliente"}</div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{t.cliente_correo || ""}</div>
                        </td>
                        <td style={{ padding: "14px" }}>
                          {t.tecnico_nombre ? (
                            <span style={{ fontWeight: 600, color: "#0f2e5e", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              🛠️ {t.tecnico_nombre}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/tickets/${t.id_ticket}/asignar`)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "6px",
                                backgroundColor: "#fef2f2",
                                color: "#b91c1c",
                                border: "1px solid #fecaca",
                                fontSize: "12px",
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              ⚠️ Sin asignar (Asignar →)
                            </button>
                          )}
                        </td>
                        <td style={{ padding: "14px" }}>
                          <span style={{ color: colorPrioridad, fontWeight: 700, fontSize: "0.85rem" }}>
                            ● {t.prioridad}
                          </span>
                        </td>
                        <td style={{ padding: "14px" }}>
                          <EstadoBadge estado={t.estado} />
                        </td>
                        <td style={{ padding: "14px", fontSize: "0.85rem", color: "#64748b" }}>
                          {t.fecha_creacion}
                        </td>
                        <td style={{ padding: "14px", textAlign: "right" }}>
                          <button
                            type="button"
                            onClick={() => abrirAuditoria(t.id_ticket)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              backgroundColor: "#f8fafc",
                              color: "#0f2e5e",
                              border: "1px solid #cbd5e1",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            🔍 Ver Auditoría
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Auditoría y Trazabilidad Completa */}
        {ticketAuditoria && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px"
            }}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "14px",
                maxWidth: "800px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
              }}
            >
              {/* Modal Header */}
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0a369d" }}>#{ticketAuditoria.id_ticket}</span>
                    <EstadoBadge estado={ticketAuditoria.estado} />
                  </div>
                  <h2 style={{ margin: "4px 0 0", fontSize: "1.25rem", color: "#1e293b" }}>{ticketAuditoria.titulo}</h2>
                </div>
                <button
                  type="button"
                  onClick={cerrarAuditoria}
                  style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#64748b" }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: "24px" }}>
                {/* Metadatos */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", padding: "14px", backgroundColor: "#f8fafc", borderRadius: "10px", marginBottom: "20px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Cliente:</span>
                    <strong style={{ fontSize: "14px", color: "#1e293b" }}>{ticketAuditoria.cliente_nombre || "Cliente"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Técnico:</span>
                    <strong style={{ fontSize: "14px", color: "#0f2e5e" }}>{ticketAuditoria.tecnico_nombre || "Sin Asignar"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Prioridad:</span>
                    <strong style={{ fontSize: "14px" }}>{ticketAuditoria.prioridad}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Modalidad:</span>
                    <strong style={{ fontSize: "14px" }}>{ticketAuditoria.modalidad || "Presencial"}</strong>
                  </div>
                </div>

                {/* Descripción */}
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: "0.95rem", color: "#0f2e5e" }}>Descripción del caso:</h4>
                  <p style={{ margin: 0, padding: "12px", backgroundColor: "#f1f5f9", borderRadius: "8px", fontSize: "0.9rem", color: "#334155", lineHeight: 1.5 }}>
                    {ticketAuditoria.descripcion}
                  </p>
                </div>

                {/* Calificación y Reporte de solución */}
                {ticketAuditoria.calificacion && (
                  <div style={{ marginBottom: "20px", padding: "14px", borderRadius: "8px", backgroundColor: "#fefce8", border: "1px solid #fef08a" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <span style={{ color: "#eab308", fontSize: "1.1rem" }}>
                        {"★".repeat(ticketAuditoria.calificacion.puntuacion || 0)}{"☆".repeat(5 - (ticketAuditoria.calificacion.puntuacion || 0))}
                      </span>
                      <strong style={{ fontSize: "14px", color: "#854d0e" }}>Calificación del Cliente ({ticketAuditoria.calificacion.puntuacion}/5)</strong>
                    </div>
                    {ticketAuditoria.calificacion.comentario && (
                      <p style={{ margin: 0, fontStyle: "italic", fontSize: "13px", color: "#713f12" }}>
                        "{ticketAuditoria.calificacion.comentario}"
                      </p>
                    )}
                  </div>
                )}

                {/* Historial de Trazabilidad */}
                <div>
                  <h4 style={{ margin: "0 0 12px", fontSize: "0.95rem", color: "#0f2e5e" }}>📜 Historial de Eventos y Trazabilidad</h4>
                  {(!ticketAuditoria.historial || ticketAuditoria.historial.length === 0) ? (
                    <p style={{ color: "#64748b", fontSize: "13px" }}>Sin historial registrado.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {ticketAuditoria.historial.map((h, i) => (
                        <div
                          key={h.id_historial || i}
                          style={{
                            padding: "10px 14px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            fontSize: "0.85rem"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <strong style={{ color: "#0a369d" }}>{h.tipo_accion}</strong>
                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>{h.fecha_accion}</span>
                          </div>
                          <div style={{ color: "#334155" }}>{h.detalles}</div>
                          {h.nombre_usuario && (
                            <div style={{ marginTop: "4px", fontSize: "11px", color: "#64748b" }}>
                              Ejecutado por: {h.nombre_usuario}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={cerrarAuditoria}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "8px",
                    backgroundColor: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function TarjetaMini({ titulo, valor, color, icono }) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        padding: "16px 18px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        borderLeft: `4px solid ${color}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}
    >
      <div>
        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{titulo}</span>
        <h3 style={{ margin: "4px 0 0", fontSize: "24px", color: color, fontWeight: 700 }}>{valor}</h3>
      </div>
      <span style={{ fontSize: "24px", opacity: 0.85 }}>{icono}</span>
    </div>
  );
}
