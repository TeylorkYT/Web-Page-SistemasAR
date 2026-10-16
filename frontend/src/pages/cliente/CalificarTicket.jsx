import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { calificarTicket } from '../../services/ticketsService';
import './CalificarTicket.css';

export default function CalificarTicket() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [puntuacion, setPuntuacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');

  const volverAlDetalle = () => navigate(`/cliente/tickets/${id}`);

  // Omitir: cierra sin requerir puntuación
  const handleOmitir = () => {
    navigate(`/cliente/tickets/${id}`);
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    setError('');

    if (puntuacion === 0) {
      setError('Selecciona una puntuación antes de enviar.');
      return;
    }

    setEnviando(true);
    try {
      await calificarTicket({
        id_ticket: Number(id),
        puntuacion,
        comentario: comentario.trim()
      });
      setExito('¡Gracias por tu calificación! Redirigiendo…');
      setTimeout(() => navigate('/cliente/tickets'), 1800);
    } catch {
      setError('No se pudo enviar la calificación. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const estrellaActiva = hover || puntuacion;

  return (
    <Layout>
      <div className="calificar-cabecera">
        <button
          id="btn-volver-detalle"
          className="calificar-btn-volver"
          onClick={volverAlDetalle}
        >
          ← Volver al ticket
        </button>
      </div>

      <div className="calificar-tarjeta">
        <h1 className="calificar-titulo">Calificar atención</h1>
        <p className="calificar-subtitulo">
          Ticket <strong>#{id}</strong> · Tu opinión nos ayuda a mejorar.
        </p>

        {/* Aviso: calificación opcional */}
        <p className="calificar-aviso">
          La calificación es <strong>opcional</strong>. Puedes omitirla si lo prefieres.
        </p>

        <form id="form-calificar" onSubmit={handleEnviar} noValidate>
          {/* Estrellas */}
          <div className="calificar-campo">
            <label className="calificar-label">Puntuación</label>
            <div
              className="calificar-estrellas"
              role="radiogroup"
              aria-label="Puntuación de 1 a 5 estrellas"
              onMouseLeave={() => setHover(0)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  id={`estrella-${n}`}
                  type="button"
                  className={`calificar-estrella${n <= estrellaActiva ? ' activa' : ''}`}
                  aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
                  onClick={() => setPuntuacion(n)}
                  onMouseEnter={() => setHover(n)}
                >
                  ★
                </button>
              ))}
            </div>
            {puntuacion > 0 && (
              <p className="calificar-puntuacion-texto">
                {['', 'Muy malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'][puntuacion]}
              </p>
            )}
          </div>

          {/* Comentario (opcional) */}
          <div className="calificar-campo">
            <label htmlFor="campo-comentario" className="calificar-label">
              Comentario <span className="calificar-opcional">(opcional)</span>
            </label>
            <textarea
              id="campo-comentario"
              className="calificar-textarea"
              rows={4}
              placeholder="Cuéntanos cómo fue tu experiencia…"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>

          {/* Mensajes */}
          {error && <p id="msg-error-calificar" className="calificar-error">{error}</p>}
          {exito && <p id="msg-exito-calificar" className="calificar-exito">{exito}</p>}

          {/* Acciones */}
          <div className="calificar-acciones">
            <button
              type="button"
              id="btn-omitir-calificacion"
              className="calificar-btn-omitir"
              onClick={handleOmitir}
            >
              Omitir calificación
            </button>
            <button
              type="submit"
              id="btn-enviar-calificacion"
              className="calificar-btn-enviar"
              disabled={enviando}
            >
              {enviando ? 'Enviando…' : 'Enviar calificación'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}