/**
 * ==============================================================================
 * SISTEMASAR - VISTA 17: GESTIÓN DE CATEGORÍAS (GestionCategorias.jsx)
 * ==============================================================================
 * Desarrollado por: Teylork (Líder)
 *
 * Adaptado al Documento Definitivo v2.0:
 * - Columna Izquierda: Listado de categorías con botón "+ Nueva categoría" y editar.
 * - Columna Derecha: Detalle de la categoría seleccionada (nombre y descripción).
 * - Modal de crear / editar: Únicamente 2 campos:
 *   1. nombre_categoria (obligatorio y único)
 *   2. descripcion
 * - Se quitan el botón "+ Nuevo servicio", tiempo estimado (SLA) y costo.
 * - Borrar/inactivar queda suspendido según Decisión 4 (solo crear y editar).
 * - Consumo exclusivo a través de adminService.js (sin fetch ni import directo de datosFalsos).
 * ==============================================================================
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria
} from "../../services/adminService";
import "./GestionCategorias.css";

function IconoLapiz() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
  );
}

function IconoCarpeta() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}

export default function GestionCategorias() {
  const navigate = useNavigate();

  // Estados de datos
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionadaId, setCategoriaSeleccionadaId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [alerta, setAlerta] = useState(null);

  // Estados de modal para crear / editar categoría
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEnEdicion, setCategoriaEnEdicion] = useState(null);
  const [formCategoria, setFormCategoria] = useState({ nombre_categoria: "", descripcion: "" });
  const [errorFormulario, setErrorFormulario] = useState("");
  const [guardando, setGuardando] = useState(false);

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ tipo, mensaje });
    setTimeout(() => {
      setAlerta(null);
    }, 4000);
  };

  // Carga inicial mediante el servicio
  useEffect(() => {
    let cancelado = false;
    obtenerCategorias()
      .then((lista) => {
        if (cancelado) return;
        setCategorias(lista);
        if (lista.length > 0) {
          setCategoriaSeleccionadaId(lista[0].id_categoria);
        }
        setCargando(false);
      })
      .catch((err) => {
        if (cancelado) return;
        mostrarAlerta("error", "Error al cargar categorías: " + err.message);
        setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const categoriaActiva = categorias.find((c) => c.id_categoria === categoriaSeleccionadaId) || null;

  const abrirModalNuevaCategoria = () => {
    setCategoriaEnEdicion(null);
    setFormCategoria({ nombre_categoria: "", descripcion: "" });
    setErrorFormulario("");
    setModalAbierto(true);
  };

  const abrirModalEditarCategoria = (e, cat) => {
    if (e) e.stopPropagation();
    setCategoriaEnEdicion(cat);
    setFormCategoria({
      nombre_categoria: cat.nombre_categoria,
      descripcion: cat.descripcion || ""
    });
    setErrorFormulario("");
    setModalAbierto(true);
  };

  const guardarCategoria = async (e) => {
    e.preventDefault();
    setErrorFormulario("");

    const nombre = formCategoria.nombre_categoria.trim();
    if (!nombre) {
      setErrorFormulario("El nombre de la categoría es obligatorio");
      return;
    }

    setGuardando(true);
    try {
      if (categoriaEnEdicion) {
        const catActualizada = await actualizarCategoria(categoriaEnEdicion.id_categoria, formCategoria);
        setCategorias((prev) =>
          prev.map((c) => (c.id_categoria === catActualizada.id_categoria ? catActualizada : c))
        );
        mostrarAlerta("exito", `Categoría "${catActualizada.nombre_categoria}" actualizada correctamente.`);
      } else {
        const nuevaCat = await crearCategoria(formCategoria);
        setCategorias((prev) => [...prev, nuevaCat]);
        setCategoriaSeleccionadaId(nuevaCat.id_categoria);
        mostrarAlerta("exito", `Categoría "${nuevaCat.nombre_categoria}" creada exitosamente.`);
      }
      setModalAbierto(false);
    } catch (err) {
      setErrorFormulario(err.message || "Error al guardar la categoría");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Layout
      rol="administrador"
      itemActivo="categorias"
      nombreUsuario="Carlos Administrador"
    >
      <div className="categorias-pagina">
        {/* Encabezado principal */}
        <header className="categorias-header-principal">
          <div>
            <h1 className="categorias-titulo-principal">Gestión de Categorías</h1>
            <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "0.95rem" }}>
              Catálogo oficial de soporte técnico según Documento Definitivo v2.0
            </p>
          </div>
          <button
            type="button"
            className="boton-nuevo"
            onClick={abrirModalNuevaCategoria}
            aria-label="Crear nueva categoría"
          >
            + Nueva categoría
          </button>
        </header>

        {/* Notificaciones / Alertas */}
        {alerta && (
          <div
            className={`categorias-alerta ${
              alerta.tipo === "exito" ? "categorias-alerta-exito" : "categorias-alerta-error"
            }`}
            role="status"
          >
            <span>{alerta.mensaje}</span>
            <button
              type="button"
              className="categorias-alerta-cerrar"
              onClick={() => setAlerta(null)}
              aria-label="Cerrar alerta"
            >
              ×
            </button>
          </div>
        )}

        {cargando ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
            Cargando categorías...
          </div>
        ) : (
          <div className="categorias-grid">
            {/* ------------------------------------------------------------------
             * COLUMNA IZQUIERDA: Listado de categorías con botón editar
             * ------------------------------------------------------------------ */}
            <section className="categorias-columna" aria-label="Listado de categorías">
              <div className="columna-header">
                <h2 className="columna-titulo">Categorías ({categorias.length})</h2>
              </div>

              <div className="categorias-lista">
                {categorias.map((cat) => {
                  const esActiva = cat.id_categoria === categoriaSeleccionadaId;
                  return (
                    <div
                      key={cat.id_categoria}
                      className={`tarjeta-categoria ${esActiva ? "seleccionada" : ""}`}
                      onClick={() => setCategoriaSeleccionadaId(cat.id_categoria)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setCategoriaSeleccionadaId(cat.id_categoria);
                        }
                      }}
                    >
                      <div className="tarjeta-categoria-info">
                        <span className="tarjeta-categoria-nombre">{cat.nombre_categoria}</span>
                        {cat.descripcion && (
                          <span className="tarjeta-categoria-subtexto" style={{ display: "block", color: "#64748b", fontSize: "0.85rem", marginTop: "2px" }}>
                            {cat.descripcion.length > 55 ? cat.descripcion.substring(0, 52) + "..." : cat.descripcion}
                          </span>
                        )}
                      </div>

                      <div className="tarjeta-acciones-categoria" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="boton-accion-icono boton-editar"
                          onClick={(e) => abrirModalEditarCategoria(e, cat)}
                          title="Editar categoría"
                          aria-label={`Editar categoría ${cat.nombre_categoria}`}
                        >
                          <IconoLapiz />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ------------------------------------------------------------------
             * COLUMNA DERECHA: Detalle de la categoría seleccionada
             * Reemplaza el panel derecho anterior por nombre y descripción según v2.0
             * ------------------------------------------------------------------ */}
            <section className="categorias-columna" aria-label="Detalle de categoría">
              <div className="columna-header">
                <h2 className="columna-titulo">Detalle de la categoría</h2>
                {categoriaActiva && (
                  <button
                    type="button"
                    className="boton-accion-icono boton-editar"
                    onClick={(e) => abrirModalEditarCategoria(e, categoriaActiva)}
                    title="Editar esta categoría"
                    style={{ border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: "6px", display: "flex", gap: "6px", alignItems: "center", fontSize: "0.85rem", background: "#fff", cursor: "pointer" }}
                  >
                    <IconoLapiz /> Editar
                  </button>
                )}
              </div>

              {categoriaActiva ? (
                <div
                  className="categoria-detalle-panel"
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ color: "var(--color-primario, #39A900)", background: "#f0fdf4", padding: "10px", borderRadius: "8px" }}>
                      <IconoCarpeta />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                        Categoría #{categoriaActiva.id_categoria}
                      </span>
                      <h3 style={{ margin: "2px 0 0 0", fontSize: "1.3rem", color: "#0f172a", fontWeight: 700 }}>
                        {categoriaActiva.nombre_categoria}
                      </h3>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "0.95rem", color: "#334155", fontWeight: 600 }}>
                      Descripción del servicio
                    </h4>
                    <p style={{ margin: 0, color: "#475569", lineHeight: 1.6, fontSize: "0.95rem" }}>
                      {categoriaActiva.descripcion || "Sin descripción registrada."}
                    </p>
                  </div>

                  <div style={{ marginTop: "24px", padding: "12px 16px", backgroundColor: "#f8fafc", borderRadius: "6px", borderLeft: "3px solid var(--color-primario, #39A900)", fontSize: "0.85rem", color: "#475569" }}>
                    <strong>Alcance del modelo v2.0:</strong> La categoría clasifica los tickets técnicos. El catálogo oficial no incluye liquidación de repuestos ni costos referenciales.
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "32px", color: "#94a3b8", background: "#fff", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                  Seleccione una categoría para consultar su detalle.
                </div>
              )}
            </section>
          </div>
        )}

        {/* ----------------------------------------------------------------------
         * MODAL ÚNICO: Crear o Editar Categoría (solo nombre_categoria y descripcion)
         * ---------------------------------------------------------------------- */}
        {modalAbierto && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-contenido" style={{ maxWidth: "480px" }}>
              <div className="modal-header">
                <h3 className="modal-titulo">
                  {categoriaEnEdicion ? "Editar categoría" : "Nueva categoría"}
                </h3>
                <button
                  type="button"
                  className="modal-boton-cerrar"
                  onClick={() => setModalAbierto(false)}
                  aria-label="Cerrar modal"
                >
                  ×
                </button>
              </div>

              <form onSubmit={guardarCategoria}>
                <div className="modal-body">
                  {errorFormulario && (
                    <div style={{ padding: "8px 12px", background: "#fef2f2", color: "#991b1b", borderRadius: "6px", marginBottom: "14px", fontSize: "0.85rem" }}>
                      {errorFormulario}
                    </div>
                  )}

                  <div className="formulario-campo">
                    <label htmlFor="nombre_categoria">
                      Nombre de la categoría <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      id="nombre_categoria"
                      type="text"
                      value={formCategoria.nombre_categoria}
                      onChange={(e) => setFormCategoria({ ...formCategoria, nombre_categoria: e.target.value })}
                      placeholder="Ej. Redes y Conectividad"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="formulario-campo">
                    <label htmlFor="descripcion_categoria">Descripción</label>
                    <textarea
                      id="descripcion_categoria"
                      rows={3}
                      value={formCategoria.descripcion}
                      onChange={(e) => setFormCategoria({ ...formCategoria, descripcion: e.target.value })}
                      placeholder="Describa el alcance de la categoría técnica..."
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="boton-secundario"
                    onClick={() => setModalAbierto(false)}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="boton-primario"
                    disabled={guardando}
                  >
                    {guardando ? "Guardando..." : categoriaEnEdicion ? "Guardar cambios" : "Crear categoría"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}