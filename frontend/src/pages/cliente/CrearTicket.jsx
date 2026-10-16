import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { crearTicket, listarCategorias } from '../../services/ticketsService';
import './CrearTicket.css';

export default function CrearTicket() {
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [enviando, setEnviando] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

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
      await crearTicket({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categorias_ids: categoriasSeleccionadas,
        id_equipo: null
      });
      setExito('Ticket creado con éxito. Redirigiendo…');
      setTimeout(() => navigate('/cliente/tickets'), 1500);
    } catch {
      setError('No se pudo crear el ticket. Intenta de nuevo.');
    } finally {
      setEnviando(false);
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

          {/* Mensajes */}
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