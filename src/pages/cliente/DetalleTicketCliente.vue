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
      >
        ← Volver a Mis Tickets
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
        >
          ← Mis tickets
        </button>
        <div class="detalle-ticket-cabecera-derecha">
          <EstadoBadge :estado="ticket.estado" />
          <button
            v-if="puedeCalificar"
            type="button"
            id="btn-calificar"
            class="detalle-ticket-btn-calificar"
            @click="router.push(`/cliente/tickets/${ticket.id_ticket}/calificar`)"
          >
            ★ Calificar atención
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
                :style="{ color: colorPrioridad }"
              >
                ● {{ ticket.prioridad }}
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
            <h3 class="calificacion-titulo">
              ★ Calificación registrada
            </h3>
            <p class="calificacion-estrellas">
              {{ '★'.repeat(ticket.calificacion.puntuacion || 0) }}{{ '☆'.repeat(5 - (ticket.calificacion.puntuacion || 0)) }}
            </p>
            <p v-if="ticket.calificacion.comentario" class="calificacion-comentario">
              "{{ ticket.calificacion.comentario }}"
            </p>
          </div>

          <!-- Informe de cierre del técnico -->
          <div v-if="ticket.reporte" class="solucion-box">
            <h3 class="solucion-titulo">
              ✔ Solución aplicada por el técnico
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
            <h2 class="detalle-ticket-seccion">💬 Chat con el Técnico Asignado</h2>
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
                    >
                      {{ (c.rolAutor || c.rol || '').toLowerCase() === 'tecnico' ? '🛠️ Soporte Técnico' : '👤 Tú' }}
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
