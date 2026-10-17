import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { obtenerTicket, comentar } from '../../services/ticketsService';
import SeccionAdjuntos from '../../components/SeccionAdjuntos';
import './DetalleTicketCliente.css';

const COLOR_ESTADO = {
  Abierto:    { bg: '#dbeafe', color: '#1e40af' },
  En_Proceso: { bg: '#fef3c7', color: '#92400e' },
  Resuelto:   { bg: '#d1fae5', color: '#065f46' },
  Cerrado:    { bg: '#f1f5f9', color: '#475569' }
};

const COLOR_PRIORIDAD = {
  Critica: '#ef4444',
  Alta:    '#f59e0b',
  Media:   '#0284c7',
  Baja:    '#64748b'
};

function formatearFecha(fechaStr) {
  if (!fechaStr) return '—';
  try {
    const d = new Date(fechaStr);
    return isNaN(d.getTime())
      ? fechaStr
      : d.toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
  } catch {
    return fechaStr;
  }
}

export default function DetalleTicketCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sesion } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [errorComentario, setErrorComentario] = useState('');

  const cargarTicket = async () => {
    try {
      const data = await obtenerTicket(id);
      setTicket(data);
    } catch {
      setTicket(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTicket();
  }, [id]);

  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    setErrorComentario('');
    setEnviandoComentario(true);
    try {
      await comentar(ticket.id_ticket, {
        contenido: nuevoComentario.trim(),
        es_nota_interna: false
      });
      setNuevoComentario('');
      await cargarTicket();
    } catch (err) {
      setErrorComentario(err.message || 'No se pudo enviar el comentario');
    } finally {
      setEnviandoComentario(false);
    }
  };

  if (cargando) {
    return (
      <Layout rol="cliente" itemActivo="mis-tickets" nombreUsuario={sesion?.nombre}>
        <p className="detalle-ticket-mensaje">Cargando ticket…</p>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout rol="cliente" itemActivo="mis-tickets" nombreUsuario={sesion?.nombre}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p className="detalle-ticket-mensaje" style={{ color: '#dc2626' }}>Ticket no encontrado o no tienes permisos para visualizarlo.</p>
          <button
            className="detalle-ticket-btn-volver"
            onClick={() => navigate('/cliente/tickets')}
          >
            ← Volver a Mis Tickets
          </button>
        </div>
      </Layout>
    );
  }

  const colorEstado = COLOR_ESTADO[ticket.estado] || {};
  const colorPrioridad = COLOR_PRIORIDAD[ticket.prioridad] || '#64748b';
  const puedeCalificar = ticket.estado === 'Resuelto';
  const yaCalificado = Boolean(ticket.calificacion);

  return (
    <Layout rol="cliente" itemActivo="mis-tickets" nombreUsuario={sesion?.nombre}>
      {/* Cabecera */}
      <div className="detalle-ticket-cabecera">
        <button
          id="btn-volver-tickets"
          className="detalle-ticket-btn-volver"
          onClick={() => navigate('/cliente/tickets')}
        >
          ← Mis tickets
        </button>
        <div className="detalle-ticket-cabecera-derecha">
          <span
            className="detalle-ticket-badge"
            style={{ background: colorEstado.bg, color: colorEstado.color }}
          >
            {ticket.estado === 'En_Proceso' ? 'En proceso' : ticket.estado}
          </span>
          {puedeCalificar && !yaCalificado && (
            <button
              id="btn-calificar"
              className="detalle-ticket-btn-calificar"
              onClick={() => navigate(`/cliente/tickets/${ticket.id_ticket}/calificar`)}
            >
              ★ Calificar atención
            </button>
          )}
        </div>
      </div>

      <h1 className="detalle-ticket-titulo">{ticket.titulo}</h1>

      {/* Información principal */}
      <div className="detalle-ticket-grid">
        <div className="detalle-ticket-tarjeta detalle-ticket-info">
          <h2 className="detalle-ticket-seccion">Detalles del ticket</h2>
          <dl className="detalle-ticket-dl">
            <dt>ID</dt>
            <dd>#{ticket.id_ticket}</dd>
            <dt>Fecha de creación</dt>
            <dd>{formatearFecha(ticket.fecha_creacion)}</dd>
            {ticket.fecha_resolucion && (
              <>
                <dt>Fecha de resolución</dt>
                <dd>{formatearFecha(ticket.fecha_resolucion)}</dd>
              </>
            )}
            <dt>Prioridad</dt>
            <dd>
              <span
                className="detalle-ticket-prioridad"
                style={{ color: colorPrioridad }}
              >
                ● {ticket.prioridad}
              </span>
            </dd>
            <dt>Categorías</dt>
            <dd>{(ticket.categorias || []).join(', ') || '—'}</dd>
            <dt>Modalidad</dt>
            <dd>{ticket.modalidad || 'Presencial'}</dd>
            <dt>Técnico asignado</dt>
            <dd>{ticket.tecnico_nombre || 'Pendiente de asignación'}</dd>
            <dt>Equipo asociado</dt>
            <dd>{ticket.equipo || 'Sin equipo específico'}</dd>
          </dl>

          <h2 className="detalle-ticket-seccion" style={{ marginTop: 20 }}>Descripción</h2>
          <p className="detalle-ticket-descripcion">{ticket.descripcion}</p>

          <SeccionAdjuntos
            idTicket={ticket.id_ticket}
            estadoTicket={ticket.estado}
          />

          {/* Calificación ya enviada */}
          {ticket.calificacion && (
            <div style={{ marginTop: 24, padding: 16, borderRadius: 8, background: '#fefce8', border: '1px solid #fef08a' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#854d0e', display: 'flex', alignItems: 'center', gap: 6 }}>
                ★ Calificación registrada
              </h3>
              <p style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#eab308' }}>
                {'★'.repeat(ticket.calificacion.puntuacion || 0)}{'☆'.repeat(5 - (ticket.calificacion.puntuacion || 0))}
              </p>
              {ticket.calificacion.comentario && (
                <p style={{ margin: 0, fontSize: '14px', color: '#713f12', fontStyle: 'italic' }}>
                  "{ticket.calificacion.comentario}"
                </p>
              )}
            </div>
          )}

          {/* Informe de cierre del técnico */}
          {ticket.reporte && (
            <div style={{ marginTop: 24, padding: 16, borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#166534' }}>
                ✔ Solución aplicada por el técnico
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#14532d', lineHeight: 1.5 }}>
                {ticket.reporte.solucion_aplicada}
              </p>
            </div>
          )}
        </div>

        {/* Columna Derecha: Historial y Comentarios */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Historial */}
          <div className="detalle-ticket-tarjeta detalle-ticket-historial">
            <h2 className="detalle-ticket-seccion">Historial de cambios</h2>
            {(!ticket.historial || ticket.historial.length === 0) ? (
              <p className="detalle-ticket-vacio">Sin historial registrado.</p>
            ) : (
              <ol className="detalle-ticket-timeline">
                {ticket.historial.map((h) => (
                  <li key={h.id_historial} className="detalle-ticket-timeline-item">
                    <div className="detalle-ticket-timeline-punto" />
                    <div className="detalle-ticket-timeline-contenido">
                      <p className="detalle-ticket-timeline-accion">
                        <strong>{h.tipo_accion}</strong>
                        {h.estado_nuevo && (
                          <span className="detalle-ticket-timeline-estado">
                            → {h.estado_nuevo === 'En_Proceso' ? 'En proceso' : h.estado_nuevo}
                          </span>
                        )}
                      </p>
                      <p className="detalle-ticket-timeline-detalle">{h.detalles}</p>
                      <p className="detalle-ticket-timeline-meta">
                        {h.nombre_usuario} · {formatearFecha(h.fecha_accion)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Comentarios con el técnico */}
          <div className="detalle-ticket-tarjeta">
            <h2 className="detalle-ticket-seccion">Mensajes y Comentarios</h2>
            {(!ticket.comentarios || ticket.comentarios.length === 0) ? (
              <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', margin: '14px 0' }}>
                No hay comentarios aún en este ticket.
              </p>
            ) : (
              <div className="detalle-ticket-comentarios-lista">
                {ticket.comentarios.map((c) => (
                  <div key={c.id_comentario} className="detalle-ticket-comentario-item">
                    <div className="detalle-ticket-comentario-header">
                      <span className="detalle-ticket-comentario-autor">
                        {c.autor || c.usuario_nombre} ({c.rolAutor || c.rol})
                      </span>
                      <span className="detalle-ticket-comentario-fecha">
                        {formatearFecha(c.fecha_creacion)}
                      </span>
                    </div>
                    <p className="detalle-ticket-comentario-texto">{c.contenido}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario para agregar comentario */}
            {ticket.estado !== 'Cerrado' && (
              <form onSubmit={handleEnviarComentario} className="detalle-ticket-form-comentario">
                <textarea
                  className="detalle-ticket-textarea-comentario"
                  rows={3}
                  placeholder="Escribe un mensaje o consulta sobre este ticket…"
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  disabled={enviandoComentario}
                />
                {errorComentario && (
                  <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{errorComentario}</p>
                )}
                <button
                  type="submit"
                  className="detalle-ticket-btn-enviar-comentario"
                  disabled={enviandoComentario || !nuevoComentario.trim()}
                >
                  {enviandoComentario ? 'Enviando…' : 'Enviar mensaje'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

