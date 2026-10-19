<template>
  <Layout rol="cliente" item-activo="mis-tickets" :nombre-usuario="sesion?.nombre">
    <div v-if="cargando">
      <p class="detalle-ticket-mensaje">Cargando ticket…</p>
    </div>

    <div v-else-if="!ticket" style="text-align: center; padding: 40px 0;">
      <p class="detalle-ticket-mensaje" style="color: #dc2626;">
        Ticket no encontrado o no tienes permisos para visualizarlo.
      </p>
      <button
        type="button"
        class="detalle-ticket-btn-volver"
        @click="router.push('/cliente/tickets')"
        style="display: inline-flex; align-items: center; gap: 6px;"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Volver a Mis Tickets</span>
      </button>
    </div>

    <div v-else>
      <!-- Cabecera -->
      <div class="detalle-ticket-cabecera">
        <button
          type="button"
          id="btn-volver-tickets"
          class="detalle-ticket-btn-volver"
          @click="router.push('/cliente/tickets')"
          style="display: inline-flex; align-items: center; gap: 6px;"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Mis tickets</span>
        </button>
        <div class="detalle-ticket-cabecera-derecha">
          <EstadoBadge :estado="ticket.estado" />
          <button
            v-if="puedeCalificar"
            type="button"
            id="btn-calificar"
            class="detalle-ticket-btn-calificar"
            @click="router.push(`/cliente/tickets/${ticket.id_ticket}/calificar`)"
            style="display: inline-flex; align-items: center; gap: 6px;"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#eab308" stroke="#ca8a04" stroke-width="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>Calificar atención</span>
          </button>
        </div>
      </div>

      <h1 class="detalle-ticket-titulo">{{ ticket.titulo }}</h1>

      <!-- Información principal -->
      <div class="detalle-ticket-grid">
        <div class="detalle-ticket-tarjeta detalle-ticket-info">
          <h2 class="detalle-ticket-seccion">Detalles del ticket</h2>
          <dl class="detalle-ticket-dl">
            <dt>ID</dt>
            <dd>#{{ ticket.id_ticket }}</dd>
            <dt>Fecha de creación</dt>
            <dd>{{ formatearFecha(ticket.fecha_creacion) }}</dd>
            <template v-if="ticket.fecha_resolucion">
              <dt>Fecha de resolución</dt>
              <dd>{{ formatearFecha(ticket.fecha_resolucion) }}</dd>
            </template>
            <dt>Prioridad</dt>
            <dd>
              <span
                class="detalle-ticket-prioridad"
                :style="{ color: colorPrioridad, display: 'inline-flex', alignItems: 'center', gap: '5px' }"
              >
                <span :style="{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colorPrioridad, display: 'inline-block' }"></span>
                <span>{{ ticket.prioridad }}</span>
              </span>
            </dd>
            <dt>Categorías</dt>
            <dd>{{ (ticket.categorias || []).join(', ') || '—' }}</dd>
            <dt>Modalidad</dt>
            <dd>{{ ticket.modalidad || 'Presencial' }}</dd>
            <dt>Técnico asignado</dt>
            <dd>{{ ticket.tecnico_nombre || 'Pendiente de asignación' }}</dd>
            <dt>Equipo asociado</dt>
            <dd>{{ ticket.equipo || 'Sin equipo específico' }}</dd>
          </dl>

          <h2 class="detalle-ticket-seccion" style="margin-top: 24px;">Descripción</h2>
          <p class="detalle-ticket-descripcion">{{ ticket.descripcion }}</p>

          <SeccionAdjuntos
            :id-ticket="ticket.id_ticket"
            :estado-ticket="ticket.estado"
          />

          <!-- Calificación ya enviada -->
          <div v-if="ticket.calificacion" class="calificacion-box">
            <h3 class="calificacion-titulo" style="display: flex; align-items: center; gap: 6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#eab308" stroke="#ca8a04" stroke-width="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Calificación registrada</span>
            </h3>
            <div class="calificacion-estrellas" style="display: flex; gap: 3px; margin: 6px 0;">
              <svg
                v-for="starIndex in 5"
                :key="starIndex"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                :fill="starIndex <= (ticket.calificacion.puntuacion || 0) ? '#eab308' : '#e2e8f0'"
                :stroke="starIndex <= (ticket.calificacion.puntuacion || 0) ? '#ca8a04' : '#cbd5e1'"
                stroke-width="1.5"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <p v-if="ticket.calificacion.comentario" class="calificacion-comentario">
              "{{ ticket.calificacion.comentario }}"
            </p>
          </div>

          <!-- Informe de cierre del técnico -->
          <div v-if="ticket.reporte" class="solucion-box">
            <h3 class="solucion-titulo" style="display: flex; align-items: center; gap: 6px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Solución aplicada por el técnico</span>
            </h3>
            <p class="solucion-texto">
              {{ ticket.reporte.solucion_aplicada }}
            </p>
          </div>
        </div>

        <!-- Columna Derecha: Chat e Historial -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Comentarios con el técnico -->
          <div class="detalle-ticket-tarjeta">
            <h2 class="detalle-ticket-seccion" style="display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Chat con el Técnico Asignado</span>
            </h2>
            <p style="margin: 0 0 14px; font-size: 13px; color: #556980;">
              Comunícate de forma directa con el área técnica encargada de tu caso.
            </p>

            <p v-if="!ticket.comentarios || ticket.comentarios.length === 0" class="chat-vacio-aviso">
              No hay mensajes aún en este ticket. Si tienes dudas o información adicional, puedes escribir abajo.
            </p>

            <div v-else class="detalle-ticket-comentarios-lista">
              <div
                v-for="c in ticket.comentarios"
                :key="c.id_comentario"
                class="comentario-burbuja"
                :class="{
                  'burbuja-tecnico': (c.rolAutor || c.rol || '').toLowerCase() === 'tecnico',
                  'burbuja-cliente': (c.rolAutor || c.rol || '').toLowerCase() !== 'tecnico',
                }"
              >
                <div class="comentario-header-row">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span
                      class="comentario-badge-rol"
                      :class="{
                        'rol-tecnico': (c.rolAutor || c.rol || '').toLowerCase() === 'tecnico',
                        'rol-cliente': (c.rolAutor || c.rol || '').toLowerCase() !== 'tecnico',
                      }"
                      style="display: inline-flex; align-items: center; gap: 4px;"
                    >
                      <svg v-if="(c.rolAutor || c.rol || '').toLowerCase() === 'tecnico'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                      </svg>
                      <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>{{ (c.rolAutor || c.rol || '').toLowerCase() === 'tecnico' ? 'Soporte Técnico' : 'Tú' }}</span>
                    </span>
                    <span class="comentario-autor-nombre">
                      {{ c.autor || c.usuario_nombre }}
                    </span>
                  </div>
                  <span class="comentario-fecha-text">
                    {{ formatearFecha(c.fecha_creacion) }}
                  </span>
                </div>
                <p class="comentario-contenido-text">{{ c.contenido }}</p>
              </div>
            </div>

            <!-- Formulario para agregar comentario -->
            <form v-if="ticket.estado !== 'Cerrado'" @submit.prevent="handleEnviarComentario" class="detalle-ticket-form-comentario">
              <textarea
                class="detalle-ticket-textarea-comentario"
                rows="3"
                placeholder="Escribe un mensaje o consulta sobre este ticket…"
                v-model="nuevoComentario"
                :disabled="enviandoComentario"
              ></textarea>
              <p v-if="errorComentario" style="color: #dc2626; font-size: 13px; margin: 0;">{{ errorComentario }}</p>
              <button
                type="submit"
                class="detalle-ticket-btn-enviar-comentario"
                :disabled="enviandoComentario || !nuevoComentario.trim()"
              >
                {{ enviandoComentario ? 'Enviando…' : 'Enviar mensaje' }}
              </button>
            </form>
          </div>

          <!-- Historial -->
          <div class="detalle-ticket-tarjeta detalle-ticket-historial">
            <h2 class="detalle-ticket-seccion">Historial de cambios</h2>
            <p v-if="!ticket.historial || ticket.historial.length === 0" class="detalle-ticket-vacio">
              Sin historial registrado.
            </p>
            <ol v-else class="detalle-ticket-timeline">
              <li v-for="h in ticket.historial" :key="h.id_historial" class="detalle-ticket-timeline-item">
                <div class="detalle-ticket-timeline-punto"></div>
                <div class="detalle-ticket-timeline-contenido">
                  <p class="detalle-ticket-timeline-accion">
                    <strong>{{ h.tipo_accion }}</strong>
                    <span v-if="h.estado_nuevo" class="detalle-ticket-timeline-estado">
                      → {{ h.estado_nuevo === 'En_Proceso' ? 'En proceso' : h.estado_nuevo }}
                    </span>
                  </p>
                  <p class="detalle-ticket-timeline-detalle">{{ h.detalles }}</p>
                  <p class="detalle-ticket-timeline-meta">
                    {{ h.nombre_usuario }} · {{ formatearFecha(h.fecha_accion) }}
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Layout from '../../components/Layout.vue';
import EstadoBadge from '../../components/EstadoBadge.vue';
import SeccionAdjuntos from '../../components/SeccionAdjuntos.vue';
import { useAuth } from '../../context/useAuth';
import { obtenerTicket, comentar } from '../../services/ticketsService';
import './DetalleTicketCliente.css';

