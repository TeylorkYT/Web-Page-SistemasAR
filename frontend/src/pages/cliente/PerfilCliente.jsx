import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import Boton from "../../components/Boton";
import { useAuth } from "../../context/AuthContext";
import {
  obtenerPerfilCliente,
  actualizarPerfilCliente,
  obtenerEquiposCliente,
  crearEquipoCliente,
  actualizarEquipoCliente,
} from "../../services/clienteService";
import "./PerfilCliente.css";

export default function PerfilCliente() {
  const { sesion, guardarSesion } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para modal de editar perfil
  const [modalPerfilAbierto, setModalPerfilAbierto] = useState(false);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [mensajePerfil, setMensajePerfil] = useState(null);
  const [formPerfil, setFormPerfil] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    area_departamento: "",
  });

  // Estados para modal de añadir equipo
  const [modalEquipoAbierto, setModalEquipoAbierto] = useState(false);
  const [guardandoEquipo, setGuardandoEquipo] = useState(false);
  const [mensajeEquipo, setMensajeEquipo] = useState(null);
  const [formEquipo, setFormEquipo] = useState({
    tipo: "Computador",
    marca: "",
    modelo: "",
    serial: "",
    sistema_operativo: "",
    area_departamento: "General",
  });

  // Estados para modal de editar equipo
  const [modalEditarEquipoAbierto, setModalEditarEquipoAbierto] = useState(false);
  const [equipoAEditar, setEquipoAEditar] = useState(null);
  const [guardandoEditarEquipo, setGuardandoEditarEquipo] = useState(false);
  const [mensajeEditarEquipo, setMensajeEditarEquipo] = useState(null);
  const [formEditarEquipo, setFormEditarEquipo] = useState({
    tipo: "Computador",
    marca: "",
    modelo: "",
    serial: "",
    sistema_operativo: "",
    area_departamento: "General",
    estado_equipo: "Operativo",
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resultadoPerfil, resultadoEquipos] = await Promise.allSettled([
        obtenerPerfilCliente(),
        obtenerEquiposCliente(),
      ]);

      if (resultadoPerfil.status === "fulfilled") {
        setPerfil(resultadoPerfil.value);
      } else {
        console.error("Error al cargar perfil:", resultadoPerfil.reason);
      }

      if (resultadoEquipos.status === "fulfilled") {
        setEquipos(resultadoEquipos.value || []);
      } else {
        console.error("Error al cargar equipos:", resultadoEquipos.reason);
      }
    } catch (error) {
      console.error("Error al cargar el perfil y equipos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- Modal Editar Perfil ---
  const abrirModalPerfil = () => {
    setMensajePerfil(null);
    setFormPerfil({
      nombre: perfil?.nombre || "",
      apellido: perfil?.apellido || "",
      telefono: perfil?.telefono || "",
      direccion: perfil?.direccion || "",
      area_departamento: perfil?.area_departamento || "",
    });
    setModalPerfilAbierto(true);
  };

  const manejarGuardarPerfil = async (e) => {
    e.preventDefault();
    if (!formPerfil.nombre.trim() || !formPerfil.apellido.trim()) {
      setMensajePerfil({
        tipo: "error",
        texto: "Nombre y apellido son obligatorios.",
      });
      return;
    }

    setGuardandoPerfil(true);
    setMensajePerfil(null);
    try {
      const perfilActualizado = await actualizarPerfilCliente({
        nombre: formPerfil.nombre.trim(),
        apellido: formPerfil.apellido.trim(),
        telefono: formPerfil.telefono.trim(),
        direccion: formPerfil.direccion.trim(),
        area_departamento: formPerfil.area_departamento.trim(),
      });
      setPerfil(perfilActualizado);

      if (sesion) {
        guardarSesion({
          ...sesion,
          nombre: `${perfilActualizado.nombre} ${perfilActualizado.apellido}`,
        });
      }

      setMensajePerfil({
        tipo: "exito",
        texto: "¡Tus datos de perfil han sido actualizados con éxito!",
      });

      setTimeout(() => {
        setModalPerfilAbierto(false);
        setMensajePerfil(null);
      }, 1200);
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      const detalle =
        error.response?.data?.detail || "No se pudo actualizar el perfil.";
      setMensajePerfil({
        tipo: "error",
        texto: typeof detalle === "string" ? detalle : "Error al guardar cambios.",
      });
    } finally {
      setGuardandoPerfil(false);
    }
  };

  // --- Modal Añadir Equipo ---
  const abrirModalEquipo = () => {
    setMensajeEquipo(null);
    setFormEquipo({
      tipo: "Computador",
      marca: "",
      modelo: "",
      serial: "",
      sistema_operativo: "",
      area_departamento: perfil?.area_departamento || "General",
    });
    setModalEquipoAbierto(true);
  };

  const manejarGuardarEquipo = async (e) => {
    e.preventDefault();
    if (!formEquipo.marca.trim() || !formEquipo.modelo.trim() || !formEquipo.serial.trim()) {
      setMensajeEquipo({
        tipo: "error",
        texto: "Marca, modelo y número de serial son obligatorios.",
      });
      return;
    }

    setGuardandoEquipo(true);
    setMensajeEquipo(null);
    try {
      const nuevoEquipo = await crearEquipoCliente({
        tipo: formEquipo.tipo,
        marca: formEquipo.marca.trim(),
        modelo: formEquipo.modelo.trim(),
        serial: formEquipo.serial.trim(),
        sistema_operativo: formEquipo.sistema_operativo.trim() || null,
        area_departamento: formEquipo.area_departamento.trim() || "General",
      });
      setEquipos((prev) => [nuevoEquipo, ...prev]);
      setMensajeEquipo({
        tipo: "exito",
        texto: "¡Equipo registrado exitosamente!",
      });

      setTimeout(() => {
        setModalEquipoAbierto(false);
        setMensajeEquipo(null);
      }, 1200);
    } catch (error) {
      console.error("Error al registrar equipo:", error);
      const detalle =
        error.response?.data?.detail || "No se pudo registrar el equipo.";
      setMensajeEquipo({
        tipo: "error",
        texto: typeof detalle === "string" ? detalle : "Error al registrar el equipo.",
      });
    } finally {
      setGuardandoEquipo(false);
    }
  };

  // --- Modal Editar Equipo ---
  const abrirModalEditarEquipo = (equipo) => {
    setEquipoAEditar(equipo);
    setMensajeEditarEquipo(null);
    setFormEditarEquipo({
      tipo: equipo.tipo || "Computador",
      marca: equipo.marca || "",
      modelo: equipo.modelo || "",
      serial: equipo.serial || "",
      sistema_operativo: equipo.sistema_operativo || "",
      area_departamento: equipo.area_departamento || "General",
      estado_equipo: equipo.estado_equipo || "Operativo",
    });
    setModalEditarEquipoAbierto(true);
  };

  const manejarGuardarEditarEquipo = async (e) => {
    e.preventDefault();
    if (!formEditarEquipo.marca.trim() || !formEditarEquipo.modelo.trim() || !formEditarEquipo.serial.trim()) {
      setMensajeEditarEquipo({
        tipo: "error",
        texto: "Marca, modelo y número de serial son obligatorios.",
      });
      return;
    }

    setGuardandoEditarEquipo(true);
    setMensajeEditarEquipo(null);
    try {
      const equipoActualizado = await actualizarEquipoCliente(equipoAEditar.id_equipo, {
        tipo: formEditarEquipo.tipo,
        marca: formEditarEquipo.marca.trim(),
        modelo: formEditarEquipo.modelo.trim(),
        serial: formEditarEquipo.serial.trim(),
        sistema_operativo: formEditarEquipo.sistema_operativo.trim() || null,
        area_departamento: formEditarEquipo.area_departamento.trim() || "General",
        estado_equipo: formEditarEquipo.estado_equipo,
      });

      setEquipos((prev) =>
        prev.map((eq) => (eq.id_equipo === equipoActualizado.id_equipo ? equipoActualizado : eq))
      );

      setMensajeEditarEquipo({
        tipo: "exito",
        texto: "¡Equipo actualizado correctamente!",
      });

      setTimeout(() => {
        setModalEditarEquipoAbierto(false);
        setMensajeEditarEquipo(null);
      }, 1200);
    } catch (error) {
      console.error("Error al actualizar equipo:", error);
      const detalle =
        error.response?.data?.detail || "No se pudo actualizar el equipo.";
      setMensajeEditarEquipo({
        tipo: "error",
        texto: typeof detalle === "string" ? detalle : "Error al actualizar el equipo.",
      });
    } finally {
      setGuardandoEditarEquipo(false);
    }
  };

  const nombreMostrar = perfil?.nombre
    ? `${perfil.nombre} ${perfil.apellido}`
    : sesion?.nombre;

  if (cargando) {
    return (
      <Layout rol="cliente" itemActivo="perfil-equipos" nombreUsuario={nombreMostrar}>
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
          Cargando perfil y equipos...
        </div>
      </Layout>
    );
  }

  return (
    <Layout rol="cliente" itemActivo="perfil-equipos" nombreUsuario={nombreMostrar}>
      <div className="perfil-contenedor">
        <header className="perfil-header">
          <h1>Mi Perfil y Equipos Registrados</h1>
          <p>Consulta y administra tus datos personales y el inventario de equipos asignados a tu cuenta.</p>
        </header>

        <div className="perfil-grid">
          {/* Tarjeta de Datos Personales */}
          <section className="perfil-card">
            <div className="perfil-user-header">
              <div className="perfil-avatar">
                {perfil?.nombre?.charAt(0) || "U"}
                {perfil?.apellido?.charAt(0) || ""}
              </div>
              <div className="perfil-user-info">
                <h2>
                  {perfil?.nombre} {perfil?.apellido}
                </h2>
                <span className="perfil-badge-rol">{perfil?.rol || "Cliente"}</span>
              </div>
            </div>

            <div className="perfil-info-list">
              <InfoItem etiqueta="Correo Electrónico" valor={perfil?.correo_electronico} />
              <InfoItem etiqueta="Teléfono" valor={perfil?.telefono} />
              <InfoItem etiqueta="Dirección" valor={perfil?.direccion} />
              <InfoItem etiqueta="Área / Departamento" valor={perfil?.area_departamento} />
              <InfoItem etiqueta="Miembro desde" valor={perfil?.fecha_registro} />
            </div>

            <footer className="perfil-card-footer">
              <Boton
                variante="secundario"
                onClick={abrirModalPerfil}
              >
                Editar Perfil
              </Boton>
            </footer>
          </section>

          {/* Tarjeta de Mis Equipos Registrados */}
          <section className="perfil-card">
            <div className="perfil-equipos-header">
              <div>
                <h2>Mis Equipos Registrados</h2>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  {equipos.length} {equipos.length === 1 ? "equipo asociado" : "equipos asociados"}
                </span>
              </div>
              <Boton
                variante="primario"
                onClick={abrirModalEquipo}
                style={{ padding: "6px 14px", fontSize: "13px" }}
              >
                + Añadir Equipo
              </Boton>
            </div>

            {equipos.length > 0 ? (
              <div className="perfil-equipos-lista">
                {equipos.map((equipo) => {
                  const estadoClase =
                    equipo.estado_equipo === "Operativo"
                      ? "badge-operativo"
                      : equipo.estado_equipo === "En_Reparacion"
                      ? "badge-reparacion"
                      : "badge-baja";

                  return (
                    <div key={equipo.id_equipo} className="equipo-item">
                      <div>
                        <p className="equipo-info-titulo">
                          {equipo.tipo} - {equipo.marca} {equipo.modelo}
                        </p>
                        <p className="equipo-info-detalle">
                          S/N: {equipo.serial}
                          {equipo.sistema_operativo ? ` • OS: ${equipo.sistema_operativo}` : ""}
                          {equipo.area_departamento ? ` • Ubicación: ${equipo.area_departamento}` : ""}
                        </p>
                      </div>

                      <div className="equipo-item-acciones">
                        <span className={`badge-estado-equipo ${estadoClase}`}>
                          {equipo.estado_equipo.replace("_", " ")}
                        </span>
                        <button
                          type="button"
                          className="btn-editar-equipo"
                          onClick={() => abrirModalEditarEquipo(equipo)}
                          title="Editar información de este equipo"
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: "#64748b", fontSize: "14px", textAlign: "center", padding: "30px 0" }}>
                No tienes equipos registrados actualmente. Usa el botón superior para agregar tu primer equipo.
              </p>
            )}
          </section>
        </div>
      </div>

      {/* Modal: Editar Perfil */}
      {modalPerfilAbierto && (
        <div className="perfil-modal-overlay" onClick={() => !guardandoPerfil && setModalPerfilAbierto(false)}>
          <div className="perfil-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="perfil-modal-header">
              <h3>Editar Información de Perfil</h3>
              <button
                type="button"
                onClick={() => setModalPerfilAbierto(false)}
                disabled={guardandoPerfil}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={manejarGuardarPerfil}>
              <div className="perfil-modal-body">
                {mensajePerfil && (
                  <div
                    className={`perfil-alerta ${
                      mensajePerfil.tipo === "exito"
                        ? "perfil-alerta-exito"
                        : "perfil-alerta-error"
                    }`}
                  >
                    {mensajePerfil.texto}
                  </div>
                )}

                <div className="perfil-form-group">
                  <label htmlFor="perfil-correo">Correo Electrónico (No modificable)</label>
                  <input
                    id="perfil-correo"
                    type="email"
                    className="perfil-input"
                    value={perfil?.correo_electronico || ""}
                    disabled
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="perfil-form-group">
                    <label htmlFor="perfil-nombre">Nombre *</label>
                    <input
                      id="perfil-nombre"
                      type="text"
                      className="perfil-input"
                      value={formPerfil.nombre}
                      onChange={(e) =>
                        setFormPerfil({ ...formPerfil, nombre: e.target.value })
                      }
                      required
                      maxLength={50}
                      disabled={guardandoPerfil}
                    />
                  </div>
                  <div className="perfil-form-group">
                    <label htmlFor="perfil-apellido">Apellido *</label>
                    <input
                      id="perfil-apellido"
                      type="text"
                      className="perfil-input"
                      value={formPerfil.apellido}
                      onChange={(e) =>
                        setFormPerfil({ ...formPerfil, apellido: e.target.value })
                      }
                      required
                      maxLength={50}
                      disabled={guardandoPerfil}
                    />
                  </div>
                </div>

                <div className="perfil-form-group">
                  <label htmlFor="perfil-telefono">Teléfono de Contacto</label>
                  <input
                    id="perfil-telefono"
                    type="text"
                    className="perfil-input"
                    value={formPerfil.telefono}
                    onChange={(e) =>
                      setFormPerfil({ ...formPerfil, telefono: e.target.value })
                    }
                    placeholder="Ej. +57 300 1234567"
                    maxLength={20}
                    disabled={guardandoPerfil}
                  />
                </div>

                <div className="perfil-form-group">
                  <label htmlFor="perfil-direccion">Dirección</label>
                  <input
                    id="perfil-direccion"
                    type="text"
                    className="perfil-input"
                    value={formPerfil.direccion}
                    onChange={(e) =>
                      setFormPerfil({ ...formPerfil, direccion: e.target.value })
                    }
                    placeholder="Ej. Cra 45 # 12-34 Oficina 301"
                    maxLength={150}
                    disabled={guardandoPerfil}
                  />
                </div>

                <div className="perfil-form-group">
                  <label htmlFor="perfil-area">Área / Departamento</label>
                  <input
                    id="perfil-area"
                    type="text"
                    className="perfil-input"
                    value={formPerfil.area_departamento}
                    onChange={(e) =>
                      setFormPerfil({
                        ...formPerfil,
                        area_departamento: e.target.value,
                      })
                    }
                    placeholder="Ej. Finanzas, Contabilidad, Operaciones"
                    maxLength={80}
                    disabled={guardandoPerfil}
                  />
                </div>
              </div>

              <div className="perfil-modal-footer">
                <Boton
                  variante="secundario"
                  tipo="button"
                  onClick={() => setModalPerfilAbierto(false)}
                  deshabilitado={guardandoPerfil}
                >
                  Cancelar
                </Boton>
                <Boton
                  variante="primario"
                  tipo="submit"
                  deshabilitado={guardandoPerfil}
                >
                  {guardandoPerfil ? "Guardando..." : "Guardar Cambios"}
                </Boton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Añadir Equipo */}
      {modalEquipoAbierto && (
        <div className="perfil-modal-overlay" onClick={() => !guardandoEquipo && setModalEquipoAbierto(false)}>
          <div className="perfil-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="perfil-modal-header">
              <h3>Registrar Nuevo Equipo</h3>
              <button
                type="button"
                onClick={() => setModalEquipoAbierto(false)}
                disabled={guardandoEquipo}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={manejarGuardarEquipo}>
              <div className="perfil-modal-body">
                {mensajeEquipo && (
                  <div
                    className={`perfil-alerta ${
                      mensajeEquipo.tipo === "exito"
                        ? "perfil-alerta-exito"
                        : "perfil-alerta-error"
                    }`}
                  >
                    {mensajeEquipo.texto}
                  </div>
                )}

                <div className="perfil-form-group">
                  <label htmlFor="equipo-tipo">Tipo de Dispositivo *</label>
                  <select
                    id="equipo-tipo"
                    className="perfil-input"
                    value={formEquipo.tipo}
                    onChange={(e) =>
                      setFormEquipo({ ...formEquipo, tipo: e.target.value })
                    }
                    disabled={guardandoEquipo}
                  >
                    <option value="Computador">Computador</option>
                    <option value="Impresora">Impresora</option>
                    <option value="Servidor">Servidor</option>
                    <option value="Red">Equipo de Red</option>
                    <option value="Otro">Otro Dispositivo</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="perfil-form-group">
                    <label htmlFor="equipo-marca">Marca *</label>
                    <input
                      id="equipo-marca"
                      type="text"
                      className="perfil-input"
                      placeholder="Ej. Dell, HP, Lenovo"
                      value={formEquipo.marca}
                      onChange={(e) =>
                        setFormEquipo({ ...formEquipo, marca: e.target.value })
                      }
                      required
                      maxLength={50}
                      disabled={guardandoEquipo}
                    />
                  </div>
                  <div className="perfil-form-group">
                    <label htmlFor="equipo-modelo">Modelo *</label>
                    <input
                      id="equipo-modelo"
                      type="text"
                      className="perfil-input"
                      placeholder="Ej. Latitude 5420"
                      value={formEquipo.modelo}
                      onChange={(e) =>
                        setFormEquipo({ ...formEquipo, modelo: e.target.value })
                      }
                      required
                      maxLength={50}
                      disabled={guardandoEquipo}
                    />
                  </div>
                </div>

                <div className="perfil-form-group">
                  <label htmlFor="equipo-serial">Número de Serial (S/N) *</label>
                  <input
                    id="equipo-serial"
                    type="text"
                    className="perfil-input"
                    placeholder="Ej. ABC123XYZ"
                    value={formEquipo.serial}
                    onChange={(e) =>
                      setFormEquipo({ ...formEquipo, serial: e.target.value })
                    }
                    required
                    maxLength={50}
                    disabled={guardandoEquipo}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="perfil-form-group">
                    <label htmlFor="equipo-so">Sistema Operativo</label>
                    <input
                      id="equipo-so"
                      type="text"
                      className="perfil-input"
                      placeholder="Ej. Windows 11 Pro"
                      value={formEquipo.sistema_operativo}
                      onChange={(e) =>
                        setFormEquipo({
                          ...formEquipo,
                          sistema_operativo: e.target.value,
                        })
                      }
                      maxLength={50}
                      disabled={guardandoEquipo}
                    />
                  </div>
                  <div className="perfil-form-group">
                    <label htmlFor="equipo-area">Área o Ubicación</label>
                    <input
                      id="equipo-area"
                      type="text"
                      className="perfil-input"
                      value={formEquipo.area_departamento}
                      onChange={(e) =>
                        setFormEquipo({
                          ...formEquipo,
                          area_departamento: e.target.value,
                        })
                      }
                      maxLength={80}
                      disabled={guardandoEquipo}
                    />
                  </div>
                </div>
              </div>

              <div className="perfil-modal-footer">
                <Boton
                  variante="secundario"
                  tipo="button"
                  onClick={() => setModalEquipoAbierto(false)}
                  deshabilitado={guardandoEquipo}
                >
                  Cancelar
                </Boton>
                <Boton
                  variante="primario"
                  tipo="submit"
                  deshabilitado={guardandoEquipo}
                >
                  {guardandoEquipo ? "Guardando..." : "Registrar Equipo"}
                </Boton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Equipo */}
      {modalEditarEquipoAbierto && (
        <div className="perfil-modal-overlay" onClick={() => !guardandoEditarEquipo && setModalEditarEquipoAbierto(false)}>
          <div className="perfil-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="perfil-modal-header">
              <h3>Editar Equipo Registrado</h3>
              <button
                type="button"
                onClick={() => setModalEditarEquipoAbierto(false)}
                disabled={guardandoEditarEquipo}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={manejarGuardarEditarEquipo}>
              <div className="perfil-modal-body">
                {mensajeEditarEquipo && (
                  <div
                    className={`perfil-alerta ${
                      mensajeEditarEquipo.tipo === "exito"
                        ? "perfil-alerta-exito"
                        : "perfil-alerta-error"
                    }`}
                  >
                    {mensajeEditarEquipo.texto}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="perfil-form-group">
                    <label htmlFor="editar-equipo-tipo">Tipo de Dispositivo *</label>
                    <select
                      id="editar-equipo-tipo"
                      className="perfil-input"
                      value={formEditarEquipo.tipo}
                      onChange={(e) =>
                        setFormEditarEquipo({ ...formEditarEquipo, tipo: e.target.value })
                      }
                      disabled={guardandoEditarEquipo}
                    >
                      <option value="Computador">Computador</option>
                      <option value="Impresora">Impresora</option>
                      <option value="Servidor">Servidor</option>
                      <option value="Red">Equipo de Red</option>
                      <option value="Otro">Otro Dispositivo</option>
                    </select>
                  </div>
                  <div className="perfil-form-group">
                    <label htmlFor="editar-equipo-estado">Estado del Equipo *</label>
                    <select
                      id="editar-equipo-estado"
                      className="perfil-input"
                      value={formEditarEquipo.estado_equipo}
                      onChange={(e) =>
                        setFormEditarEquipo({ ...formEditarEquipo, estado_equipo: e.target.value })
                      }
                      disabled={guardandoEditarEquipo}
                    >
                      <option value="Operativo">Operativo</option>
                      <option value="En_Reparacion">En Reparación</option>
                      <option value="Fuera_de_Servicio">Fuera de Servicio</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="perfil-form-group">
                    <label htmlFor="editar-equipo-marca">Marca *</label>
                    <input
                      id="editar-equipo-marca"
                      type="text"
                      className="perfil-input"
                      value={formEditarEquipo.marca}
                      onChange={(e) =>
                        setFormEditarEquipo({ ...formEditarEquipo, marca: e.target.value })
                      }
                      required
                      maxLength={50}
                      disabled={guardandoEditarEquipo}
                    />
                  </div>
                  <div className="perfil-form-group">
                    <label htmlFor="editar-equipo-modelo">Modelo *</label>
                    <input
                      id="editar-equipo-modelo"
                      type="text"
                      className="perfil-input"
                      value={formEditarEquipo.modelo}
                      onChange={(e) =>
                        setFormEditarEquipo({ ...formEditarEquipo, modelo: e.target.value })
                      }
                      required
                      maxLength={50}
                      disabled={guardandoEditarEquipo}
                    />
                  </div>
                </div>

                <div className="perfil-form-group">
                  <label htmlFor="editar-equipo-serial">Número de Serial (S/N) *</label>
                  <input
                    id="editar-equipo-serial"
                    type="text"
                    className="perfil-input"
                    value={formEditarEquipo.serial}
                    onChange={(e) =>
                      setFormEditarEquipo({ ...formEditarEquipo, serial: e.target.value })
                    }
                    required
                    maxLength={50}
                    disabled={guardandoEditarEquipo}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="perfil-form-group">
                    <label htmlFor="editar-equipo-so">Sistema Operativo</label>
                    <input
                      id="editar-equipo-so"
                      type="text"
                      className="perfil-input"
                      value={formEditarEquipo.sistema_operativo}
                      onChange={(e) =>
                        setFormEditarEquipo({
                          ...formEditarEquipo,
                          sistema_operativo: e.target.value,
                        })
                      }
                      maxLength={50}
                      disabled={guardandoEditarEquipo}
                    />
                  </div>
                  <div className="perfil-form-group">
                    <label htmlFor="editar-equipo-area">Área o Ubicación</label>
                    <input
                      id="editar-equipo-area"
                      type="text"
                      className="perfil-input"
                      value={formEditarEquipo.area_departamento}
                      onChange={(e) =>
                        setFormEditarEquipo({
                          ...formEditarEquipo,
                          area_departamento: e.target.value,
                        })
                      }
                      maxLength={80}
                      disabled={guardandoEditarEquipo}
                    />
                  </div>
                </div>
              </div>

              <div className="perfil-modal-footer">
                <Boton
                  variante="secundario"
                  tipo="button"
                  onClick={() => setModalEditarEquipoAbierto(false)}
                  deshabilitado={guardandoEditarEquipo}
                >
                  Cancelar
                </Boton>
                <Boton
                  variante="primario"
                  tipo="submit"
                  deshabilitado={guardandoEditarEquipo}
                >
                  {guardandoEditarEquipo ? "Guardando..." : "Guardar Cambios"}
                </Boton>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

function InfoItem({ etiqueta, valor }) {
  return (
    <div className="perfil-info-item">
      <label>{etiqueta}</label>
      <span>{valor || "No especificado"}</span>
    </div>
  );
}