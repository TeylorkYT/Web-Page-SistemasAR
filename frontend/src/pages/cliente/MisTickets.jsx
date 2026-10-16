import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { listarTickets } from '../../services/ticketsService';
import './MisTickets.css';

const ESTADOS = ['Todos', 'Abierto', 'En_Proceso', 'Resuelto', 'Cerrado'];

const COLOR_ESTADO = {
  Abierto:    { bg: '#dbeafe', color: '#1e40af' },
  En_Proceso: { bg: '#fef3c7', color: '#92400e' },
  Resuelto:   { bg: '#d1fae5', color: '#065f46' },
  Cerrado:    { bg: '#f1f5f9', color: '#475569' }
};

export default function MisTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filtro, setFiltro] = useState('Todos');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    listarTickets()
      .then(setTickets)
      .finally(() => setCargando(false));
  }, []);

  const lista = filtro === 'Todos'
    ? tickets
    : tickets.filter((t) => t.estado === filtro);

  return (
    <Layout>
      <div className="mis-tickets-cabecera">
        <h1 className="mis-tickets-titulo">Mis Tickets</h1>
        <button
          id="btn-nuevo-ticket"
          className="mis-tickets-btn-nuevo"
          onClick={() => navigate('/cliente/tickets/nuevo')}
        >
          + Nuevo ticket
        </button>
      </div>

      {/* Filtro por estado */}
      <div className="mis-tickets-filtros" role="group" aria-label="Filtrar por estado">
        {ESTADOS.map((e) => (
          <button
            key={e}
            id={`filtro-${e.toLowerCase()}`}
            className={`mis-tickets-filtro-btn${filtro === e ? ' activo' : ''}`}
            onClick={() => setFiltro(e)}
          >
            {e === 'En_Proceso' ? 'En proceso' : e}
          </button>
        ))}
      </div>

      {/* Tabla de resultados */}
      {cargando ? (
        <p className="mis-tickets-vacio">Cargando tickets…</p>
      ) : lista.length === 0 ? (
        <p className="mis-tickets-vacio">No hay tickets con ese estado.</p>
      ) : (
        <div className="mis-tickets-tabla-contenedor">
          <table className="mis-tickets-tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Título</th>
                <th>Categorías</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((t) => {
                const estilo = COLOR_ESTADO[t.estado] || {};
                return (
                  <tr key={t.id_ticket}>
                    <td className="mis-tickets-id">#{t.id_ticket}</td>
                    <td className="mis-tickets-titulo-celda">{t.titulo}</td>
                    <td>{(t.categorias || []).join(', ') || '—'}</td>
                    <td>{t.prioridad}</td>
                    <td>
                      <span
                        className="mis-tickets-badge"
                        style={{ background: estilo.bg, color: estilo.color }}
                      >
                        {t.estado === 'En_Proceso' ? 'En proceso' : t.estado}
                      </span>
                    </td>
                    <td>{t.fecha_creacion}</td>
                    <td>
                      <button
                        id={`ver-ticket-${t.id_ticket}`}
                        className="mis-tickets-btn-ver"
                        onClick={() => navigate(`/cliente/tickets/${t.id_ticket}`)}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}