const COLOR_PRIORIDAD = {
  Critica: '#ef4444',
  Alta: '#f59e0b',
  Media: '#0284c7',
  Baja: '#64748b',
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
          minute: '2-digit',
        });
  } catch {
    return fechaStr;
  }
}

const route = useRoute();
const router = useRouter();
const { sesion } = useAuth();

const id = computed(() => route.params.id);
const ticket = ref(null);
const cargando = ref(true);
const nuevoComentario = ref('');
const enviandoComentario = ref(false);
const errorComentario = ref('');

const cargarTicket = async () => {
  try {
    const data = await obtenerTicket(id.value);
    ticket.value = data;
  } catch {
    ticket.value = null;
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  cargarTicket();
});

const colorPrioridad = computed(() => {
  return COLOR_PRIORIDAD[ticket.value?.prioridad] || '#64748b';
});

const yaCalificado = computed(() => Boolean(ticket.value?.calificacion));
const puedeCalificar = computed(() => {
  const est = ticket.value?.estado;
  return (est === 'Resuelto' || est === 'Cerrado') && !yaCalificado.value;
});

const handleEnviarComentario = async () => {
  if (!nuevoComentario.value.trim() || !ticket.value) return;

  errorComentario.value = '';
  enviandoComentario.value = true;
  try {
    await comentar(ticket.value.id_ticket, {
      contenido: nuevoComentario.value.trim(),
      es_nota_interna: false,
    });
    nuevoComentario.value = '';
    await cargarTicket();
  } catch (err) {
    errorComentario.value = err.message || 'No se pudo enviar el comentario';
  } finally {
    enviandoComentario.value = false;
  }
};
</script>

