import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Tabla from "../../components/Tabla";
import EstadoBadge from "../../components/EstadoBadge";
import { listarInventario } from "../../services/inventarioService";

const STOCK_MINIMO = 2; // No existe en los datos. Cámbialo aquí si quieres otro umbral.
const motivos = ["Daño irreparable", "Obsoleto", "Extravío", "Otro"];
const formVacio = {
  codigo: "",
  nombre: "",
  tipo: "",
  stock: 0,
  ubicacion: "",
  descripcion: "",
  estado: "Disponible",
};

const overlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
  display: "flex", alignItems: "center", justifyContent: "center",
};
const modal = { background: "white", padding: "24px", borderRadius: "12px", width: "380px" };
const campo = { display: "block", width: "100%", padding: "8px", marginBottom: "12px", boxSizing: "border-box" };
const botonAzul = { padding: "8px 16px", background: "#1d4ed8", color: "white", border: "none", borderRadius: "6px" };

export default function GestionInventario() {
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [baja, setBaja] = useState(null);
  const [motivo, setMotivo] = useState(motivos[0]);
  const [observaciones, setObservaciones] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    listarInventario().then(setItems);
  }, []);

  const tipos = [...new Set(items.map((i) => i.tipo))];

  const filtrados = items.filter(
    (i) =>
      (i.codigo + " " + i.nombre).toLowerCase().includes(busqueda.toLowerCase()) &&
      (filtroTipo === "todos" || i.tipo === filtroTipo) &&
      (filtroEstado === "todos" || i.estado === filtroEstado)
  );

  function abrirNuevo() {
    setForm(formVacio);
    setError("");
  }

  function abrirEditar(i) {
    setForm({ ...i });
    setError("");
  }

  function guardar(e) {
    e.preventDefault();
    if (!form.codigo.trim() || !form.nombre.trim() || !form.tipo.trim()) {
      setError("Código, nombre y tipo son obligatorios");
      return;
    }

    const datos = { ...form, stock: Number(form.stock) };
    if (form.id_inventario) {
      setItems(items.map((i) => (i.id_inventario === form.id_inventario ? datos : i)));
      setMensaje("Artículo actualizado correctamente");
    } else {
      const nuevoId = Math.max(0, ...items.map((i) => i.id_inventario)) + 1;
      setItems([...items, { ...datos, id_inventario: nuevoId }]);
      setMensaje("Artículo creado correctamente");
    }
    setForm(null);
    setError("");
  }

  function confirmarBaja() {
    setItems(
      items.map((i) => (i.id_inventario === baja.id_inventario ? { ...i, estado: "De_Baja" } : i))
    );
    setMensaje(
      `Dado de baja: ${baja.nombre} (${motivo}${observaciones ? ": " + observaciones : ""})`
    );
    setBaja(null);
    setMotivo(motivos[0]);
    setObservaciones("");
  }

  const columnas = [
    { titulo: "Código", campo: "codigo" },
    { titulo: "Artículo", campo: "nombre" },
    { titulo: "Tipo", campo: "tipo" },
    {
      titulo: "Stock",
      campo: "stock",
      render: (i) => (
        <>
          {i.stock <= STOCK_MINIMO && i.estado !== "De_Baja" && (
            <span style={{ color: "#c62828" }}>⚠ </span>
          )}
          {i.stock}
        </>
      ),
    },
    { titulo: "Estado", campo: "estado", render: (i) => <EstadoBadge estado={i.estado} /> },
    {
      titulo: "Acciones",
      campo: "acciones",
      render: (i) => (
        <>
          <button onClick={() => abrirEditar(i)} title="Editar">⚙</button>{" "}
          <button disabled={i.estado === "De_Baja"} onClick={() => setBaja(i)}>
            Dar de baja
          </button>
        </>
      ),
    },
  ];

  return (
    <Layout>
      <h1>Gestión de inventario (repuestos y equipos)</h1>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
        <input
          placeholder="Buscar por código o nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 1, padding: "8px" }}
        />
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} style={{ padding: "8px" }}>
          <option value="todos">Filtro: tipo</option>
          {tipos.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ padding: "8px" }}>
          <option value="todos">Filtro: estado</option>
          <option value="Disponible">Disponible</option>
          <option value="Agotado">Agotado</option>
          <option value="De_Baja">De baja</option>
        </select>
        <button onClick={abrirNuevo} style={botonAzul}>+ Nuevo artículo</button>
      </div>

      {mensaje && <p style={{ color: "#2e7d32" }}>{mensaje}</p>}

      <h3>Catálogo de inventario</h3>
      <Tabla columnas={columnas} filas={filtrados} mensajeVacio="No hay artículos con ese filtro" />

      {form && (
        <div style={overlay}>
          <div style={modal}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h2>{form.id_inventario ? "Editar artículo" : "Artículo"}</h2>
              <button onClick={() => setForm(null)}>✕</button>
            </div>
            <form onSubmit={guardar}>
              <label>Código (SKU)</label>
              <input style={campo} value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />

              <label>Nombre</label>
              <input style={campo} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />

              <label>Tipo de artículo</label>
              <input style={campo} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} />

              <label>Stock actual</label>
              <input
                style={campo}
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />

              <label>Ubicación</label>
              <input style={campo} value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} />

              <label>Descripción</label>
              <textarea
                style={{ ...campo, height: "60px" }}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />

              <label>Estado</label>
              <select style={campo} value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                <option value="Disponible">Disponible</option>
                <option value="Agotado">Agotado</option>
                <option value="De_Baja">De baja</option>
              </select>

              {error && <p style={{ color: "red" }}>{error}</p>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button type="button" onClick={() => setForm(null)}>Cancelar</button>
                <button type="submit" style={botonAzul}>Guardar artículo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {baja && (
        <div style={overlay}>
          <div style={modal}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h2>Dar de baja</h2>
              <button onClick={() => setBaja(null)}>✕</button>
            </div>
            <p>
              Estás a punto de dar de baja: <b>{baja.nombre} (código: {baja.codigo})</b>
            </p>
            <p>Motivo de la baja</p>
            {motivos.map((m) => (
              <label key={m} style={{ display: "block" }}>
                <input type="radio" name="motivo" checked={motivo === m} onChange={() => setMotivo(m)} /> {m}
              </label>
            ))}
            <p>Observaciones</p>
            <textarea
              style={{ ...campo, height: "70px" }}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button onClick={() => setBaja(null)}>Cancelar</button>
              <button onClick={confirmarBaja} style={botonAzul}>Confirmar baja</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}