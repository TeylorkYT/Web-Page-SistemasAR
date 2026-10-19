<template>
  <Layout
    rol="tecnico"
    item-activo="dashboard"
    :nombre-usuario="nombreTecnico"
  >
    <div class="dashboard-tecnico-contenedor">
      <!-- Encabezado del Dashboard -->
      <header class="dashboard-tecnico-header">
        <div>
          <h1 class="dashboard-tecnico-titulo">Dashboard Operativo</h1>
          <p class="dashboard-tecnico-subtitulo">
            Bienvenido(a), <strong>{{ nombreTecnico }}</strong>. Resumen analítico de tu carga de soporte y rendimiento.
          </p>
        </div>
        <button
          type="button"
          class="btn-ver-tickets-top"
          style="display: inline-flex; align-items: center; gap: 8px;"
          @click="router.push('/tecnico/tickets')"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <span>Ir a Tickets Asignados ({{ tickets.length }}) →</span>
        </button>
      </header>

      <!-- 1. Tarjetas Métricas KPI -->
      <section class="dashboard-tecnico-metricas" aria-label="Métricas del técnico">
        <div class="metrica-card">
          <div class="metrica-card-header">
            <span class="metrica-card-titulo">Total Asignados</span>
            <span class="metrica-card-icono" style="background-color: #e0f2fe; color: #0369a1; display: inline-flex; align-items: center; justify-content: center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </span>
          </div>
          <span class="metrica-card-valor">{{ cargando ? '...' : metricas.ticketsAsignados }}</span>
          <span class="metrica-card-desc">Carga total bajo tu responsabilidad</span>
        </div>

        <div class="metrica-card">
          <div class="metrica-card-header">
            <span class="metrica-card-titulo">En Atención Activa</span>
            <span class="metrica-card-icono" style="background-color: #fef3c7; color: #b45309; display: inline-flex; align-items: center; justify-content: center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </span>
          </div>
          <span class="metrica-card-valor" style="color: #f59e0b;">
            {{ cargando ? '...' : metricas.ticketsEnProceso }}
          </span>
          <span class="metrica-card-desc">En diagnóstico o reparación</span>
        </div>

        <div class="metrica-card">
          <div class="metrica-card-header">
            <span class="metrica-card-titulo">Resueltos</span>
            <span class="metrica-card-icono" style="background-color: #e6f9f6; color: #007a6c; display: inline-flex; align-items: center; justify-content: center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </span>
          </div>
          <span class="metrica-card-valor" style="color: #00bba6;">
            {{ cargando ? '...' : metricas.ticketsResueltos }}
          </span>
          <span class="metrica-card-desc">Solución técnica aplicada</span>
        </div>

        <div class="metrica-card">
          <div class="metrica-card-header">
            <span class="metrica-card-titulo">Cerrados</span>
            <span class="metrica-card-icono" style="background-color: #f1f5f9; color: #475569; display: inline-flex; align-items: center; justify-content: center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
          </div>
          <span class="metrica-card-valor" style="color: #556980;">
            {{ cargando ? '...' : metricas.ticketsCerrados }}
          </span>
          <span class="metrica-card-desc">Histórico con ciclo completado</span>
        </div>
      </section>

      <!-- 2. Paneles Analíticos: Distribución de Prioridad y Rendimiento -->
      <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 28px;">
        <!-- Panel Distribución por Prioridad -->
        <div style="background-color: #ffffff; border: 1px solid var(--color-borde, #e2ebf1); border-radius: var(--radio-tarjeta, 14px); padding: 22px; box-shadow: var(--sombra-tarjeta, 0 4px 20px rgba(7,30,51,0.05));">
          <h3 style="margin: 0 0 16px; font-size: 1.05rem; color: var(--color-texto-principal, #072137); font-weight: 700;">
            Distribución por Prioridad
          </h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div v-for="item in itemsPrioridad" :key="item.etiqueta">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px;">
                <span :style="{ color: item.color }">● {{ item.etiqueta }}</span>
                <span style="color: #556980;">{{ item.valor }} ({{ calcularPorcentaje(item.valor) }}%)</span>
              </div>
              <div style="width: 100%; height: 8px; background-color: #e2ebf1; border-radius: 4px; overflow: hidden;">
                <div
                  :style="{
                    width: `${calcularPorcentaje(item.valor)}%`,
                    height: '100%',
                    backgroundColor: item.color,
                    borderRadius: '4px',
                    transition: 'width 0.4s ease',
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel de Rendimiento y Estado -->
        <div style="background-color: #ffffff; border: 1px solid var(--color-borde, #e2ebf1); border-radius: var(--radio-tarjeta, 14px); padding: 22px; box-shadow: var(--sombra-tarjeta, 0 4px 20px rgba(7,30,51,0.05)); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 style="margin: 0 0 16px; font-size: 1.05rem; color: var(--color-texto-principal, #072137); font-weight: 700;">
              Rendimiento de Mesa
            </h3>
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
              <div
                :style="{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: `conic-gradient(#00bba6 ${tasaResolucion * 3.6}deg, #e2ebf1 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }"
              >
                <div
                  style="width: 56px; height: 56px; border-radius: 50%; background-color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; color: #00bba6;"
                >
                  {{ tasaResolucion }}%
                </div>
              </div>
              <div>
                <h4 style="margin: 0 0 4px; font-size: 0.95rem; color: #072137;">Tasa de Resolución</h4>
                <p style="margin: 0; font-size: 0.85rem; color: #556980;">
                  Casos resueltos o cerrados respecto a tu volumen total asignado.
                </p>
              </div>
            </div>
          </div>

          <div style="border-top: 1px solid #edf2f7; padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.85rem; color: #556980;">Estado operativo:</span>
            <span style="padding: 4px 12px; border-radius: 9999px; font-size: 0.78rem; font-weight: 700; background-color: #e6f9f6; color: #007a6c; border: 1px solid #9ee7dc; display: inline-flex; align-items: center; gap: 6px;">
              <span style="width: 7px; height: 7px; border-radius: 50%; background-color: #10b981;"></span>
              <span>Activo y disponible</span>
            </span>
          </div>
        </div>
      </section>

      <!-- 3. Sección: Casos Prioritarios y Recientes -->
      <section class="dashboard-tabla-seccion">
        <div class="dashboard-tabla-header-barra">
          <div>
            <h2 class="dashboard-tabla-titulo">Casos que Requieren Atención Inmediata</h2>
            <p style="margin: 4px 0 0; font-size: 0.85rem; color: #556980;">
              Tickets en estado "En Proceso" o de alta prioridad asignados a tu cuenta
            </p>
          </div>
          <router-link
            to="/tecnico/tickets"
            style="color: var(--color-primario, #00bba6); font-size: 0.9rem; font-weight: 700; text-decoration: none;"
          >
            Ver todos los tickets ({{ tickets.length }}) →
          </router-link>
        </div>

        <div class="tabla-responsive-wrapper">
          <div v-if="cargando" class="estado-vacio-tabla">
            <p class="estado-vacio-texto">Cargando casos prioritarios...</p>
          </div>
          <div v-else-if="ticketsAtencionInmediata.length === 0" class="estado-vacio-tabla">
            <div class="estado-vacio-icono" style="display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background-color: #ecfdf5; color: #059669; margin: 0 auto 10px;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <p class="estado-vacio-texto">¡Al día! No tienes casos críticos o en proceso pendientes.</p>
            <p class="estado-vacio-subtexto">
              Todos tus tickets asignados están resueltos o cerrados.
            </p>
          </div>
          <table v-else class="tabla-tickets">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título / Problema</th>
                <th>Cliente</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in ticketsAtencionInmediata" :key="ticket.id_ticket">
                <td>
                  <span class="ticket-id-tag">#{{ ticket.id_ticket }}</span>
                </td>
                <td>
                  <div class="ticket-titulo-texto">{{ ticket.titulo }}</div>
                </td>
                <td>
                  <div class="cliente-nombre">
                    {{ ticket.cliente?.nombre }} {{ ticket.cliente?.apellido }}
                  </div>
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
                  <router-link
                    :to="`/tecnico/tickets/${ticket.id_ticket}`"
                    class="btn-ver-detalle"
                    title="Gestionar caso"
                  >
                    Gestionar →
                  </router-link>
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
  obtenerMetricasDashboardTecnico,
  obtenerTecnicoActual,
} from '../../services/tecnicoService';
import './DashboardTecnico.css';

