<template>
  <Layout rol="cliente" item-activo="dashboard" :nombre-usuario="nombreUsuario">
    <div v-if="cargando" style="padding: 40px; text-align: center; color: var(--color-texto-secundario);">
      Cargando panel...
    </div>

    <div v-else class="cliente-dashboard-container">
      <div class="cliente-dashboard-header">
        <div>
          <h1 class="cliente-dashboard-titulo">Mi Panel de Control</h1>
          <p class="cliente-dashboard-subtitulo">
            Bienvenido(a), {{ nombreUsuario }}. Gestiona tus solicitudes de soporte técnico.
          </p>
        </div>
        <router-link to="/cliente/tickets/nuevo" class="cliente-btn-nuevo">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Nuevo Ticket</span>
        </router-link>
      </div>

      <!-- Tarjetas de Resumen -->
      <div class="cliente-metricas-grid">
        <div class="cliente-tarjeta-metrica" style="border-left-color: #072137;">
          <div>
            <p class="metrica-titulo">Total Tickets</p>
            <h2 class="metrica-valor" style="color: #072137;">{{ datos?.resumen?.total || 0 }}</h2>
          </div>
          <div class="metrica-icono-svg" style="color: #072137; background: #f1f5f9; padding: 10px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
        </div>

        <div class="cliente-tarjeta-metrica" style="border-left-color: #f59e0b;">
          <div>
            <p class="metrica-titulo">Abiertos</p>
            <h2 class="metrica-valor" style="color: #f59e0b;">{{ datos?.resumen?.abiertos || 0 }}</h2>
          </div>
          <div class="metrica-icono-svg" style="color: #f59e0b; background: #fffbeb; padding: 10px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
        </div>

        <div class="cliente-tarjeta-metrica" style="border-left-color: #00bba6;">
          <div>
            <p class="metrica-titulo">En Proceso</p>
            <h2 class="metrica-valor" style="color: #00bba6;">{{ datos?.resumen?.enProceso || 0 }}</h2>
          </div>
          <div class="metrica-icono-svg" style="color: #00bba6; background: #f0fdfa; padding: 10px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>
        </div>

        <div class="cliente-tarjeta-metrica" style="border-left-color: #10b981;">
          <div>
            <p class="metrica-titulo">Resueltos / Cerrados</p>
            <h2 class="metrica-valor" style="color: #10b981;">
              {{ (datos?.resumen?.resueltos || 0) + (datos?.resumen?.cerrados || 0) }}
            </h2>
          </div>
          <div class="metrica-icono-svg" style="color: #10b981; background: #ecfdf5; padding: 10px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
        </div>
      </div>

      <!-- Tabla de Tickets Recientes -->
      <div class="cliente-seccion-recientes">
        <div class="cliente-recientes-header">
          <div>
            <h2 class="cliente-recientes-titulo">Mis tickets recientes</h2>
            <p class="cliente-recientes-sub">Últimas solicitudes reportadas en la plataforma</p>
          </div>
          <router-link to="/cliente/tickets" class="cliente-enlace-ver-todos" style="display: inline-flex; align-items: center; gap: 4px;">
            <span>Ver todos</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </router-link>
        </div>

        <div v-if="datos?.ticketsRecientes && datos.ticketsRecientes.length > 0" class="tabla-responsive-wrap">
          <table class="cliente-tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Equipo</th>
                <th>Estado</th>
                <th style="text-align: right;">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in datos.ticketsRecientes" :key="ticket.id_ticket">
                <td style="font-weight: 700;">
                  <router-link :to="`/cliente/tickets/${ticket.id_ticket}`" class="enlace-ticket-id">
                    #{{ ticket.id_ticket }}
                  </router-link>
                </td>
                <td>
                  <router-link :to="`/cliente/tickets/${ticket.id_ticket}`" class="enlace-ticket-titulo">
                    {{ ticket.titulo }}
                  </router-link>
                </td>
                <td style="color: #556980; font-size: 0.9rem;">
                  {{ ticket.nombre_equipo || '—' }}
                </td>
                <td>
                  <EstadoBadge :estado="ticket.estado" />
                </td>
                <td style="text-align: right;">
                  <div style="display: inline-flex; gap: 8px; justify-content: flex-end;">
                    <button
                      v-if="(ticket.estado === 'Resuelto' || ticket.estado === 'Cerrado') && !ticket.calificado"
                      type="button"
                      class="btn-calificar-accion"
                      @click="router.push(`/cliente/tickets/${ticket.id_ticket}/calificar`)"
                      style="display: inline-flex; align-items: center; gap: 4px;"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#eab308" stroke="#ca8a04" stroke-width="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      <span>Calificar</span>
                    </button>
                    <button
                      type="button"
                      class="btn-detalle-accion"
                      @click="router.push(`/cliente/tickets/${ticket.id_ticket}`)"
                      style="display: inline-flex; align-items: center; gap: 4px;"
                    >
                      <span>Ver detalle</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="cliente-vacio-box">
          <p style="margin: 0 0 14px;">No tienes tickets registrados aún.</p>
          <router-link to="/cliente/tickets/nuevo" class="cliente-btn-nuevo">
            Crear tu primer ticket
          </router-link>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Layout from '../../components/Layout.vue';
