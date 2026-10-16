/**
 * ==============================================================================
 * SISTEMASAR - VISTA 13: CONSULTA DE INVENTARIO (InventarioTecnico.jsx)
 * ==============================================================================
 * Desarrollado por: Cristian (Responsable del Módulo Técnico)
 *
 * Cumple con los requerimientos del Daily 2:
 * - Repuestos y componentes disponibles, modo SOLO LECTURA para el técnico.
 * - Consume datos exclusivamente desde la capa de servicios (tecnicoService.js).
 * - Búsqueda por texto (código, nombre, descripción) y filtro por categoría/tipo.
 * - Mensaje claro cuando una lista o filtro no retorna resultados.
 * ==============================================================================
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import Boton from "../../components/Boton";
import { consultarInventarioTecnico, obtenerTecnicoActual } from "../../services/tecnicoService";
import "./InventarioTecnico.css";

export default function InventarioTecnico() {
  const navigate = useNavigate();

  // Estados
  const [tecnico, setTecnico] = useState(null);
  const [repuestos, setRepuestos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [tipoSeleccionado, setTipoSeleccionado] = useState("Todos");
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  // Tipos únicos para el selector
  const [tiposDisponibles, setTiposDisponibles] = useState(["Todos"]);

  useEffect(() => {
    let cancelado = false;

    obtenerTecnicoActual().then((datos) => {
      if (!cancelado) setTecnico(datos);
    });

    return () => {
      cancelado = true;
    };
  }, []);

  // Carga reactiva de inventario según filtros
  useEffect(() => {
    let cancelado = false;
    setCargando(true);

    consultarInventarioTecnico({
      termino: busqueda,
      tipo: tipoSeleccionado,
      soloDisponibles
    })
      .then((datos) => {
        if (!cancelado) {
          setRepuestos(datos);
          setCargando(false);

          // Si es la carga inicial, extraer lista de categorías únicas
          if (tipoSeleccionado === "Todos" && !busqueda) {
            const tiposUnicos = ["Todos", ...new Set(datos.map((d) => d.tipo))];
            setTiposDisponibles(tiposUnicos);
          }
        }
      })
      .catch((err) => {
        if (!cancelado) {
          console.error("Error al consultar inventario:", err);
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [busqueda, tipoSeleccionado, soloDisponibles]);

  const manejarCambioMenu = (id) => {
    if (id === "dashboard" || id === "tickets-asignados") {
      navigate("/tecnico");
    } else if (id === "inventario-repuestos") {
      navigate("/tecnico/inventario");
    }
  };

  return (
    <Layout
      rol="tecnico"
      itemActivo="inventario-repuestos"
      nombreUsuario={tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : "Diana Paz"}
      onCambiarItem={manejarCambioMenu}
    >
      <div className="inventario-tecnico-contenedor">
        {/* Encabezado */}
        <header className="inventario-tecnico-header">
          <div>
            <h1 className="inventario-tecnico-titulo">Consulta de Inventario y Repuestos</h1>
            <p className="inventario-tecnico-subtitulo">
              Catálogo de componentes físicos disponibles en bodega y laboratorio para soporte técnico.
            </p>
          </div>
          <div>
            <Boton
              variante="secundario"
              onClick={() => navigate("/tecnico")}
              texto="⬅ Volver a Mis Tickets"
            />
          </div>
        </header>

        {/* Notificación informativa modo solo lectura */}
        <div className="aviso-solo-lectura" role="status">
          <span>ℹ️</span>
          <span>
            <strong>Modo consulta:</strong> Vista de solo lectura. Para solicitar bajas, altas o
            compras de repuestos, comunícate con el Administrador del inventario.
          </span>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <section className="inventario-filtros-card">
          <div className="inventario-buscador-box">
            <span>🔍</span>
            <input
              type="text"
              className="inventario-buscador-input"
              placeholder="Buscar por código, nombre o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
            <label htmlFor="select-tipo" style={{ fontSize: "0.88rem", fontWeight: 600, color: "#475569" }}>
              Categoría:
            </label>
            <select
              id="select-tipo"
              className="inventario-select-tipo"
              value={tipoSeleccionado}
              onChange={(e) => setTipoSeleccionado(e.target.value)}
            >
              {tiposDisponibles.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <label className="inventario-solo-disponibles-label">
              <input
                type="checkbox"
                checked={soloDisponibles}
                onChange={(e) => setSoloDisponibles(e.target.checked)}
              />
              Solo con stock disponible
            </label>
          </div>
        </section>

        {/* Tabla de Repuestos */}
        <section className="inventario-tabla-card">
          <div className="inventario-tabla-header">
            <span className="inventario-tabla-contador">
              Mostrando {repuestos.length} repuesto(s)
            </span>
          </div>

          <div className="tabla-responsive-wrapper">
            {cargando ? (
              <div className="estado-vacio-tabla">
                <p className="estado-vacio-texto">Consultando inventario en tiempo real...</p>
              </div>
            ) : repuestos.length === 0 ? (
              <div className="estado-vacio-tabla">
                <div className="estado-vacio-icono">📦</div>
                <p className="estado-vacio-texto">No se encontraron componentes</p>
                <p className="estado-vacio-subtexto">
                  No hay repuestos que coincidan con los criterios de búsqueda o filtros seleccionados.
                </p>
              </div>
            ) : (
              <table className="tabla-tickets">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Repuesto / Descripción</th>
                    <th>Tipo</th>
                    <th>Stock</th>
                    <th>Ubicación</th>
                    <th>Disponibilidad</th>
                  </tr>
                </thead>
                <tbody>
                  {repuestos.map((item) => (
                    <tr key={item.id_inventario}>
                      <td>
                        <span className="codigo-repuesto">{item.codigo}</span>
                      </td>
                      <td>
                        <div className="repuesto-nombre">{item.nombre}</div>
                        <div className="repuesto-descripcion">{item.descripcion}</div>
                      </td>
                      <td>
                        <span className="badge-tipo">{item.tipo}</span>
                      </td>
                      <td>
                        <span
                          className={`stock-indicador ${
                            item.stock > 5 ? "stock-alto" : item.stock > 0 ? "stock-bajo" : "stock-agotado"
                          }`}
                        >
                          {item.stock} unidades
                        </span>
                      </td>
                      <td>
                        <span style={{ color: "#334155", fontWeight: 500 }}>{item.ubicacion}</span>
                      </td>
                      <td>
                        <span className={`badge-disponibilidad ${item.estado}`}>
                          {item.estado.replace("_", " ")}
                        </span>
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