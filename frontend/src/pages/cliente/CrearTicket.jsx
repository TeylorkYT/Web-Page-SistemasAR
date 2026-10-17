import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { crearTicket, listarCategorias, subirAdjunto } from '../../services/ticketsService';
import './CrearTicket.css';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_ADJUNTOS = 3;

function formatearTamano(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function CrearTicket() {
  const navigate = useNavigate();
  const inputArchivoRef = useRef(null);

  const [categorias, setCategorias] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [archivos, setArchivos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [progresoTexto, setProgresoTexto] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => {
    listarCategorias().then(setCategorias);
  }, []);

  const toggleCategoria = (id) => {
    setCategoriasSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const manejarSeleccionArchivos = (e) => {
    const seleccionados = Array.from(e.target.files || []);
    e.target.value = '';
    setError('');

    if (archivos.length + seleccionados.length > MAX_ADJUNTOS) {
      setError(`Solo puedes adjuntar un máximo de ${MAX_ADJUNTOS} archivos por ticket.`);
      return;
    }

    const validos = [];
    for (const archivo of seleccionados) {
      if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
        setError(`El archivo "${archivo.name}" tiene un formato no permitido. Usa JPG, PNG o PDF.`);
        return;
      }
      if (archivo.size > MAX_BYTES) {
        setError(`El archivo "${archivo.name}" supera el límite de 5 MB (${formatearTamano(archivo.size)}).`);
        return;
      }
      validos.push(archivo);
    }

    setArchivos((prev) => [...prev, ...validos]);
  };

  const quitarArchivo = (indice) => {
    setArchivos((prev) => prev.filter((_, idx) => idx !== indice));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    setProgresoTexto('');

    if (!titulo.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    if (!descripcion.trim()) {
      setError('La descripción es obligatoria.');
      return;
    }
    if (categoriasSeleccionadas.length === 0) {
      setError('Selecciona al menos una categoría.');
      return;
    }

    setEnviando(true);
    try {
      setProgresoTexto('Registrando ticket…');
      const ticketCreado = await crearTicket({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categorias_ids: categoriasSeleccionadas,
        id_equipo: null
      });

      if (archivos.length > 0) {
        let subidos = 0;
        const erroresSubida = [];

        for (let i = 0; i < archivos.length; i++) {
          const arch = archivos[i];
          setProgresoTexto(`Subiendo evidencia ${i + 1} de ${archivos.length}: ${arch.name}…`);
          try {
            await subirAdjunto(ticketCreado.id_ticket, arch);
            subidos++;
          } catch (err) {
            erroresSubida.push(`${arch.name} (${err.message})`);
          }
        }

        if (erroresSubida.length > 0) {
          setExito(`Ticket creado (#${ticketCreado.id_ticket}) con ${subidos} evidencia(s). Advertencia: algunos archivos no se pudieron subir: ${erroresSubida.join(', ')}.`);
        } else {
          setExito(`Ticket #${ticketCreado.id_ticket} creado exitosamente con todas sus evidencias. Redirigiendo…`);
        }
      } else {
        setExito(`Ticket #${ticketCreado.id_ticket} creado con éxito. Redirigiendo…`);
      }

      setTimeout(() => navigate('/cliente/tickets'), 1800);
    } catch (err) {
      setError(err.message || 'No se pudo crear el ticket. Intenta de nuevo.');
    } finally {
      setEnviando(false);
      setProgresoTexto('');
    }
  };

  return (
    <Layout>
      <h1 className="crear-ticket-titulo">Crear nuevo ticket</h1>

      <div className="crear-ticket-tarjeta">
        <form id="form-crear-ticket" onSubmit={handleSubmit} noValidate>

          {/* Título */}
          <div className="crear-ticket-campo">
            <label htmlFor="campo-titulo" className="crear-ticket-label">
              Título <span className="crear-ticket-requerido">*</span>
            </label>
            <input
              id="campo-titulo"
              type="text"
              className="crear-ticket-input"
              placeholder="Describe brevemente el problema"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={120}
            />
          </div>

          {/* Descripción */}
          <div className="crear-ticket-campo">
            <label htmlFor="campo-descripcion" className="crear-ticket-label">
              Descripción <span className="crear-ticket-requerido">*</span>
            </label>
            <textarea
              id="campo-descripcion"
              className="crear-ticket-textarea"
              placeholder="Explica el problema con el mayor detalle posible"
              rows={5}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          {/* Categorías — selección múltiple */}
          <div className="crear-ticket-campo">
            <label className="crear-ticket-label">
              Categorías <span className="crear-ticket-requerido">*</span>
              <span className="crear-ticket-ayuda"> (puedes elegir varias)</span>
            </label>
            <div className="crear-ticket-categorias">
              {categorias.map((cat) => {
                const seleccionada = categoriasSeleccionadas.includes(cat.id_categoria);
                return (
                  <label
                    key={cat.id_categoria}
                    className={`crear-ticket-cat-chip${seleccionada ? ' seleccionada' : ''}`}
                  >
                    <input
                      id={`cat-${cat.id_categoria}`}
                      type="checkbox"
                      checked={seleccionada}
                      onChange={() => toggleCategoria(cat.id_categoria)}
                      className="crear-ticket-cat-checkbox"
                    />
                    {cat.nombre_categoria}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Evidencias / Adjuntos */}
          <div className="crear-ticket-campo">
            <div className="crear-ticket-adjuntos-header">
              <label className="crear-ticket-label">
                Archivos adjuntos de evidencia <span className="crear-ticket-ayuda">(opcional, máx. 3 archivos)</span>
              </label>
              <span className="crear-ticket-contador-adjuntos">
                {archivos.length} / {MAX_ADJUNTOS}
              </span>
            </div>

            <input
              ref={inputArchivoRef}
              type="file"
              id="input-archivos-crear"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              multiple
              style={{ display: 'none' }}
              onChange={manejarSeleccionArchivos}
              disabled={enviando || archivos.length >= MAX_ADJUNTOS}
            />

            {archivos.length < MAX_ADJUNTOS && (
              <button
                type="button"
                id="btn-agregar-adjuntos"
                className="crear-ticket-btn-adjuntar"
                onClick={() => inputArchivoRef.current?.click()}
                disabled={enviando}
              >
                📎 Seleccionar imágenes o PDFs (máx. 5 MB c/u)
              </button>
            )}

            {archivos.length > 0 && (
              <ul className="crear-ticket-lista-adjuntos">
                {archivos.map((arch, idx) => (
                  <li key={`${arch.name}-${idx}`} className="crear-ticket-item-adjunto">
                    <span className="crear-ticket-nombre-adjunto">
                      {arch.type.includes('pdf') ? '📄' : '🖼️'} {arch.name} ({formatearTamano(arch.size)})
                    </span>
                    <button
                      type="button"
                      className="crear-ticket-btn-quitar-adjunto"
                      onClick={() => quitarArchivo(idx)}
                      disabled={enviando}
                      title="Quitar archivo"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Mensajes */}
          {progresoTexto && <p className="crear-ticket-progreso">{progresoTexto}</p>}
          {error && <p id="msg-error-crear" className="crear-ticket-error">{error}</p>}
          {exito && <p id="msg-exito-crear" className="crear-ticket-exito">{exito}</p>}

          {/* Botones */}
          <div className="crear-ticket-acciones">
            <button
              type="button"
              id="btn-cancelar-ticket"
              className="crear-ticket-btn-secundario"
              onClick={() => navigate('/cliente/tickets')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-enviar-ticket"
              className="crear-ticket-btn-primario"
              disabled={enviando}
            >
              {enviando ? 'Enviando…' : 'Crear ticket'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}