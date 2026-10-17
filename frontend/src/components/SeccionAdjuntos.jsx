import React, { useEffect, useState, useRef } from "react";
import {
  listarAdjuntos,
  subirAdjunto,
  descargarAdjunto,
} from "../services/ticketsService";
import "./SeccionAdjuntos.css";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "application/pdf"];
const MAX_ADJUNTOS = 3;

function formatearTamano(bytes) {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function SeccionAdjuntos({
  idTicket,
  estadoTicket,
  tituloSeccion = "📎 Evidencias y archivos adjuntos",
}) {
  const [adjuntos, setAdjuntos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [descargandoId, setDescargandoId] = useState(null);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const inputRef = useRef(null);

  const recargar = async () => {
    if (!idTicket) return;
    try {
      const datos = await listarAdjuntos(idTicket);
      setAdjuntos(Array.isArray(datos) ? datos : []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los archivos adjuntos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let cancelado = false;
    async function inicializar() {
      if (!idTicket) {
        setCargando(false);
        return;
      }
      try {
        const datos = await listarAdjuntos(idTicket);
        if (!cancelado) {
          setAdjuntos(Array.isArray(datos) ? datos : []);
        }
      } catch (err) {
        if (!cancelado) {
          setError(err.message || "No se pudieron cargar los archivos adjuntos");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }
    inicializar();
    return () => {
      cancelado = true;
    };
  }, [idTicket]);

  const esTicketCerrado = estadoTicket === "Cerrado";
  const limiteAlcanzado = adjuntos.length >= MAX_ADJUNTOS;
  const puedeSubir = !esTicketCerrado && !limiteAlcanzado;

  const manejarSeleccionArchivo = async (e) => {
    const archivo = e.target.files?.[0];
    // Limpiamos el input para permitir volver a seleccionar el mismo archivo si fue error
    e.target.value = "";
    if (!archivo) return;

    setError("");
    setExito("");

    // Validación de tipo de archivo
    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      setError("Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG o documentos PDF.");
      return;
    }

    // Validación de tamaño máximo (5 MB)
    if (archivo.size > MAX_BYTES) {
      setError(`El archivo supera el tamaño máximo permitido de 5 MB (${formatearTamano(archivo.size)}).`);
      return;
    }

    // Validación de límite por ticket
    if (adjuntos.length >= MAX_ADJUNTOS) {
      setError(`Se ha alcanzado el límite máximo de ${MAX_ADJUNTOS} adjuntos para este ticket.`);
      return;
    }

    setSubiendo(true);
    try {
      await subirAdjunto(idTicket, archivo);
      setExito(`Archivo "${archivo.name}" subido con éxito.`);
      await recargar();
    } catch (err) {
      setError(err.message || "Error al subir el archivo adjunto.");
    } finally {
      setSubiendo(false);
    }
  };

  const manejarDescargar = async (adjunto) => {
    setDescargandoId(adjunto.id_adjunto);
    setError("");
    try {
      await descargarAdjunto(idTicket, adjunto.id_adjunto, adjunto.nombre_archivo);
    } catch (err) {
      setError(err.message || "Error al descargar el archivo.");
    } finally {
      setDescargandoId(null);
    }
  };

  return (
    <div className="seccion-adjuntos-card">
      <div className="seccion-adjuntos-header">
        <div>
          <h2 className="seccion-adjuntos-titulo">{tituloSeccion}</h2>
          <p className="seccion-adjuntos-subtitulo">
            {adjuntos.length} de {MAX_ADJUNTOS} evidencias adjuntas (JPG, PNG, PDF · máx 5 MB)
          </p>
        </div>

        {puedeSubir && (
          <div>
            <input
              ref={inputRef}
              type="file"
              id="input-adjunto"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              style={{ display: "none" }}
              onChange={manejarSeleccionArchivo}
              disabled={subiendo}
            />
            <button
              type="button"
              id="btn-subir-adjunto"
              className="seccion-adjuntos-btn-subir"
              onClick={() => inputRef.current?.click()}
              disabled={subiendo}
            >
              {subiendo ? "Subiendo…" : "+ Adjuntar evidencia"}
            </button>
          </div>
        )}
      </div>

      {esTicketCerrado && (
        <div className="seccion-adjuntos-aviso-cerrado">
          🔒 El ticket está cerrado. No se permite adjuntar nuevos archivos.
        </div>
      )}

      {error && (
        <div id="msg-error-adjuntos" className="seccion-adjuntos-alerta seccion-adjuntos-error">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="seccion-adjuntos-cerrar-alerta">×</button>
        </div>
      )}

      {exito && (
        <div id="msg-exito-adjuntos" className="seccion-adjuntos-alerta seccion-adjuntos-exito">
          <span>{exito}</span>
          <button type="button" onClick={() => setExito("")} className="seccion-adjuntos-cerrar-alerta">×</button>
        </div>
      )}

      {cargando ? (
        <div className="seccion-adjuntos-cargando">Cargando evidencias…</div>
      ) : adjuntos.length === 0 ? (
        <div className="seccion-adjuntos-vacio">
          <p className="seccion-adjuntos-vacio-texto">Sin evidencias adjuntas en este ticket.</p>
          {puedeSubir && (
            <button
              type="button"
              className="seccion-adjuntos-btn-enlace"
              onClick={() => inputRef.current?.click()}
            >
              Subir la primera evidencia
            </button>
          )}
        </div>
      ) : (
        <ul className="seccion-adjuntos-lista">
          {adjuntos.map((adj) => {
            const esPdf = adj.tipo_mime === "application/pdf" || adj.nombre_archivo?.toLowerCase().endsWith(".pdf");
            const esImagen = adj.tipo_mime?.startsWith("image/") || /\.(jpe?g|png)$/i.test(adj.nombre_archivo || "");
            const estaDescargando = descargandoId === adj.id_adjunto;

            return (
              <li key={adj.id_adjunto} className="seccion-adjuntos-item">
                <div className="seccion-adjuntos-item-icono">
                  {esPdf ? "📄" : esImagen ? "🖼️" : "📎"}
                </div>
                <div className="seccion-adjuntos-item-info">
                  <span className="seccion-adjuntos-item-nombre" title={adj.nombre_archivo}>
                    {adj.nombre_archivo}
                  </span>
                  <span className="seccion-adjuntos-item-meta">
                    {formatearTamano(adj.tamano_bytes)}
                    {adj.fecha_subida ? ` · ${adj.fecha_subida}` : ""}
                  </span>
                </div>
                <button
                  type="button"
                  id={`btn-descargar-adjunto-${adj.id_adjunto}`}
                  className="seccion-adjuntos-btn-descargar"
                  onClick={() => manejarDescargar(adj)}
                  disabled={estaDescargando}
                  title="Descargar archivo"
                >
                  {estaDescargando ? "Descargando…" : "⬇ Descargar"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