import EstadoBadge from '../../components/EstadoBadge.vue';
import { useAuth } from '../../context/useAuth';
import { obtenerDashboardCliente } from '../../services/clienteService';

const router = useRouter();
const { sesion } = useAuth();
const datos = ref(null);
const cargando = ref(true);

const nombreUsuario = computed(() => {
  return sesion.value?.nombre
    ? `${sesion.value.nombre} ${sesion.value.apellido || ''}`.trim()
    : 'Cliente';
});

onMounted(async () => {
  try {
    const resultado = await obtenerDashboardCliente();
    datos.value = resultado;
  } catch (error) {
    console.error('Error al cargar dashboard:', error);
  } finally {
    cargando.value = false;
  }
});
</script>

<style scoped>
.cliente-dashboard-container {
  font-family: var(--fuente-principal);
  max-width: 1200px;
  margin: 0 auto;
}

.cliente-dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 28px;
}

.cliente-dashboard-titulo {
  margin: 0;
  font-size: 1.75rem;
  color: var(--color-texto-principal, #072137);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.cliente-dashboard-subtitulo {
  margin: 4px 0 0;
  color: var(--color-texto-secundario, #556980);
  font-size: 0.95rem;
}

.cliente-btn-nuevo {
  background-color: var(--color-primario, #00bba6);
  color: #ffffff;
  padding: 11px 22px;
  border-radius: var(--radio-boton, 10px);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(0, 187, 166, 0.35);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.cliente-btn-nuevo:hover {
  background-color: var(--color-primario-hover, #009e8c);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 187, 166, 0.45);
}

.cliente-metricas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.cliente-tarjeta-metrica {
  background-color: var(--color-superficie, #ffffff);
  padding: 22px 20px;
  border-radius: var(--radio-tarjeta, 14px);
  border-left: 4px solid var(--color-primario, #00bba6);
  border-top: 1px solid var(--color-borde, #e2ebf1);
  border-right: 1px solid var(--color-borde, #e2ebf1);
  border-bottom: 1px solid var(--color-borde, #e2ebf1);
  box-shadow: var(--sombra-tarjeta, 0 4px 20px rgba(7, 30, 51, 0.05));
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cliente-tarjeta-metrica:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(7, 30, 51, 0.08);
}

.metrica-titulo {
  margin: 0 0 6px 0;
  font-size: 0.85rem;
  color: var(--color-texto-secundario, #556980);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.metrica-valor {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.metrica-icono {
  font-size: 2rem;
  opacity: 0.9;
}

.cliente-seccion-recientes {
  background-color: var(--color-superficie, #ffffff);
  padding: 28px;
  border-radius: var(--radio-tarjeta, 14px);
  box-shadow: var(--sombra-tarjeta, 0 4px 20px rgba(7, 30, 51, 0.05));
  border: 1px solid var(--color-borde, #e2ebf1);
}

.cliente-recientes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
}

.cliente-recientes-titulo {
  font-size: 1.2rem;
  margin: 0;
  font-weight: 800;
  color: var(--color-texto-principal, #072137);
  letter-spacing: -0.01em;
}

.cliente-recientes-sub {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: var(--color-texto-secundario, #556980);
}

.cliente-enlace-ver-todos {
  color: var(--color-primario, #00bba6);
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
}

.cliente-enlace-ver-todos:hover {
  text-decoration: underline;
}

.tabla-responsive-wrap {
  overflow-x: auto;
}

.cliente-tabla {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.cliente-tabla th {
  border-bottom: 2px solid var(--color-borde, #e2ebf1);
  color: var(--color-texto-secundario, #556980);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 14px;
}

.cliente-tabla td {
  padding: 16px 14px;
  border-bottom: 1px solid #edf2f7;
}

.enlace-ticket-id {
  color: var(--color-primario, #00bba6);
  text-decoration: none;
}

.enlace-ticket-titulo {
  color: var(--color-texto-principal, #072137);
  text-decoration: none;
  font-weight: 600;
}

.enlace-ticket-titulo:hover {
  color: var(--color-primario, #00bba6);
}

.btn-calificar-accion {
  padding: 6px 14px;
  border-radius: var(--radio-boton, 10px);
  border: 1px solid #fde047;
  background-color: #fefce8;
  color: #854d0e;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-calificar-accion:hover {
  background-color: #fef08a;
}

.btn-detalle-accion {
  padding: 6px 14px;
  border-radius: var(--radio-boton, 10px);
  border: 1px solid var(--color-borde, #e2ebf1);
  background-color: #f8fafc;
  color: var(--color-texto-principal, #072137);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-detalle-accion:hover {
  background-color: #ffffff;
  border-color: var(--color-primario, #00bba6);
  color: var(--color-primario, #00bba6);
}

.cliente-vacio-box {
  text-align: center;
  padding: 36px 0;
  color: var(--color-texto-secundario, #556980);
}
</style>
