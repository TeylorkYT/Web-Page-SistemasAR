import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Tabla from "../../components/Tabla";
import { generarReporte, listarTecnicos } from "../../services/reportesService";

const colores = ["#1565c0", "#2e7d32", "#6a1b9a", "#c62828", "#ef6c00", "#00838f"];
const card = { border: "1px solid #ddd", borderRadius: "10px", padding: "16px", background: "white", flex: 1 };
const botonAzul = { padding: "8px 16px", background: "#1d4ed8", color: "white", border: "none", borderRadius: "6px" };

const columnas = [
  { titulo: "Ticket", campo: "id", render: (t) => `#${t.id}` },
  { titulo: "Título", campo: "titulo" },
  { titulo: "Categoría", campo: "categorias" },
  { titulo: "Cliente", campo: "cliente" },
  { titulo: "Técnico", campo: "tecnico" },
  { titulo: "Días", campo: "dias", render: (t) => (t.dias ?? "-") },
];

export default function Reportes() {
  const [tecnicos, setTecnicos] = useState([]);
  const [tipo, setTipo] = useState("tecnico");
  const [idTecnico, setIdTecnico] = useState("todos");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    listarTecnicos().then(setTecnicos);
  }, []);

  async function generar() {
    setResultado(await generarReporte({ idTecnico, desde, hasta }));
  }

  function limpiar() {
    setTipo("tecnico");
    setIdTecnico("todos");
    setDesde("");
    setHasta("");
    setResultado(null);
  }

  const tecnicoElegido = tecnicos.find((t) => String(t.id_usuario) === idTecnico);
  const nombreElegido = tecnicoElegido
    ? `${tecnicoElegido.nombre} ${tecnicoElegido.apellido}`
    : "todos los técnicos";

  const cats = resultado ? Object.entries(resultado.porCategoria) : [];
  const total = cats.reduce((s, [, n]) => s + n, 0);
  let acumulado = 0;
  const trozos = cats.map(([, n], i) => {
    const inicio = (acumulado / total) * 100;
    acumulado += n;
    return `${colores[i % colores.length]} ${inicio}% ${(acumulado / total) * 100}%`;
  });

  return (
    <Layout>
      <h1>Generación de reportes</h1>

      <div style={card}>
        <h3>1. Parámetros del reporte</h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <label style={{ flex: 1 }}>
            Tipo de reporte
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ display: "block", width: "100%", padding: "8px" }}>
              <option value="tecnico">Rendimiento por técnico</option>
              <option value="categoria">Por categoría</option>
              <option value="periodo">Por periodo</option>
            </select>
          </label>
          <label style={{ flex: 1 }}>
            Seleccionar técnico
            <select value={idTecnico} onChange={(e) => setIdTecnico(e.target.value)} style={{ display: "block", width: "100%", padding: "8px" }}>
              <option value="todos">Todos</option>
              {tecnicos.map((t) => (
                <option key={t.id_usuario} value={String(t.id_usuario)}>
                  {t.nombre} {t.apellido}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "12px" }}>
          <label>Rango de fechas</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} style={{ padding: "8px" }} />
          <span>a</span>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} style={{ padding: "8px" }} />
        </div>

        <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
          <button onClick={generar} style={botonAzul}>Generar reporte</button>
          <button onClick={limpiar} style={{ padding: "8px 16px" }}>Limpiar filtros</button>
        </div>
      </div>

      {resultado && (
        <div style={{ marginTop: "20px" }}>
          <h3>2. Resultados del reporte</h3>
          <p>
            Resumen: rendimiento de {nombreElegido}
            {desde || hasta ? ` (${desde || "inicio"} a ${hasta || "hoy"})` : ""}
          </p>

          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            <div style={card}>
              <p>Tickets resueltos</p>
              <h2 style={{ color: "#2e7d32" }}>{resultado.resueltos}</h2>
            </div>
            <div style={card}>
              <p>Tiempo promedio (días)</p>
              <h2 style={{ color: "#6a1b9a" }}>{resultado.tiempoPromedio}</h2>
            </div>
          </div>

          <div style={{ ...card, marginBottom: "16px" }}>
            <p>Tickets por categoría</p>
            {total === 0 ? (
              <p>No hay tickets cerrados en ese rango</p>
            ) : (
              <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                <div
                  style={{
                    width: "140px",
                    height: "140px",
                    borderRadius: "50%",
                    background: `conic-gradient(${trozos.join(", ")})`,
                  }}
                />
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {cats.map(([categoria, n], i) => (
                    <li key={categoria}>
                      <span style={{ color: colores[i % colores.length] }}>■</span> {categoria}: {n}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <h3>Detalle de tickets cerrados</h3>
          <Tabla columnas={columnas} filas={resultado.detalle} mensajeVacio="No hay tickets cerrados en ese rango" />

          <div style={{ marginTop: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
            <button disabled>Exportar a PDF</button>
            <button disabled>Exportar a Excel</button>
            <small>Exportar queda pendiente: requiere backend.</small>
          </div>
        </div>
      )}
    </Layout>
  );
}