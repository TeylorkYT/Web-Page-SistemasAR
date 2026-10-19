<template>
  <Layout
    rol="tecnico"
    item-activo="tickets-asignados"
    :nombre-usuario="nombreParaMostrar"
  >
    <div v-if="cargandoTicket" style="text-align: center; padding: 50px 20px; color: #556980;">
      Cargando información del ticket...
    </div>

    <div v-else class="avance-tecnico-contenedor">
      <!-- Encabezado -->
      <header class="avance-tecnico-header">
        <div>
          <h1 class="avance-tecnico-titulo">Registrar Avance de Soporte Técnico</h1>
          <p class="avance-tecnico-subtitulo">
            Añade notas de diagnóstico, reparación y actualiza el progreso en la bitácora del ticket.
          </p>
        </div>
        <div>
          <button
            type="button"
            class="btn btn-secundario"
            @click="router.push(`/tecnico/tickets/${id}`)"
            style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 6px; font-weight: 500; font-size: 0.9rem; cursor: pointer; border: 1px solid #cbd5e1; background: #fff;"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Volver al Ticket</span>
          </button>
        </div>
      </header>

      <!-- Tarjeta de Referencia del Ticket -->
      <section v-if="ticket" class="ticket-resumen-banner">
        <div class="resumen-ticket-info">
          <span class="ticket-id-tag" style="font-size: 1rem;">
            Ticket #{{ ticket.id_ticket }}
          </span>
          <span class="resumen-ticket-titulo">{{ ticket.titulo }}</span>
        </div>
        <div>
          <EstadoBadge :estado="ticket.estado" />
        </div>
      </section>

      <!-- Notificación de Éxito -->
      <div v-if="mensajeExito" class="alerta-formulario exito" role="status" style="display: flex; align-items: center; gap: 8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>{{ mensajeExito }} Redirigiendo al detalle...</span>
      </div>

      <!-- Formulario -->
      <section class="avance-formulario-card">
        <form @submit.prevent="manejarEnvio" no-validate>
          <!-- Tipo de Acción -->
          <div class="grupo-campo">
            <label for="tipo-accion">Tipo de Acción / Avance *</label>
            <div class="campo-descripcion">
              Selecciona la categoría del trabajo realizado sobre el equipo o servicio.
            </div>
            <select
              id="tipo-accion"
              class="avance-select"
              v-model="tipoAccion"
              :disabled="guardando"
            >
              <option value="Diagnostico">Diagnóstico y Pruebas</option>
              <option value="Reparacion">Reparación / Corrección Técnica</option>
              <option value="Mantenimiento">Mantenimiento Preventivo / Limpieza</option>
              <option value="Comentario">Nota Informativa / Seguimiento</option>
            </select>
          </div>

          <!-- Nuevo Estado Opcional -->
          <div class="grupo-campo">
            <label for="nuevo-estado">Actualizar Estado del Ticket (Opcional)</label>
            <div class="campo-descripcion">
              Puedes cambiar el estado del ticket inmediatamente al guardar este avance.
            </div>
            <select
              id="nuevo-estado"
              class="avance-select"
              v-model="nuevoEstado"
              :disabled="guardando"
            >
              <option value="Abierto">Abierto</option>
              <option value="En_Proceso">En Proceso (Trabajo en curso)</option>
              <option value="Resuelto">Resuelto (Problema solucionado satisfactoriamente)</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>

          <!-- Detalles del Avance -->
          <div class="grupo-campo">
            <label for="detalles-avance">Descripción Detallada del Avance *</label>
            <div class="campo-descripcion">
              Describe con precisión qué acciones técnicas realizaste, componentes inspeccionados o resultados de pruebas.
            </div>
            <textarea
              id="detalles-avance"
              class="avance-textarea"
              placeholder="Ejemplo: Se realizó desarme preventivo, limpieza del sistema de refrigeración y cambio de pasta térmica. El equipo superó la prueba de estrés de temperatura sin fallas."
              v-model="detalles"
              :disabled="guardando"
              @input="errorValidacion = ''"
            ></textarea>
            <div v-if="errorValidacion" class="campo-error-mensaje" style="display: flex; align-items: center; gap: 6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{{ errorValidacion }}</span>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="acciones-formulario">
            <Boton
              variante="secundario"
              type="button"
              @click="router.push(`/tecnico/tickets/${id}`)"
              :deshabilitado="guardando"
              texto="Cancelar"
            />
            <button
              class="btn-submit-avance"
              type="submit"
              :disabled="guardando"
              style="display: inline-flex; align-items: center; gap: 8px; background: var(--color-primario, #00bba6); color: white; border: none; border-radius: 6px; padding: 10px 20px; font-weight: 600; cursor: pointer; font-size: 0.95rem;"
            >
              <svg v-if="!guardando" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>{{ guardando ? 'Guardando avance...' : 'Guardar Avance Técnico' }}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Layout from '../../components/Layout.vue';
import Boton from '../../components/Boton.vue';
import EstadoBadge from '../../components/EstadoBadge.vue';
import { useAuth } from '../../context/useAuth';
import {
  obtenerDetalleTicket,
  registrarAvance,
  obtenerTecnicoActual,
} from '../../services/tecnicoService';
import './ActualizarAvance.css';

const route = useRoute();
const router = useRouter();
const { sesion } = useAuth();

const id = computed(() => route.params.id);
const tecnico = ref(null);
const ticket = ref(null);
const cargandoTicket = ref(true);

const tipoAccion = ref('Reparacion');
const detalles = ref('');
const nuevoEstado = ref('');
const errorValidacion = ref('');
const guardando = ref(false);
const mensajeExito = ref('');

onMounted(async () => {
  try {
    obtenerTecnicoActual().then((datos) => (tecnico.value = datos));
    const datos = await obtenerDetalleTicket(id.value);
    ticket.value = datos;
    nuevoEstado.value = datos.estado;
  } catch (err) {
    console.error('Error al cargar ticket:', err);
  } finally {
    cargandoTicket.value = false;
  }
});

const nombreParaMostrar = computed(() => {
  return (
    sesion.value?.nombre ||
    (tecnico.value ? `${tecnico.value.nombre} ${tecnico.value.apellido}` : 'Técnico')
  );
});

const manejarEnvio = async () => {
  errorValidacion.value = '';
  mensajeExito.value = '';

  if (!detalles.value.trim()) {
    errorValidacion.value = 'Por favor escribe la descripción detallada del trabajo o avance realizado.';
    return;
  }

  if (detalles.value.trim().length < 10) {
    errorValidacion.value = 'El detalle del avance debe contener al menos 10 caracteres explicativos.';
    return;
  }

  guardando.value = true;
  try {
    await registrarAvance(id.value, {
      detalles: detalles.value,
      tipoAccion: tipoAccion.value,
      nuevoEstado: nuevoEstado.value !== ticket.value?.estado ? nuevoEstado.value : null,
    });

    mensajeExito.value = '¡Avance técnico registrado con éxito en el historial del ticket!';
    detalles.value = '';

    setTimeout(() => {
      router.push(`/tecnico/tickets/${id.value}`);
    }, 1500);
  } catch (err) {
    errorValidacion.value = err.message || 'Ocurrió un error al guardar el avance.';
  } finally {
    guardando.value = false;
  }
};
</script>
