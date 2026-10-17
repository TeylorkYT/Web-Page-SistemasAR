import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import {
  obtenerTicketsTecnico,
  obtenerTecnicoActual
} from "../../services/tecnicoService";
import "./DashboardTecnico.css";

export default function TicketsAsignados() {
  const navigate = useNavigate();
  const { sesion } = useAuth();

  const [tecnico, setTecnico] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function cargarDatos() {
      try {
        const [datosTecnico, ticketsAsignados] = await Promise.all([
          obtenerTecnicoActual(),
          obtenerTicketsTecnico()
        ]);

        if (!cancelado) {
          setTecnico(datosTecnico);
          setTickets(ticketsAsignados);
          setCargando(false);
        }
      } catch (error) {
        if (!cancelado) {
          console.error("Error al cargar tickets asignados:", error);
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

  // Contadores para las pestañas de filtro
  const conteoPorEstado = {
    Todos: tickets.length,
    En_Proceso: tickets.filter((t) => t.estado === "En_Proceso").length,
    Resuelto: tickets.filter((t) => t.estado === "Resuelto").length,
    Cerrado: tickets.filter((t) => t.estado === "Cerrado").length
  };

  // Filtrado de tickets según estado, prioridad y búsqueda
  const ticketsFiltrados = tickets.filter((t) => {
    const coincideEstado = filtroEstado === "Todos" ? true : t.estado === filtroEstado;
    const coincidePrioridad = filtroPrioridad === "Todas" ? true : t.prioridad === filtroPrioridad;

    if (!coincideEstado || !coincidePrioridad) return false;

    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    const clienteNombre = `${t.cliente?.nombre || ""} ${t.cliente?.apellido || ""}`.toLowerCase();
    return (
      String(t.id_ticket).includes(q) ||
      t.titulo?.toLowerCase().includes(q) ||
      clienteNombre.includes(q) ||
      (t.nombresCategorias || []).some((c) => String(c).toLowerCase().includes(q))
    );
  });

  return (
    <Layout
      rol="tecnico"
      itemActivo="tickets-asignados"
      nombreUsuario={nombreTecnico}
      onCambiarItem={manejarCambioMenu}
    >
      <div className="dashboard-tecnico-contenedor">
        {/* Cabecera de la sección */}
        <header className="dashboard-tecnico-header">
          <div>
            <h1 className="dashboard-tecnico-titulo">Mis Tickets Asignados</h1>
            <p className="dashboard-tecnico-subtitulo">
              Mesa de trabajo y seguimiento de solicitudes de soporte técnico bajo tu responsabilidad ({tickets.length} tickets en total).
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/tecnico")}
            style={{
              backgroundColor: "#f8fafc",
              color: "#334155",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontWeight: "600",
              fontSize: "0.875rem",
              cursor: "pointer"
            }}
          >
            ← Volver al Dashboard
          </button>
        </header>

        {/* Tabla principal de gestión */}
        <section className="dashboard-tabla-seccion">
          <div className="dashboard-tabla-header-barra" style={{ flexWrap: "wrap", gap: "1rem", padding: "16px 20px" }}>
            {/* Buscador en vivo */}
            <input
              type="search"
              placeholder="Buscar por ID, título, cliente o categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                padding: "0.5rem 0.85rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.875rem",
                minWidth: "280px",
                flex: "1 1 280px",
                backgroundColor: "#ffffff",
                outline: "none"
              }}
            />

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              {/* Filtro por prioridad */}
              <select
                value={filtroPrioridad}
                onChange={(e) => setFiltroPrioridad(e.target.value)}
                style={{
                  padding: "0.45rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  fontWeight: 600,
                  outline: "none"
                }}
              >
                <option value="Todas">Todas las prioridades</option>
                <option value="Critica">Crítica</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>

              {/* Pestañas de Filtro por estado */}
              <div className="filtros-pills" role="tablist">
                {["Todos", "En_Proceso", "Resuelto", "Cerrado"].map((estado) => (
                  <button
                    key={estado}
                    type="button"
                    className={`filtro-pill-btn ${filtroEstado === estado ? "activo" : ""}`}
                    onClick={() => setFiltroEstado(estado)}
                  >
                    {estado === "Todos" ? "Todos" : estado.replace("_", " ")}
                    <span style={{ marginLeft: "5px", fontSize: "0.75rem", opacity: 0.8 }}>
                      ({conteoPorEstado[estado] || 0})
                    </span>
                  </button>
                ))}
              </div>
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
                <p className="estado-vacio-texto">No se encontraron tickets con los filtros seleccionados</p>
                <p className="estado-vacio-subtexto">
                  {filtroEstado !== "Todos" || filtroPrioridad !== "Todas" || busqueda
                    ? "Prueba restableciendo los filtros de búsqueda."
                    : "Actualmente no tienes tickets asignados en el sistema."}
                </p>
                {(filtroEstado !== "Todos" || filtroPrioridad !== "Todas" || busqueda) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFiltroEstado("Todos");
                      setFiltroPrioridad("Todas");
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
                )}
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
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <Link
                            to={`/tecnico/tickets/${ticket.id_ticket}`}
                            className="btn-ver-detalle"
                            title="Ver detalle y gestionar ticket"
                          >
                            Gestionar ➜
                          </Link>
                          <Link
                            to={`/tecnico/tickets/${ticket.id_ticket}/avance`}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              backgroundColor: "#ffffff",
                              color: "#334155",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              textDecoration: "none"
                            }}
                            title="Registrar avance rápido"
                          >
                            Avance
                          </Link>
                        </div>
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
