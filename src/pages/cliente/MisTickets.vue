<template>
  <Layout rol="cliente" item-activo="mis-tickets" :nombre-usuario="sesion?.nombre">
    <div class="mis-tickets-cabecera">
      <h1 class="mis-tickets-titulo">Mis Tickets</h1>
      <button
        type="button"
        id="btn-nuevo-ticket"
        class="mis-tickets-btn-nuevo"
        @click="router.push('/cliente/tickets/nuevo')"
      >
        + Nuevo ticket
      </button>
    </div>

    <!-- Controles de Filtros y Búsqueda -->
    <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; margin-bottom: 20px;">
      <div class="mis-tickets-filtros" role="group" aria-label="Filtrar por estado" style="margin-bottom: 0;">
        <button
          v-for="e in ESTADOS"
          :key="e"
          :id="`filtro-${e.toLowerCase()}`"
          class="mis-tickets-filtro-btn"
          :class="{ activo: filtro === e }"
          @click="filtro = e"
        >
          {{ e === 'En_Proceso' ? 'En proceso' : e }}
        </button>
      </div>

      <input
        id="buscar-tickets-cliente"
        type="search"
        placeholder="Buscar por título, ID o categoría..."
        v-model="busqueda"
        class="mis-tickets-buscador-input"
      />
    </div>

    <!-- Tabla de resultados -->
    <p v-if="cargando" class="mis-tickets-vacio">Cargando tickets…</p>
    <p v-else-if="listaFiltrada.length === 0" class="mis-tickets-vacio">
      No se encontraron tickets con los filtros actuales.
    </p>

    <div v-else class="mis-tickets-tabla-contenedor">
      <table class="mis-tickets-tabla">
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
          <tr v-for="t in listaFiltrada" :key="t.id_ticket">
            <td class="mis-tickets-id">#{{ t.id_ticket }}</td>
            <td class="mis-tickets-titulo-celda">{{ t.titulo }}</td>
            <td>{{ (t.categorias || []).join(', ') || '—' }}</td>
            <td>
              <span :style="{ fontWeight: 600, color: t.prioridad === 'Alta' ? '#ef4444' : '#556980' }">
                {{ t.prioridad }}
              </span>
            </td>
            <td>
              <EstadoBadge :estado="t.estado" />
            </td>
            <td style="font-size: 13px; color: #556980;">
              {{ formatearFecha(t.fecha_creacion) }}
            </td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button
                  type="button"
                  :id="`ver-ticket-${t.id_ticket}`"
                  class="mis-tickets-btn-ver"
                  @click="router.push(`/cliente/tickets/${t.id_ticket}`)"
                >
                  Ver
                </button>
                <button
                  v-if="(t.estado === 'Resuelto' || t.estado === 'Cerrado') && !t.calificacion"
                  type="button"
                  :id="`calificar-ticket-${t.id_ticket}`"
                  class="mis-tickets-btn-calificar"
                  @click="router.push(`/cliente/tickets/${t.id_ticket}/calificar`)"
                  title="Calificar servicio recibido"
                >
                  ★ Calificar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Layout from '../../components/Layout.vue';
import EstadoBadge from '../../components/EstadoBadge.vue';
import { useAuth } from '../../context/useAuth';
import { listarTickets } from '../../services/ticketsService';
import './MisTickets.css';

const ESTADOS = ['Todos', 'Abierto', 'En_Proceso', 'Resuelto', 'Cerrado'];

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
          minute: '2-digit',
        });
  } catch {
    return fechaStr;
  }
}

const router = useRouter();
const { sesion } = useAuth();
const tickets = ref([]);
const filtro = ref('Todos');
const busqueda = ref('');
const cargando = ref(true);

onMounted(() => {
  listarTickets()
    .then((data) => (tickets.value = data || []))
    .finally(() => (cargando.value = false));
});

const listaFiltrada = computed(() => {
  return tickets.value
    .filter((t) => filtro.value === 'Todos' || t.estado === filtro.value)
    .filter((t) => {
      if (!busqueda.value.trim()) return true;
      const q = busqueda.value.toLowerCase();
      return (
        t.titulo?.toLowerCase().includes(q) ||
        String(t.id_ticket).includes(q) ||
        (t.categorias || []).some((c) => c.toLowerCase().includes(q))
      );
    });
});
</script>

<style scoped>
.mis-tickets-buscador-input {
  padding: 8px 16px;
  border: 1px solid var(--color-borde, #e2ebf1);
  border-radius: var(--radio-pildora, 9999px);
  font-size: 0.88rem;
  min-width: 280px;
  background-color: var(--color-superficie, #ffffff);
  color: var(--color-texto-principal, #072137);
  outline: none;
  transition: all 0.2s ease;
}

.mis-tickets-buscador-input:focus {
  border-color: var(--color-primario, #00bba6);
  box-shadow: 0 0 0 3px rgba(0, 187, 166, 0.15);
}

.mis-tickets-btn-calificar {
  padding: 5px 12px;
  border: 1px solid #fde047;
  border-radius: var(--radio-boton, 10px);
  background-color: #fefce8;
  color: #854d0e;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mis-tickets-btn-calificar:hover {
  background-color: #fef08a;
}
</style>