const router = useRouter();
const { sesion } = useAuth();

const tecnico = ref(null);
const tickets = ref([]);
const metricas = ref({
  ticketsAsignados: 0,
  ticketsEnProceso: 0,
  ticketsResueltos: 0,
  ticketsCerrados: 0,
});
const cargando = ref(true);

onMounted(async () => {
  try {
    const [datosTecnico, ticketsAsignados, metricasResumen] = await Promise.all([
      obtenerTecnicoActual(),
      obtenerTicketsTecnico(),
      obtenerMetricasDashboardTecnico(),
    ]);
    tecnico.value = datosTecnico;
    tickets.value = ticketsAsignados || [];
    metricas.value = metricasResumen || metricas.value;
  } catch (error) {
    console.error('Error al cargar dashboard del técnico:', error);
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

const totalTickets = computed(() => tickets.value.length || 1);

const itemsPrioridad = computed(() => [
  {
    etiqueta: 'Crítica',
    valor: tickets.value.filter((t) => t.prioridad === 'Critica').length,
    color: '#ef4444',
  },
  {
    etiqueta: 'Alta',
    valor: tickets.value.filter((t) => t.prioridad === 'Alta').length,
    color: '#f59e0b',
  },
  {
    etiqueta: 'Media',
    valor: tickets.value.filter((t) => t.prioridad === 'Media').length,
    color: '#0284c7',
  },
  {
    etiqueta: 'Baja',
    valor: tickets.value.filter((t) => t.prioridad === 'Baja').length,
    color: '#64748b',
  },
]);

const calcularPorcentaje = (val) => {
  return Math.round((val / totalTickets.value) * 100);
};

const ticketsAtencionInmediata = computed(() => {
  return tickets.value
    .filter(
      (t) =>
        t.estado === 'En_Proceso' ||
        t.prioridad === 'Critica' ||
        t.prioridad === 'Alta'
    )
    .slice(0, 5);
});

const tasaResolucion = computed(() => {
  if (!metricas.value.ticketsAsignados) return 100;
  return Math.round(
    ((metricas.value.ticketsResueltos + metricas.value.ticketsCerrados) /
      metricas.value.ticketsAsignados) *
      100
  );
});
</script>

<style scoped>
.btn-ver-tickets-top {
  background-color: var(--color-primario, #00bba6);
  color: #ffffff;
  padding: 10px 18px;
  border-radius: var(--radio-boton, 10px);
  border: none;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 187, 166, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-ver-tickets-top:hover {
  background-color: var(--color-primario-hover, #009e8c);
  transform: translateY(-1px);
}
</style>
