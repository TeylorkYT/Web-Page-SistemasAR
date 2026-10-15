/**
 * ==============================================================================
 * SISTEMASAR - VISTA 17: GESTIÓN DE CATEGORÍAS Y SERVICIOS (GestionCategorias.jsx)
 * ==============================================================================
 * Desarrollado por: Teylork (Líder)
 *
 * Implementa la Vista 17 según los mockups:
 * - Columna Izquierda: Listado de categorías con botón "+ Nueva categoría".
 *   Permite seleccionar una categoría activa (resaltada en azul), editarla o eliminarla.
 * - Columna Derecha: Listado de servicios asociados a la categoría seleccionada
 *   con botón "+ Nuevo servicio", tiempo estimado SLA, edición y eliminación.
 * - Modales interactivos para crear y editar categoría y servicio.
 * - Consumo exclusivo mediante la capa de servicios (adminService.js).
 * ==============================================================================
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  obtenerServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio
} from "../../services/adminService";
import "./GestionCategorias.css";

// Icono SVG de Lápiz (Editar)
function IconoLapiz() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
  );
}

// Icono SVG de Papelera (Eliminar)
function IconoPapelera() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );
}

export default function GestionCategorias() {
  const navigate = useNavigate();

  // Estados principales de datos
  const [categorias, setCategorias] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [categoriaSeleccionadaId, setCategoriaSeleccionadaId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [alerta, setAlerta] = useState(null);

  // Estados de modales
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false);
  const [categoriaEnEdicion, setCategoriaEnEdicion] = useState(null);
  const [formCategoria, setFormCategoria] = useState({ nombre_categoria: "", descripcion: "" });

  const [modalServicioAbierto, setModalServicioAbierto] = useState(false);
  const [servicioEnEdicion, setServicioEnEdicion] = useState(null);
  const [formServicio, setFormServicio] = useState({
    id_categoria: "",
    nombre_servicio: "",
    descripcion: "",
    tiempo_estimado: "",
    costo: ""
  });

  const [modalEliminar, setModalEliminar] = useState({
    abierto: false,
    tipo: "", // 'categoria' | 'servicio'
    id: null,
    nombre: ""
  });

  const [errorFormulario, setErrorFormulario] = useState("");

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ tipo, mensaje });
    setTimeout(() => {
      setAlerta(null);
    }, 4000);
  };

  // Carga inicial de datos mediante el servicio
  useEffect(() => {
    let cancelado = false;
    obtenerCategorias()
      .then((listaCategorias) => {
        if (cancelado) return;
        setCategorias(listaCategorias);
        if (listaCategorias.length > 0) {
          const primeraCatId = listaCategorias[0].id_categoria;
          setCategoriaSeleccionadaId(primeraCatId);
          obtenerServicios(primeraCatId).then((listaServicios) => {
            if (!cancelado) setServicios(listaServicios);
          });
        }
        setCargando(false);
      })
      .catch((err) => {
        if (!cancelado) {
          mostrarAlerta("error", "Error al cargar las categorías: " + err.message);
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, []);

  // Cambiar categoría seleccionada
  const manejarSeleccionarCategoria = async (idCat) => {
    setCategoriaSeleccionadaId(idCat);
    try {
      const lista = await obtenerServicios(idCat);
      setServicios(lista);
    } catch (err) {
      mostrarAlerta("error", "Error al cargar los servicios asociados: " + err.message);
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

  // --------------------------------------------------------------------------
  // LÓGICA DE CATEGORÍAS
  // --------------------------------------------------------------------------
  const abrirModalNuevaCategoria = () => {
    setCategoriaEnEdicion(null);
    setFormCategoria({ nombre_categoria: "", descripcion: "" });
    setErrorFormulario("");
    setModalCategoriaAbierto(true);
  };

  const abrirModalEditarCategoria = (e, cat) => {
    e.stopPropagation();
    setCategoriaEnEdicion(cat);
    setFormCategoria({
      nombre_categoria: cat.nombre_categoria,
      descripcion: cat.descripcion || ""
    });
    setErrorFormulario("");
    setModalCategoriaAbierto(true);
  };

  const guardarCategoria = async (e) => {
    e.preventDefault();
    if (!formCategoria.nombre_categoria.trim()) {
      setErrorFormulario("El nombre de la categoría es obligatorio");
      return;
    }

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
        setServicios([]);
        mostrarAlerta("exito", `Categoría "${nuevaCat.nombre_categoria}" creada exitosamente.`);
      }
      setModalCategoriaAbierto(false);
    } catch (err) {
      setErrorFormulario(err.message || "Error al guardar la categoría");
    }
  };

  const solicitarEliminarCategoria = (e, cat) => {
    e.stopPropagation();
    setModalEliminar({
      abierto: true,
      tipo: "categoria",
      id: cat.id_categoria,
      nombre: cat.nombre_categoria
    });
  };

  // --------------------------------------------------------------------------
  // LÓGICA DE SERVICIOS
  // --------------------------------------------------------------------------
  const abrirModalNuevoServicio = () => {
    setServicioEnEdicion(null);
    setFormServicio({
      id_categoria: categoriaSeleccionadaId || (categorias[0]?.id_categoria ?? ""),
      nombre_servicio: "",
      descripcion: "",
      tiempo_estimado: "",
      costo: ""
    });
    setErrorFormulario("");
    setModalServicioAbierto(true);
  };

  const abrirModalEditarServicio = (serv) => {
    setServicioEnEdicion(serv);
    setFormServicio({
      id_categoria: serv.id_categoria,
      nombre_servicio: serv.nombre_servicio,
      descripcion: serv.descripcion || "",
      tiempo_estimado: serv.tiempo_estimado || "",
      costo: serv.costo || ""
    });
    setErrorFormulario("");
    setModalServicioAbierto(true);
  };

  const guardarServicio = async (e) => {
    e.preventDefault();
    if (!formServicio.nombre_servicio.trim()) {
      setErrorFormulario("El nombre del servicio es obligatorio");
      return;
    }

    try {
      if (servicioEnEdicion) {
        const servActualizado = await actualizarServicio(servicioEnEdicion.id_servicio, formServicio);
        setServicios((prev) =>
          prev.map((s) => (s.id_servicio === servActualizado.id_servicio ? servActualizado : s))
        );
        mostrarAlerta("exito", `Servicio "${servActualizado.nombre_servicio}" actualizado correctamente.`);
      } else {
        const nuevoServ = await crearServicio(formServicio);
        if (Number(nuevoServ.id_categoria) === Number(categoriaSeleccionadaId)) {
          setServicios((prev) => [...prev, nuevoServ]);
        }
        mostrarAlerta("exito", `Servicio "${nuevoServ.nombre_servicio}" guardado exitosamente.`);
      }
      setModalServicioAbierto(false);
    } catch (err) {
      setErrorFormulario(err.message || "Error al guardar el servicio");
    }
  };

  const solicitarEliminarServicio = (serv) => {
    setModalEliminar({
      abierto: true,
      tipo: "servicio",
      id: serv.id_servicio,
      nombre: serv.nombre_servicio
    });
  };

  // --------------------------------------------------------------------------
  // CONFIRMACIÓN DE ELIMINACIÓN
  // --------------------------------------------------------------------------
  const confirmarEliminar = async () => {
    try {
      if (modalEliminar.tipo === "categoria") {
        await eliminarCategoria(modalEliminar.id);
        const nuevasCategorias = categorias.filter((c) => c.id_categoria !== modalEliminar.id);
        setCategorias(nuevasCategorias);
        if (categoriaSeleccionadaId === modalEliminar.id) {
          if (nuevasCategorias.length > 0) {
            manejarSeleccionarCategoria(nuevasCategorias[0].id_categoria);
          } else {
            setCategoriaSeleccionadaId(null);
            setServicios([]);
          }
        }
        mostrarAlerta("exito", `Categoría "${modalEliminar.nombre}" eliminada correctamente.`);
      } else if (modalEliminar.tipo === "servicio") {
        await eliminarServicio(modalEliminar.id);
        setServicios((prev) => prev.filter((s) => s.id_servicio !== modalEliminar.id));
        mostrarAlerta("exito", `Servicio "${modalEliminar.nombre}" eliminado correctamente.`);
      }
    } catch (err) {
      mostrarAlerta("error", "Error al eliminar: " + err.message);
    } finally {
      setModalEliminar({ abierto: false, tipo: "", id: null, nombre: "" });
    }
  };

  const categoriaActual = categorias.find((c) => c.id_categoria === categoriaSeleccionadaId);

  return (
    <Layout
      rol="administrador"
      itemActivo="categorias"
      nombreUsuario="Marlon Monsalve"
      onCambiarItem={manejarCambioItemMenu}
    >
      <div className="categorias-pagina">
        {/* Encabezado Principal */}
        <header className="categorias-header-principal">
          <h1 className="categorias-titulo-principal">Gestión de categorías y servicios</h1>
        </header>

        {/* Alerta de notificación visual */}
        {alerta && (
          <div className={`categorias-alerta categorias-alerta-${alerta.tipo}`}>
            <span>{alerta.mensaje}</span>
            <button
              type="button"
              className="categorias-alerta-cerrar"
              onClick={() => setAlerta(null)}
              aria-label="Cerrar notificación"
            >
              ×
            </button>
          </div>
        )}

        {/* Estado de carga */}
        {cargando ? (
          <div className="estado-vacio">
            <p className="estado-vacio-texto">Cargando categorías y servicios...</p>
          </div>
        ) : (
          <div className="categorias-grid">
            {/* --------------------------------------------------------------
             * COLUMNA 1: CATEGORÍAS
             * -------------------------------------------------------------- */}
            <section className="categorias-columna" aria-labelledby="titulo-categorias">
              <div className="columna-header">
                <h2 id="titulo-categorias" className="columna-titulo">Categorías</h2>
                <button
                  type="button"
                  className="boton-accion-azul"
                  onClick={abrirModalNuevaCategoria}
                  id="btn-nueva-categoria"
                >
                  <span>+</span>
                  <span>Nueva categoría</span>
                </button>
              </div>

              {categorias.length === 0 ? (
                <div className="estado-vacio">
                  <p className="estado-vacio-texto">No hay categorías registradas.</p>
                </div>
              ) : (
                <div className="tarjetas-lista">
                  {categorias.map((cat) => {
                    const estaSeleccionada = cat.id_categoria === categoriaSeleccionadaId;
                    return (
                      <div
                        key={cat.id_categoria}
                        className={`tarjeta-categoria ${estaSeleccionada ? "seleccionada" : ""}`}
                        onClick={() => manejarSeleccionarCategoria(cat.id_categoria)}
                        title={cat.descripcion || cat.nombre_categoria}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            manejarSeleccionarCategoria(cat.id_categoria);
                          }
                        }}
                      >
                        <span className="tarjeta-categoria-nombre">
                          {cat.nombre_categoria}
                        </span>

                        <div className="tarjeta-acciones">
                          <button
                            type="button"
                            className="boton-icono-accion"
                            title="Editar categoría"
                            aria-label={`Editar ${cat.nombre_categoria}`}
                            onClick={(e) => abrirModalEditarCategoria(e, cat)}
                          >
                            <IconoLapiz />
                          </button>
                          <button
                            type="button"
                            className="boton-icono-accion eliminar"
                            title="Eliminar categoría"
                            aria-label={`Eliminar ${cat.nombre_categoria}`}
                            onClick={(e) => solicitarEliminarCategoria(e, cat)}
                          >
                            <IconoPapelera />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* --------------------------------------------------------------
             * COLUMNA 2: SERVICIOS ASOCIADOS
             * -------------------------------------------------------------- */}
            <section className="categorias-columna" aria-labelledby="titulo-servicios">
              <div className="columna-header">
                <div className="columna-titulo-grupo">
                  <h2 id="titulo-servicios" className="columna-titulo">Servicios asociados</h2>
                  <span className="columna-subtitulo">
                    Categoría: {categoriaActual ? categoriaActual.nombre_categoria : "Ninguna seleccionada"}
                  </span>
                </div>

                <button
                  type="button"
                  className="boton-accion-azul"
                  onClick={abrirModalNuevoServicio}
                  disabled={!categoriaSeleccionadaId}
                  id="btn-nuevo-servicio"
                >
                  <span>+</span>
                  <span>Nuevo servicio</span>
                </button>
              </div>

              {servicios.length === 0 ? (
                <div className="estado-vacio">
                  <p className="estado-vacio-texto">
                    No hay servicios registrados para esta categoría.
                  </p>
                  <button
                    type="button"
                    className="boton-accion-azul"
                    onClick={abrirModalNuevoServicio}
                  >
                    + Agregar primer servicio
                  </button>
                </div>
              ) : (
                <div className="tarjetas-lista">
                  {servicios.map((serv) => (
                    <div key={serv.id_servicio} className="tarjeta-servicio">
                      <div className="servicio-info">
                        <span className="servicio-nombre">{serv.nombre_servicio}</span>
                        <div className="servicio-detalle">
                          <span>Tiempo est: {serv.tiempo_estimado || "N/A"}</span>
                          {serv.costo && serv.costo !== "0" && (
                            <span className="servicio-precio">• ${serv.costo}</span>
                          )}
                        </div>
                      </div>

                      <div className="tarjeta-acciones">
                        <button
                          type="button"
                          className="boton-icono-accion"
                          title="Editar servicio"
                          aria-label={`Editar ${serv.nombre_servicio}`}
                          onClick={() => abrirModalEditarServicio(serv)}
                        >
                          <IconoLapiz />
                        </button>
                        <button
                          type="button"
                          className="boton-icono-accion eliminar"
                          title="Eliminar servicio"
                          aria-label={`Eliminar ${serv.nombre_servicio}`}
                          onClick={() => solicitarEliminarServicio(serv)}
                        >
                          <IconoPapelera />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ====================================================================
         * MODAL: NUEVO / EDITAR SERVICIO (Fiel al Mockup 2)
         * ==================================================================== */}
        {modalServicioAbierto && (
          <div className="modal-superposicion" onClick={() => setModalServicioAbierto(false)}>
            <div className="modal-contenedor-mockup" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-mockup">
                <h3 className="modal-titulo-mockup">Nuevo / editar servicio</h3>
                <button
                  type="button"
                  className="modal-boton-cerrar"
                  onClick={() => setModalServicioAbierto(false)}
                  aria-label="Cerrar modal"
                >
                  ×
                </button>
              </div>

              <form onSubmit={guardarServicio}>
                <div className="modal-cuerpo-mockup">
                  {errorFormulario && <p className="campo-error-texto">{errorFormulario}</p>}

                  {/* Campo: Categoría padre */}
                  <div className="campo-grupo-mockup">
                    <label className="campo-label-mockup" htmlFor="input-categoria-padre">
                      Categoría padre
                    </label>
                    <select
                      id="input-categoria-padre"
                      className="campo-select-mockup"
                      value={formServicio.id_categoria}
                      onChange={(e) =>
                        setFormServicio({ ...formServicio, id_categoria: e.target.value })
                      }
                      required
                    >
                      {categorias.map((cat) => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>
                          {cat.nombre_categoria}{" "}
                          {cat.id_categoria === categoriaSeleccionadaId ? "(preseleccionada)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Campo: Nombre del servicio */}
                  <div className="campo-grupo-mockup">
                    <label className="campo-label-mockup" htmlFor="input-nombre-servicio">
                      Nombre del servicio
                    </label>
                    <input
                      id="input-nombre-servicio"
                      type="text"
                      className="campo-input-mockup"
                      placeholder="Ej. Cambio de pasta térmica"
                      value={formServicio.nombre_servicio}
                      onChange={(e) =>
                        setFormServicio({ ...formServicio, nombre_servicio: e.target.value })
                      }
                      required
                      autoFocus
                    />
                  </div>

                  {/* Campo: Descripción breve */}
                  <div className="campo-grupo-mockup">
                    <label className="campo-label-mockup" htmlFor="input-desc-servicio">
                      Descripción breve
                    </label>
                    <textarea
                      id="input-desc-servicio"
                      className="campo-textarea-mockup"
                      rows="2"
                      placeholder="Breve detalle técnico del servicio..."
                      value={formServicio.descripcion}
                      onChange={(e) =>
                        setFormServicio({ ...formServicio, descripcion: e.target.value })
                      }
                    />
                  </div>

                  {/* Fila doble: Tiempo estimado (SLA) y Costo referencial */}
                  <div className="campo-fila-doble">
                    <div className="campo-grupo-mockup">
                      <label className="campo-label-mockup" htmlFor="input-tiempo-sla">
                        Tiempo estimado (SLA)
                      </label>
                      <input
                        id="input-tiempo-sla"
                        type="text"
                        className="campo-input-mockup"
                        placeholder="ej: 2 horas"
                        value={formServicio.tiempo_estimado}
                        onChange={(e) =>
                          setFormServicio({ ...formServicio, tiempo_estimado: e.target.value })
                        }
                      />
                    </div>

                    <div className="campo-grupo-mockup">
                      <label className="campo-label-mockup" htmlFor="input-costo-ref">
                        Costo referencial (opc.)
                      </label>
                      <input
                        id="input-costo-ref"
                        type="text"
                        className="campo-input-mockup"
                        placeholder="$"
                        value={formServicio.costo}
                        onChange={(e) =>
                          setFormServicio({ ...formServicio, costo: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer-mockup">
                  <button
                    type="button"
                    className="modal-boton-cancelar"
                    onClick={() => setModalServicioAbierto(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="modal-boton-guardar">
                    Guardar servicio
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ====================================================================
         * MODAL: NUEVA / EDITAR CATEGORÍA
         * ==================================================================== */}
        {modalCategoriaAbierto && (
          <div className="modal-superposicion" onClick={() => setModalCategoriaAbierto(false)}>
            <div className="modal-contenedor-mockup" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-mockup">
                <h3 className="modal-titulo-mockup">
                  {categoriaEnEdicion ? "Editar categoría" : "Nueva categoría"}
                </h3>
                <button
                  type="button"
                  className="modal-boton-cerrar"
                  onClick={() => setModalCategoriaAbierto(false)}
                  aria-label="Cerrar modal"
                >
                  ×
                </button>
              </div>

              <form onSubmit={guardarCategoria}>
                <div className="modal-cuerpo-mockup">
                  {errorFormulario && <p className="campo-error-texto">{errorFormulario}</p>}

                  <div className="campo-grupo-mockup">
                    <label className="campo-label-mockup" htmlFor="input-nombre-categoria">
                      Nombre de la categoría
                    </label>
                    <input
                      id="input-nombre-categoria"
                      type="text"
                      className="campo-input-mockup"
                      placeholder="Ej. Redes y conectividad"
                      value={formCategoria.nombre_categoria}
                      onChange={(e) =>
                        setFormCategoria({ ...formCategoria, nombre_categoria: e.target.value })
                      }
                      required
                      autoFocus
                    />
                  </div>

                  <div className="campo-grupo-mockup">
                    <label className="campo-label-mockup" htmlFor="input-desc-categoria">
                      Descripción breve
                    </label>
                    <textarea
                      id="input-desc-categoria"
                      className="campo-textarea-mockup"
                      rows="3"
                      placeholder="Descripción de los servicios que cubre esta categoría..."
                      value={formCategoria.descripcion}
                      onChange={(e) =>
                        setFormCategoria({ ...formCategoria, descripcion: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="modal-footer-mockup">
                  <button
                    type="button"
                    className="modal-boton-cancelar"
                    onClick={() => setModalCategoriaAbierto(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="modal-boton-guardar">
                    Guardar categoría
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ====================================================================
         * MODAL: CONFIRMACIÓN DE ELIMINACIÓN
         * ==================================================================== */}
        {modalEliminar.abierto && (
          <div
            className="modal-superposicion"
            onClick={() => setModalEliminar({ abierto: false, tipo: "", id: null, nombre: "" })}
          >
            <div className="modal-contenedor-mockup" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-mockup">
                <h3 className="modal-titulo-mockup" style={{ color: "#dc2626" }}>
                  Confirmar eliminación
                </h3>
                <button
                  type="button"
                  className="modal-boton-cerrar"
                  onClick={() =>
                    setModalEliminar({ abierto: false, tipo: "", id: null, nombre: "" })
                  }
                  aria-label="Cerrar modal"
                >
                  ×
                </button>
              </div>

              <div className="modal-cuerpo-mockup">
                <p style={{ margin: 0, color: "#475569", lineHeight: 1.5 }}>
                  ¿Estás seguro de que deseas eliminar{" "}
                  <strong>{modalEliminar.tipo === "categoria" ? "la categoría" : "el servicio"}</strong>{" "}
                  «<strong>{modalEliminar.nombre}</strong>»?
                  {modalEliminar.tipo === "categoria" && (
                    <span style={{ display: "block", marginTop: "8px", fontSize: "0.85rem", color: "#dc2626" }}>
                      Nota: También se desvincularán los servicios asociados.
                    </span>
                  )}
                </p>
              </div>

              <div className="modal-footer-mockup">
                <button
                  type="button"
                  className="modal-boton-cancelar"
                  onClick={() =>
                    setModalEliminar({ abierto: false, tipo: "", id: null, nombre: "" })
                  }
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="modal-boton-eliminar-confirmar"
                  onClick={confirmarEliminar}
                >
                  Eliminar definitivamente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}