<style scoped>
.calificacion-box {
  margin-top: 24px;
  padding: 18px;
  border-radius: var(--radio-tarjeta, 14px);
  background-color: #fefce8;
  border: 1px solid #fef08a;
}

.calificacion-titulo {
  margin: 0 0 8px 0;
  font-size: 0.95rem;
  color: #854d0e;
  font-weight: 700;
}

.calificacion-estrellas {
  margin: 0 0 6px 0;
  font-size: 1.25rem;
  color: #eab308;
}

.calificacion-comentario {
  margin: 0;
  font-size: 0.88rem;
  color: #713f12;
  font-style: italic;
}

.solucion-box {
  margin-top: 24px;
  padding: 18px;
  border-radius: var(--radio-tarjeta, 14px);
  background-color: #e6f9f6;
  border: 1px solid #9ee7dc;
}

.solucion-titulo {
  margin: 0 0 8px 0;
  font-size: 0.95rem;
  color: #007a6c;
  font-weight: 700;
}

.solucion-texto {
  margin: 0;
  font-size: 0.88rem;
  color: #083b35;
  line-height: 1.5;
}

.chat-vacio-aviso {
  color: #556980;
  font-size: 0.88rem;
  text-align: center;
  margin: 20px 0;
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 10px;
  border: 1px dashed var(--color-borde, #e2ebf1);
}

.comentario-burbuja {
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.burbuja-tecnico {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
}

.burbuja-cliente {
  background-color: #ffffff;
  border: 1px solid var(--color-borde, #e2ebf1);
}

.comentario-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.comentario-badge-rol {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
}

.rol-tecnico {
  background-color: #dbeafe;
  color: #1e40af;
}

.rol-cliente {
  background-color: #e6f9f6;
  color: #007a6c;
}

.comentario-autor-nombre {
  font-weight: 700;
  color: var(--color-texto-principal, #072137);
  font-size: 0.85rem;
}

.comentario-fecha-text {
  font-size: 0.75rem;
  color: #8ca3ba;
}

.comentario-contenido-text {
  color: var(--color-texto-principal, #072137);
  line-height: 1.5;
  font-size: 0.88rem;
  margin: 0;
}
</style>
