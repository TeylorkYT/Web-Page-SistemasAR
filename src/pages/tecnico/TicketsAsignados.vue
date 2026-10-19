<template>
  <Layout
    rol="tecnico"
    item-activo="tickets-asignados"
    :nombre-usuario="nombreTecnico"
  >
    <div class="dashboard-tecnico-contenedor">
      <!-- Cabecera de la sección -->
      <header class="dashboard-tecnico-header">
        <div>
          <h1 class="dashboard-tecnico-titulo">Mis Tickets Asignados</h1>
          <p class="dashboard-tecnico-subtitulo">
            Mesa de trabajo y seguimiento de solicitudes de soporte técnico bajo tu responsabilidad ({{ tickets.length }} tickets en total).
          </p>
        </div>
        <button
          type="button"
          class="btn-volver-dashboard-top"
          @click="router.push('/tecnico')"
          style="display: inline-flex; align-items: center; gap: 6px;"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Volver al Dashboard</span>
        </button>
      </header>

      <!-- Tabla principal de gestión -->
      <section class="dashboard-tabla-seccion">
        <div class="dashboard-tabla-header-barra" style="flex-wrap: wrap; gap: 1rem; padding: 16px 20px;">
          <!-- Buscador en vivo -->
          <input
            type="search"
            placeholder="Buscar por ID, título, cliente o categoría..."
            v-model="busqueda"
            class="tecnico-buscador-input"
          />

          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <!-- Filtro por prioridad -->
            <select
              v-model="filtroPrioridad"
              class="tecnico-select-prioridad"
            >
              <option value="Todas">Todas las prioridades</option>
              <option value="Critica">Crítica</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>

            <!-- Pestañas de Filtro por estado -->
            <div class="filtros-pills" role="tablist">
              <button
                v-for="estado in ['Todos', 'En_Proceso', 'Resuelto', 'Cerrado']"
                :key="estado"
                type="button"
                class="filtro-pill-btn"
                :class="{ activo: filtroEstado === estado }"
                @click="filtroEstado = estado"
              >
                {{ estado === 'Todos' ? 'Todos' : estado.replace('_', ' ') }}
                <span style="margin-left: 5px; font-size: 0.75rem; opacity: 0.85;">
                  ({{ conteoPorEstado[estado] || 0 }})
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Tabla de contenido -->
        <div class="tabla-responsive-wrapper">
          <div v-if="cargando" class="estado-vacio-tabla">
            <p class="estado-vacio-texto">Cargando tickets asignados...</p>
          </div>

          <div v-else-if="ticketsFiltrados.length === 0" class="estado-vacio-tabla">
            <div class="estado-vacio-icono" style="display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background-color: #f1f5f9; color: #64748b; margin: 0 auto 10px;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-6l-2 3h-4l-2-3H2"></path>
                <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
              </svg>
            </div>
            <p class="estado-vacio-texto">No se encontraron tickets con los filtros seleccionados</p>
            <p class="estado-vacio-subtexto">
              {{
                filtroEstado !== 'Todos' || filtroPrioridad !== 'Todas' || busqueda
                  ? 'Prueba restableciendo los filtros de búsqueda.'
                  : 'Actualmente no tienes tickets asignados en el sistema.'
              }}
            </p>
            <button
              v-if="filtroEstado !== 'Todos' || filtroPrioridad !== 'Todas' || busqueda"
              type="button"
              class="btn-limpiar-filtros"
              @click="limpiarFiltros"
            >
              Limpiar filtros
            </button>
          </div>

          <table v-else class="tabla-tickets">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título / Problema</th>
                <th>Cliente</th>
                <th>Equipo</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in ticketsFiltrados" :key="ticket.id_ticket">
                <td>
                  <span class="ticket-id-tag">#{{ ticket.id_ticket }}</span>
                </td>
                <td>
                  <div class="ticket-titulo-texto">{{ ticket.titulo }}</div>
                  <div v-if="ticket.nombresCategorias && ticket.nombresCategorias.length > 0" class="ticket-categorias-tags">
                    <span v-for="(cat, idx) in ticket.nombresCategorias" :key="idx" class="cat-chip">
                      {{ cat }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="cliente-nombre">
                    {{ ticket.cliente?.nombre }} {{ ticket.cliente?.apellido }}
                  </div>
                  <div class="cliente-correo">{{ ticket.cliente?.correo_electronico }}</div>
                </td>
                <td>
                  <div v-if="ticket.equipo">
                    <div class="equipo-resumen">
                      {{ ticket.equipo.tipo }} - {{ ticket.equipo.marca }} {{ ticket.equipo.modelo }}
                    </div>
                    <div class="equipo-serial">S/N: {{ ticket.equipo.serial }}</div>
                  </div>
                  <span v-else style="color: #94a3b8;">No asignado</span>
                </td>
                <td>
                  <span class="badge-prioridad" :class="ticket.prioridad">
                    {{ ticket.prioridad }}
                  </span>
                </td>
                <td>
                  <span class="badge-estado" :class="ticket.estado">
                    {{ ticket.estado.replace('_', ' ') }}
                  </span>
                </td>
                <td>
                  <div style="display: flex; gap: 8px; align-items: center;">
                    <router-link
                      :to="`/tecnico/tickets/${ticket.id_ticket}`"
                      class="btn-ver-detalle"
                      title="Ver detalle y gestionar ticket"
                    >
                      Gestionar →
                    </router-link>
                    <router-link
                      :to="`/tecnico/tickets/${ticket.id_ticket}/avance`"
                      class="btn-avance-rapido"
                      title="Registrar avance rápido"
                    >
                      Avance
                    </router-link>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Layout from '../../components/Layout.vue';
import { useAuth } from '../../context/useAuth';
import {
  obtenerTicketsTecnico,
  obtenerTecnicoActual,
} from '../../services/tecnicoService';
import './DashboardTecnico.css';

const router = useRouter();
const { sesion } = useAuth();

const tecnico = ref(null);
const tickets = ref([]);
const cargando = ref(true);

const filtroEstado = ref('Todos');
const filtroPrioridad = ref('Todas');
const busqueda = ref('');

onMounted(async () => {
  try {
    const [datosTecnico, ticketsAsignados] = await Promise.all([
      obtenerTecnicoActual(),
      obtenerTicketsTecnico(),
    ]);
    tecnico.value = datosTecnico;
    tickets.value = ticketsAsignados || [];
  } catch (error) {
    console.error('Error al cargar tickets asignados:', error);
  } finally {
    cargando.value = false;
  }
});

const nombreTecnico = computed(() => {
  return (
    sesion.value?.nombre ||
    (tecnico.value ? `${tecnico.value.nombre} ${tecnico.value.apellido}` : 'Técnico')
  );
});

const conteoPorEstado = computed(() => ({
  Todos: tickets.value.length,
  En_Proceso: tickets.value.filter((t) => t.estado === 'En_Proceso').length,
  Resuelto: tickets.value.filter((t) => t.estado === 'Resuelto').length,
  Cerrado: tickets.value.filter((t) => t.estado === 'Cerrado').length,
}));

const ticketsFiltrados = computed(() => {
  return tickets.value.filter((t) => {
    const coincideEstado =
      filtroEstado.value === 'Todos' ? true : t.estado === filtroEstado.value;
    const coincidePrioridad =
      filtroPrioridad.value === 'Todas' ? true : t.prioridad === filtroPrioridad.value;

    if (!coincideEstado || !coincidePrioridad) return false;

    if (!busqueda.value.trim()) return true;
    const q = busqueda.value.toLowerCase();
    const clienteNombre = `${t.cliente?.nombre || ''} ${t.cliente?.apellido || ''}`.toLowerCase();
    return (
      String(t.id_ticket).includes(q) ||
      t.titulo?.toLowerCase().includes(q) ||
      clienteNombre.includes(q) ||
      (t.nombresCategorias || []).some((c) => String(c).toLowerCase().includes(q))
    );
  });
});

const limpiarFiltros = () => {
  filtroEstado.value = 'Todos';
  filtroPrioridad.value = 'Todas';
  busqueda.value = '';
};
</script>

<style scoped>
.btn-volver-dashboard-top {
  background-color: #ffffff;
  color: var(--color-texto-principal, #072137);
  padding: 9px 16px;
  border-radius: var(--radio-boton, 10px);
  border: 1px solid var(--color-borde, #e2ebf1);
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-volver-dashboard-top:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.tecnico-buscador-input {
  padding: 9px 16px;
  border-radius: var(--radio-pildora, 9999px);
  border: 1px solid var(--color-borde, #e2ebf1);
  font-size: 0.88rem;
  min-width: 280px;
  flex: 1 1 280px;
  background-color: #ffffff;
  color: var(--color-texto-principal, #072137);
  outline: none;
  transition: all 0.2s ease;
}

.tecnico-buscador-input:focus {
  border-color: var(--color-primario, #00bba6);
  box-shadow: 0 0 0 3px rgba(0, 187, 166, 0.15);
}

.tecnico-select-prioridad {
  padding: 8px 14px;
  border-radius: var(--radio-boton, 10px);
  border: 1px solid var(--color-borde, #e2ebf1);
  font-size: 0.85rem;
  background-color: #ffffff;
  color: var(--color-texto-principal, #072137);
  font-weight: 600;
  outline: none;
  cursor: pointer;
}

.filtros-pills {
  display: flex;
  background-color: #f1f5f9;
  padding: 3px;
  border-radius: var(--radio-pildora, 9999px);
  gap: 2px;
}

.filtro-pill-btn {
  background: none;
  border: none;
  padding: 6px 14px;
  border-radius: var(--radio-pildora, 9999px);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-texto-secundario, #556980);
  cursor: pointer;
  transition: all 0.15s ease;
}

.filtro-pill-btn:hover {
  color: var(--color-texto-principal, #072137);
}

.filtro-pill-btn.activo {
  background-color: #ffffff;
  color: var(--color-primario, #00bba6);
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(7, 30, 51, 0.08);
}

.btn-limpiar-filtros {
  margin-top: 12px;
  padding: 6px 16px;
  border-radius: var(--radio-boton, 10px);
  border: 1px solid var(--color-borde, #e2ebf1);
  background-color: #ffffff;
  color: var(--color-texto-principal, #072137);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-limpiar-filtros:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.ticket-categorias-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.cat-chip {
  font-size: 0.72rem;
  background-color: #f1f5f9;
  color: #475569;
  padding: 2px 8px;
  border-radius: 9999px;
  font-weight: 600;
}

.cliente-correo {
  font-size: 0.76rem;
  color: #8ca3ba;
}

.equipo-resumen {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-texto-principal, #072137);
}

.equipo-serial {
  font-size: 0.75rem;
  color: #8ca3ba;
}

.btn-avance-rapido {
  padding: 6px 12px;
  border-radius: var(--radio-boton, 10px);
  border: 1px solid var(--color-borde, #e2ebf1);
  background-color: #ffffff;
  color: var(--color-texto-principal, #072137);
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s ease;
}

.btn-avance-rapido:hover {
  border-color: #cbd5e1;
  background-color: #f8fafc;
}
</style>
