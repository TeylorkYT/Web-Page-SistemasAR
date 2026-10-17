<template>
  <Layout rol="cliente" item-activo="mis-tickets" :nombre-usuario="sesion?.nombre">
    <div v-if="cargando" style="text-align: center; padding: 40px 0; color: #556980;">
      Cargando información del ticket…
    </div>

    <div v-else-if="!ticket" style="text-align: center; padding: 40px 0;">
      <p style="color: #dc2626; font-size: 16px; font-weight: bold;">Ticket no encontrado.</p>
      <button type="button" class="calificar-btn-volver" @click="router.push('/cliente/tickets')">
        ← Mis tickets
      </button>
    </div>

    <!-- Si ya tiene una calificación registrada -->
    <div v-else-if="ticket.calificacion">
      <div class="calificar-cabecera">
        <button type="button" id="btn-volver-detalle" class="calificar-btn-volver" @click="volverAlDetalle">
          ← Volver al ticket
        </button>
      </div>
      <div class="calificar-tarjeta" style="text-align: center;">
        <h1 class="calificar-titulo">Ticket ya calificado</h1>
        <p class="calificar-subtitulo">
          Ticket <strong>#{{ ticket.id_ticket }}</strong> · Ya has enviado tu opinión sobre esta atención.
        </p>
        <div style="margin: 24px 0; padding: 20px; background: #fefce8; border-radius: 10px; border: 1px solid #fef08a;">
          <div style="fontSize: 28px; color: #eab308; margin-bottom: 8px;">
            {{ '★'.repeat(ticket.calificacion.puntuacion || 0) }}{{ '☆'.repeat(5 - (ticket.calificacion.puntuacion || 0)) }}
          </div>
          <p v-if="ticket.calificacion.comentario" style="font-style: italic; color: #713f12; margin: 0;">
            "{{ ticket.calificacion.comentario }}"
          </p>
        </div>
        <button
          type="button"
          class="calificar-btn-volver"
          style="display: inline-block;"
          @click="router.push('/cliente/tickets')"
        >
          Volver al listado de tickets
        </button>
      </div>
    </div>

    <!-- Si no está en estado Resuelto (ni Cerrado) -->
    <div v-else-if="ticket.estado !== 'Resuelto' && ticket.estado !== 'Cerrado'">
      <div class="calificar-cabecera">
        <button type="button" id="btn-volver-detalle" class="calificar-btn-volver" @click="volverAlDetalle">
          ← Volver al ticket
        </button>
      </div>
      <div class="calificar-tarjeta" style="text-align: center;">
        <h1 class="calificar-titulo" style="color: #0369a1;">Atención en curso</h1>
        <p style="color: #556980; font-size: 15px; line-height: 1.6; margin: 16px 0 24px;">
          Este ticket se encuentra actualmente en estado <strong>{{ ticket.estado.replace('_', ' ') }}</strong>.<br />
          Solo podrás calificar el servicio una vez que el técnico haya aplicado la solución y el ticket pase a estado <strong>Resuelto</strong>.
        </p>
        <button
          type="button"
          class="calificar-btn-volver"
          style="display: inline-block;"
          @click="volverAlDetalle"
        >
          ← Volver a los detalles del ticket
        </button>
      </div>
    </div>

    <!-- Formulario para calificar -->
    <div v-else>
      <div class="calificar-cabecera">
        <button
          type="button"
          id="btn-volver-detalle"
          class="calificar-btn-volver"
          @click="volverAlDetalle"
        >
          ← Volver al ticket
        </button>
      </div>

      <div class="calificar-tarjeta">
        <h1 class="calificar-titulo">Calificar atención</h1>
        <p class="calificar-subtitulo">
          Ticket <strong>#{{ id }}</strong> · Tu opinión nos ayuda a mejorar.
        </p>

        <p class="calificar-aviso">
          La calificación es <strong>opcional</strong>. Puedes omitirla si lo prefieres.
        </p>

        <form id="form-calificar" @submit.prevent="handleEnviar" no-validate>
          <!-- Estrellas -->
          <div class="calificar-campo">
            <label class="calificar-label">Puntuación</label>
            <div
              class="calificar-estrellas"
              role="radiogroup"
              aria-label="Puntuación de 1 a 5 estrellas"
              @mouseleave="hover = 0"
            >
              <button
                v-for="n in 5"
                :key="n"
                :id="`estrella-${n}`"
                type="button"
                class="calificar-estrella"
                :class="{ activa: n <= estrellaActiva }"
                :aria-label="`${n} estrella${n > 1 ? 's' : ''}`"
                @click="puntuacion = n"
                @mouseenter="hover = n"
              >
                ★
              </button>
            </div>
            <p v-if="puntuacion > 0" class="calificar-puntuacion-texto">
              {{ ['', 'Muy malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'][puntuacion] }}
            </p>
          </div>

          <!-- Comentario (opcional) -->
          <div class="calificar-campo">
            <label for="campo-comentario" class="calificar-label">
              Comentario <span class="calificar-opcional">(opcional)</span>
            </label>
            <textarea
              id="campo-comentario"
              class="calificar-textarea"
              rows="4"
              placeholder="Cuéntanos cómo fue tu experiencia…"
              v-model="comentario"
            ></textarea>
          </div>

          <!-- Mensajes -->
          <p v-if="error" id="msg-error-calificar" class="calificar-error">{{ error }}</p>
          <p v-if="exito" id="msg-exito-calificar" class="calificar-exito">{{ exito }}</p>

          <!-- Acciones -->
          <div class="calificar-acciones">
            <button
              type="button"
              id="btn-omitir-calificacion"
              class="calificar-btn-omitir"
              @click="handleOmitir"
            >
              Omitir calificación
            </button>
            <button
              type="submit"
              id="btn-enviar-calificacion"
              class="calificar-btn-enviar"
              :disabled="enviando"
            >
              {{ enviando ? 'Enviando…' : 'Enviar calificación' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Layout from '../../components/Layout.vue';
import { useAuth } from '../../context/useAuth';
import { calificarTicket, obtenerTicket } from '../../services/ticketsService';
import './CalificarTicket.css';

const route = useRoute();
const router = useRouter();
const { sesion } = useAuth();

const id = computed(() => route.params.id);
const ticket = ref(null);
const cargando = ref(true);
const puntuacion = ref(0);
const hover = ref(0);
const comentario = ref('');
const enviando = ref(false);
const exito = ref('');
const error = ref('');

onMounted(() => {
  obtenerTicket(id.value)
    .then((data) => (ticket.value = data))
    .catch(() => (ticket.value = null))
    .finally(() => (cargando.value = false));
});

const volverAlDetalle = () => router.push(`/cliente/tickets/${id.value}`);
const handleOmitir = () => router.push(`/cliente/tickets/${id.value}`);

const estrellaActiva = computed(() => hover.value || puntuacion.value);

const handleEnviar = async () => {
  error.value = '';

  if (puntuacion.value === 0) {
    error.value = 'Selecciona una puntuación antes de enviar.';
    return;
  }

  enviando.value = true;
  try {
    await calificarTicket({
      id_ticket: Number(id.value),
      puntuacion: puntuacion.value,
      comentario: comentario.value.trim(),
    });
    exito.value = '¡Gracias por tu calificación! Redirigiendo…';
    setTimeout(() => router.push('/cliente/tickets'), 1800);
  } catch (err) {
    error.value = err.message || 'No se pudo enviar la calificación. Intenta de nuevo.';
  } finally {
    enviando.value = false;
  }
};
</script>
