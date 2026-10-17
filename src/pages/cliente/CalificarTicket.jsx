import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { calificarTicket, obtenerTicket } from '../../services/ticketsService';
import './CalificarTicket.css';

export default function CalificarTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sesion } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [puntuacion, setPuntuacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerTicket(id)
      .then(setTicket)
      .catch(() => setTicket(null))
      .finally(() => setCargando(false));
  }, [id]);

  const volverAlDetalle = () => navigate(`/cliente/tickets/${id}`);
  const handleOmitir = () => navigate(`/cliente/tickets/${id}`);

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
    } catch (err) {
      setError(err.message || 'No se pudo enviar la calificación. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const estrellaActiva = hover || puntuacion;

  if (cargando) {
    return (
      <Layout rol="cliente" itemActivo="mis-tickets" nombreUsuario={sesion?.nombre}>
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
          Cargando información del ticket…
        </div>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout rol="cliente" itemActivo="mis-tickets" nombreUsuario={sesion?.nombre}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: '#dc2626', fontSize: '16px', fontWeight: 'bold' }}>Ticket no encontrado.</p>
          <button className="calificar-btn-volver" onClick={() => navigate('/cliente/tickets')}>
            ← Mis tickets
          </button>
        </div>
      </Layout>
    );
  }

  // Si ya tiene una calificación registrada
  if (ticket.calificacion) {
    return (
      <Layout rol="cliente" itemActivo="mis-tickets" nombreUsuario={sesion?.nombre}>
        <div className="calificar-cabecera">
          <button id="btn-volver-detalle" className="calificar-btn-volver" onClick={volverAlDetalle}>
            ← Volver al ticket
          </button>
        </div>
        <div className="calificar-tarjeta" style={{ textAlign: 'center' }}>
          <h1 className="calificar-titulo">Ticket ya calificado</h1>
          <p className="calificar-subtitulo">
            Ticket <strong>#{ticket.id_ticket}</strong> · Ya has enviado tu opinión sobre esta atención.
          </p>
          <div style={{ margin: '24px 0', padding: '20px', background: '#fefce8', borderRadius: '10px', border: '1px solid #fef08a' }}>
            <div style={{ fontSize: '28px', color: '#eab308', marginBottom: '8px' }}>
              {'★'.repeat(ticket.calificacion.puntuacion || 0)}{'☆'.repeat(5 - (ticket.calificacion.puntuacion || 0))}
            </div>
            {ticket.calificacion.comentario && (
              <p style={{ fontStyle: 'italic', color: '#713f12', margin: 0 }}>
                "{ticket.calificacion.comentario}"
              </p>
            )}
          </div>
          <button
            type="button"
            className="calificar-btn-volver"
            style={{ display: 'inline-block' }}
            onClick={() => navigate('/cliente/tickets')}
          >
            Volver al listado de tickets
          </button>
        </div>
      </Layout>
    );
  }

  // Si no está en estado Resuelto (ni Cerrado)
  if (ticket.estado !== 'Resuelto' && ticket.estado !== 'Cerrado') {
    return (
      <Layout rol="cliente" itemActivo="mis-tickets" nombreUsuario={sesion?.nombre}>
        <div className="calificar-cabecera">
          <button id="btn-volver-detalle" className="calificar-btn-volver" onClick={volverAlDetalle}>
            ← Volver al ticket
          </button>
        </div>
        <div className="calificar-tarjeta" style={{ textAlign: 'center' }}>
          <h1 className="calificar-titulo" style={{ color: '#0369a1' }}>Atención en curso</h1>
          <p style={{ color: '#475569', fontSize: '15px', lineHeight: 1.6, margin: '16px 0 24px' }}>
            Este ticket se encuentra actualmente en estado <strong>{ticket.estado.replace('_', ' ')}</strong>.<br />
            Solo podrás calificar el servicio una vez que el técnico haya aplicado la solución y el ticket pase a estado <strong>Resuelto</strong>.
          </p>
          <button
            type="button"
            className="calificar-btn-volver"
            style={{ display: 'inline-block' }}
            onClick={volverAlDetalle}
          >
            ← Volver a los detalles del ticket
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout rol="cliente" itemActivo="mis-tickets" nombreUsuario={sesion?.nombre}>
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
