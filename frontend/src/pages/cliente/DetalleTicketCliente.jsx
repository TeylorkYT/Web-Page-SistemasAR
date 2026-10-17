import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
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

export default function DetalleTicketCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [errorComentario, setErrorComentario] = useState('');

  useEffect(() => {
    obtenerTicket(id)
      .then(setTicket)
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return <Layout><p className="detalle-ticket-mensaje">Cargando ticket…</p></Layout>;
  }

  if (!ticket) {
    return <Layout><p className="detalle-ticket-mensaje">Ticket no encontrado.</p></Layout>;
  }

  const colorEstado = COLOR_ESTADO[ticket.estado] || {};
  const colorPrioridad = COLOR_PRIORIDAD[ticket.prioridad] || '#64748b';
  const puedeCalificar = ticket.estado === 'Resuelto' || ticket.estado === 'Cerrado';

  const manejarEnviarComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    setEnviandoComentario(true);
    setErrorComentario('');
    try {
      const creado = await comentar(ticket.id_ticket, {
        contenido: nuevoComentario.trim(),
        es_nota_interna: false,
      });

      setTicket((prev) => ({
        ...prev,
        comentarios: [
          ...(prev.comentarios || []),
          {
            ...creado,
            autor: creado.usuario_nombre || 'Tú',
            rolAutor: creado.rol || 'cliente',
          },
        ],
      }));
      setNuevoComentario('');
    } catch (err) {
      setErrorComentario(err.message || 'Error al enviar el comentario.');
    } finally {
      setEnviandoComentario(false);
    }
  };

  return (
    <Layout>
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
          {puedeCalificar && (
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

      {/* Información principal e Historial */}
      <div className="detalle-ticket-grid">
        <div className="detalle-ticket-tarjeta detalle-ticket-info">
          <h2 className="detalle-ticket-seccion">Detalles del ticket</h2>
          <dl className="detalle-ticket-dl">
            <dt>ID</dt>
            <dd>#{ticket.id_ticket}</dd>
            <dt>Fecha de creación</dt>
            <dd>{ticket.fecha_creacion}</dd>
            {ticket.fecha_resolucion && (
              <>
                <dt>Fecha de resolución</dt>
                <dd>{ticket.fecha_resolucion}</dd>
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
          </dl>

          <h2 className="detalle-ticket-seccion" style={{ marginTop: 20 }}>Descripción</h2>
          <p className="detalle-ticket-descripcion">{ticket.descripcion}</p>

          <SeccionAdjuntos
            idTicket={ticket.id_ticket}
            estadoTicket={ticket.estado}
          />
        </div>

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
                      {h.nombre_usuario} · {h.fecha_accion}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Sección de Comentarios y Mensajes */}
      <div className="detalle-ticket-tarjeta detalle-ticket-comentarios" style={{ marginTop: 24 }}>
        <h2 className="detalle-ticket-seccion">Comentarios y Mensajes con Soporte</h2>

        <div className="detalle-ticket-lista-comentarios">
          {(!ticket.comentarios || ticket.comentarios.length === 0) ? (
            <p className="detalle-ticket-vacio">No hay mensajes en este ticket aún.</p>
          ) : (
            <div className="detalle-comentarios-items">
              {ticket.comentarios.map((c, idx) => (
                <div key={c.id_comentario || idx} className="detalle-comentario-item">
                  <div className="detalle-comentario-cabecera">
                    <span className="detalle-comentario-autor">{c.autor || c.usuario_nombre}</span>
                    <span className="detalle-comentario-rol">({c.rolAutor || c.rol})</span>
                    <span className="detalle-comentario-fecha">{c.fecha_creacion}</span>
                  </div>
                  <p className="detalle-comentario-contenido">{c.contenido}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {ticket.estado === 'Cerrado' ? (
          <p className="detalle-ticket-mensaje-cerrado">
            Este ticket está cerrado, por lo que ya no admite nuevos comentarios.
          </p>
        ) : (
          <form className="detalle-comentario-form" onSubmit={manejarEnviarComentario}>
            <textarea
              className="detalle-comentario-textarea"
              placeholder="Escribe un mensaje o responde al equipo de soporte técnico…"
              rows={3}
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              disabled={enviandoComentario}
            />
            {errorComentario && <p className="detalle-comentario-error">{errorComentario}</p>}
            <button
              type="submit"
              className="detalle-comentario-btn-enviar"
              disabled={enviandoComentario || !nuevoComentario.trim()}
            >
              {enviandoComentario ? 'Enviando…' : 'Enviar mensaje'}
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}