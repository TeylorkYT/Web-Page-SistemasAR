import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { listarTickets } from '../../services/ticketsService';
import './MisTickets.css';

const ESTADOS = ['Todos', 'Abierto', 'En_Proceso', 'Resuelto', 'Cerrado'];

const COLOR_ESTADO = {
  Abierto:    { bg: '#dbeafe', color: '#1e40af' },
  En_Proceso: { bg: '#fef3c7', color: '#92400e' },
  Resuelto:   { bg: '#d1fae5', color: '#065f46' },
  Cerrado:    { bg: '#f1f5f9', color: '#475569' }
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

export default function MisTickets() {
  const navigate = useNavigate();
  const { sesion } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filtro, setFiltro] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    listarTickets()
      .then(setTickets)
      .finally(() => setCargando(false));
  }, []);

  const listaFiltrada = tickets
    .filter((t) => filtro === 'Todos' || t.estado === filtro)
    .filter((t) => {
      if (!busqueda.trim()) return true;
      const q = busqueda.toLowerCase();
      return (
        t.titulo?.toLowerCase().includes(q) ||
        String(t.id_ticket).includes(q) ||
        (t.categorias || []).some((c) => c.toLowerCase().includes(q))
      );
    });

  return (
    <Layout rol="cliente" itemActivo="mis-tickets" nombreUsuario={sesion?.nombre}>
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

      {/* Controles de Filtros y Búsqueda */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div className="mis-tickets-filtros" role="group" aria-label="Filtrar por estado" style={{ marginBottom: 0 }}>
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

        <input
          id="buscar-tickets-cliente"
          type="search"
          placeholder="Buscar por título, ID o categoría..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            padding: '8px 14px',
            border: '1px solid var(--color-borde, #e2e8f0)',
            borderRadius: '6px',
            fontSize: '14px',
            minWidth: '260px',
            background: 'white'
          }}
        />
      </div>

      {/* Tabla de resultados */}
      {cargando ? (
        <p className="mis-tickets-vacio">Cargando tickets…</p>
      ) : listaFiltrada.length === 0 ? (
        <p className="mis-tickets-vacio">No se encontraron tickets con los filtros actuales.</p>
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
                <th>Fecha creación</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.map((t) => {
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
                    <td style={{ fontSize: '13px', color: '#64748b' }}>{formatearFecha(t.fecha_creacion)}</td>
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
