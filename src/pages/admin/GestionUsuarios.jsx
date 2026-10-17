import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Tabla from "../../components/Tabla";
import EstadoBadge from "../../components/EstadoBadge";
import { listarUsuarios, crearUsuario, actualizarUsuario } from "../../services/usuariosService";

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
};
const modal = { background: "white", padding: "24px", borderRadius: "12px", width: "380px" };
const campo = { display: "block", width: "100%", padding: "8px", marginBottom: "12px", boxSizing: "border-box" };
const botonAzul = { padding: "8px 16px", background: "#1d4ed8", color: "white", border: "none", borderRadius: "6px" };

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    listarUsuarios().then(setUsuarios);
  }, []);

  const filtrados = usuarios.filter((u) => {
    const texto = `${u.nombre} ${u.apellido} ${u.correo_electronico}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase()) && (filtroRol === "todos" || u.rol === filtroRol);
  });
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  function abrirNuevo() {
    setForm(formVacio);
    setError("");
  }

  function abrirEditar(u) {
    setForm({ ...u, contrasena: "" });
    setError("");
  }

  function cerrar() {
    setForm(null);
    setError("");
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
      if (esNuevo) {
        const nuevo = await crearUsuario({
          ...form,
          rol: form.rol.toLowerCase(),
        });
        setUsuarios([...usuarios, nuevo]);
        setMensaje("Usuario creado correctamente");
      } else {
        const payload = {
          nombre: form.nombre,
          apellido: form.apellido,
          correo_electronico: form.correo_electronico,
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
    { titulo: "Rol", campo: "rol" },
    { titulo: "Estado", campo: "estado", render: (u) => <EstadoBadge estado={u.estado} /> },
    {
      titulo: "",
      campo: "acciones",
      render: (u) => <button onClick={() => abrirEditar(u)} title="Editar">⚙</button>,
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

      {mensaje && <p style={{ color: "#2e7d32" }}>{mensaje}</p>}

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
              <h2>{form.id_usuario ? "Editar usuario" : "Nuevo / editar usuario"}</h2>
              <button onClick={cerrar}>✕</button>
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

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button type="button" onClick={cerrar}>Cancelar</button>
                <button type="submit" style={botonAzul}>Guardar usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}