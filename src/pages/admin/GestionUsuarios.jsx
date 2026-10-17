import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Tabla from "../../components/Tabla";
import EstadoBadge from "../../components/EstadoBadge";
import { useAuth } from "../../context/AuthContext";
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "../../services/usuariosService";

const POR_PAGINA = 10;
const formVacio = {
  rol: "Cliente",
  nombre: "",
  apellido: "",
  correo_electronico: "",
  contrasena: "",
  estado: "Activo",
};

const overlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000,
};
const modal = { background: "white", padding: "24px", borderRadius: "12px", width: "380px" };
const campo = { display: "block", width: "100%", padding: "8px", marginBottom: "12px", boxSizing: "border-box" };
const botonAzul = { padding: "8px 16px", background: "#1d4ed8", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" };

function normalizarRol(rol) {
  if (!rol) return "Cliente";
  const r = String(rol).trim().toLowerCase();
  if (r === "administrador" || r === "admin") return "Administrador";
  if (r === "tecnico" || r === "técnico") return "Tecnico";
  return "Cliente";
}

export default function GestionUsuarios() {
  const { sesion } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");

  useEffect(() => {
    listarUsuarios().then(setUsuarios);
  }, []);

  const filtrados = usuarios.filter((u) => {
    const texto = `${u.nombre} ${u.apellido} ${u.correo_electronico}`.toLowerCase();
    const coincideRol = filtroRol === "todos" || normalizarRol(u.rol) === filtroRol;
    return texto.includes(busqueda.toLowerCase()) && coincideRol;
  });
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  function abrirNuevo() {
    setForm({ ...formVacio });
    setError("");
  }

  function abrirEditar(u) {
    setForm({ ...u, rol: normalizarRol(u.rol), contrasena: "" });
    setError("");
  }

  function cerrar() {
    setForm(null);
    setError("");
  }

  function solicitarEliminar(u) {
    const correoSesion = sesion?.correo_electronico;
    const nombreSesion = sesion?.nombre;
    const esMismoUsuario =
      (correoSesion && u.correo_electronico?.toLowerCase() === correoSesion.toLowerCase()) ||
      (nombreSesion && `${u.nombre} ${u.apellido}`.trim().toLowerCase() === nombreSesion.trim().toLowerCase());

    if (esMismoUsuario) {
      setErrorEliminar("No puedes eliminar la cuenta con la que has iniciado sesión actualmente.");
      setUsuarioAEliminar(u);
      return;
    }

    setErrorEliminar("");
    setUsuarioAEliminar(u);
  }

  async function confirmarEliminar() {
    if (!usuarioAEliminar) return;
    setEliminando(true);
    setErrorEliminar("");

    try {
      await eliminarUsuario(usuarioAEliminar.id_usuario);
      setUsuarios((prev) => prev.filter((u) => u.id_usuario !== usuarioAEliminar.id_usuario));
      setMensaje(`Usuario "${usuarioAEliminar.nombre} ${usuarioAEliminar.apellido}" eliminado correctamente`);
      if (form && form.id_usuario === usuarioAEliminar.id_usuario) {
        cerrar();
      }
      setUsuarioAEliminar(null);
    } catch (err) {
      setErrorEliminar(err.message || "Error al eliminar el usuario");
    } finally {
      setEliminando(false);
    }
  }

  async function guardar(e) {
    e.preventDefault();
    const esNuevo = !form.id_usuario;

    if (!form.nombre.trim() || !form.apellido.trim() || !form.correo_electronico.trim()) {
      setError("Nombre, apellido y correo son obligatorios");
      return;
    }
    if (esNuevo && !form.contrasena.trim()) {
      setError("La contraseña es obligatoria para un usuario nuevo");
      return;
    }

    try {
      const rolDefinido = normalizarRol(form.rol);
      if (esNuevo) {
        const nuevo = await crearUsuario({
          ...form,
          rol: rolDefinido,
        });
        setUsuarios([...usuarios, nuevo]);
        setMensaje("Usuario creado correctamente");
      } else {
        const payload = {
          nombre: form.nombre,
          apellido: form.apellido,
          correo_electronico: form.correo_electronico,
          rol: rolDefinido,
          estado: form.estado,
        };
        if (form.contrasena && form.contrasena.trim()) {
          payload.contrasena = form.contrasena.trim();
        }
        const actualizado = await actualizarUsuario(form.id_usuario, payload);
        setUsuarios(
          usuarios.map((u) => (u.id_usuario === form.id_usuario ? actualizado : u))
        );
        setMensaje("Usuario actualizado correctamente");
      }
      cerrar();
    } catch (err) {
      setError(err.message || "Error al guardar el usuario");
    }
  }

  const columnas = [
    { titulo: "ID", campo: "id_usuario", render: (u) => String(u.id_usuario).padStart(2, "0") },
    {
      titulo: "Nombre / correo",
      campo: "nombre",
      render: (u) => (
        <>
          {u.nombre} {u.apellido}
          <br />
          <small>{u.correo_electronico}</small>
        </>
      ),
    },
    { titulo: "Rol", campo: "rol", render: (u) => normalizarRol(u.rol) },
    { titulo: "Estado", campo: "estado", render: (u) => <EstadoBadge estado={u.estado} /> },
    {
      titulo: "Acciones",
      campo: "acciones",
      render: (u) => (
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => abrirEditar(u)}
            title="Editar usuario"
            style={{
              padding: "4px 8px",
              background: "#e0e7ff",
              color: "#3730a3",
              border: "1px solid #c7d2fe",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            ⚙️ Editar
          </button>
          <button
            onClick={() => solicitarEliminar(u)}
            title="Eliminar usuario"
            style={{
              padding: "4px 8px",
              background: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fecaca",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            🗑️ Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout rol="administrador" itemActivo="usuarios">
      <h1>Gestión de usuarios</h1>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
        <input
          placeholder="Buscar por nombre o correo"
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
          style={{ flex: 1, padding: "8px" }}
        />
        <select
          value={filtroRol}
          onChange={(e) => { setFiltroRol(e.target.value); setPagina(1); }}
          style={{ padding: "8px" }}
        >
          <option value="todos">Filtro: rol</option>
          <option value="Cliente">Cliente</option>
          <option value="Tecnico">Técnico</option>
          <option value="Administrador">Administrador</option>
        </select>
        <button onClick={abrirNuevo} style={botonAzul}>+ Nuevo usuario</button>
      </div>

      {mensaje && (
        <div
          style={{
            padding: "10px 14px",
            background: "#ecfdf5",
            color: "#065f46",
            border: "1px solid #a7f3d0",
            borderRadius: "6px",
            marginBottom: "16px",
          }}
        >
          {mensaje}
        </div>
      )}

      <h3>Listado de usuarios</h3>
      <Tabla columnas={columnas} filas={visibles} mensajeVacio="No hay usuarios con ese filtro" />

      <div style={{ textAlign: "center", marginTop: "12px" }}>
        <button disabled={paginaActual === 1} onClick={() => setPagina(paginaActual - 1)}>Anterior</button>
        <span style={{ margin: "0 12px" }}>Página {paginaActual} de {totalPaginas}</span>
        <button disabled={paginaActual === totalPaginas} onClick={() => setPagina(paginaActual + 1)}>Siguiente</button>
      </div>

      {form && (
        <div style={overlay}>
          <div style={modal}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h2>{form.id_usuario ? "Editar usuario" : "Nuevo usuario"}</h2>
              <button
                onClick={cerrar}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#6b7280" }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={guardar}>
              <label>Tipo de usuario</label>
              <select style={campo} value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                <option value="Cliente">Cliente</option>
                <option value="Tecnico">Técnico</option>
                <option value="Administrador">Administrador</option>
              </select>

              <label>Nombre</label>
              <input style={campo} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />

              <label>Apellido</label>
              <input style={campo} value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />

              <label>Correo electrónico</label>
              <input
                style={campo}
                value={form.correo_electronico}
                onChange={(e) => setForm({ ...form, correo_electronico: e.target.value })}
              />

              <label>Contraseña</label>
              <input
                style={campo}
                type="password"
                placeholder={form.id_usuario ? "Dejar vacío para no cambiar" : ""}
                value={form.contrasena}
                onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
              />

              <div style={{ marginBottom: "12px" }}>
                Estado{" "}
                <label>
                  <input
                    type="radio"
                    name="estado"
                    checked={form.estado === "Activo"}
                    onChange={() => setForm({ ...form, estado: "Activo" })}
                  />{" "}
                  Activo
                </label>{" "}
                <label>
                  <input
                    type="radio"
                    name="estado"
                    checked={form.estado === "Inactivo"}
                    onChange={() => setForm({ ...form, estado: "Inactivo" })}
                  />{" "}
                  Inactivo
                </label>
              </div>

              {error && <p style={{ color: "red" }}>{error}</p>}

              <div style={{ display: "flex", justifyContent: form.id_usuario ? "space-between" : "flex-end", alignItems: "center", marginTop: "16px" }}>
                {form.id_usuario ? (
                  <button
                    type="button"
                    onClick={() => solicitarEliminar(form)}
                    style={{
                      padding: "8px 12px",
                      background: "#fff",
                      color: "#dc2626",
                      border: "1px solid #fca5a5",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                ) : null}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={cerrar}
                    style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #ccc", background: "#f9fafb", cursor: "pointer" }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" style={botonAzul}>
                    Guardar usuario
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {usuarioAEliminar && (
        <div style={overlay}>
          <div style={{ ...modal, width: "420px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, color: "#991b1b", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>⚠️</span> Confirmar eliminación
              </h3>
              <button
                onClick={() => { setUsuarioAEliminar(null); setErrorEliminar(""); }}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#6b7280" }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: "0 0 12px 0", color: "#374151", fontSize: "0.95rem" }}>
              ¿Estás seguro de que deseas eliminar permanentemente al usuario:
            </p>

            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px", marginBottom: "14px" }}>
              <div style={{ fontWeight: 600, color: "#111827" }}>
                {usuarioAEliminar.nombre} {usuarioAEliminar.apellido}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                {usuarioAEliminar.correo_electronico}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#4b5563", marginTop: "4px" }}>
                Rol: <strong>{normalizarRol(usuarioAEliminar.rol)}</strong>
              </div>
            </div>

            {errorEliminar ? (
              <div style={{ padding: "10px", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px", fontSize: "0.85rem", marginBottom: "14px", border: "1px solid #f87171" }}>
                {errorEliminar}
              </div>
            ) : (
              <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "0 0 16px 0" }}>
                Esta acción no se puede deshacer. Se desvinculará al usuario del sistema.
              </p>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => { setUsuarioAEliminar(null); setErrorEliminar(""); }}
                style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "white", cursor: "pointer" }}
              >
                {errorEliminar ? "Cerrar" : "Cancelar"}
              </button>
              {!errorEliminar && (
                <button
                  type="button"
                  onClick={confirmarEliminar}
                  disabled={eliminando}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#dc2626",
                    color: "white",
                    fontWeight: 600,
                    cursor: eliminando ? "not-allowed" : "pointer",
                  }}
                >
                  {eliminando ? "Eliminando..." : "Sí, eliminar"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}