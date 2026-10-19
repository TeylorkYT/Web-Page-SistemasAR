<template>
  <Layout
    rol="administrador"
    item-activo="calificaciones"
    :nombre-usuario="sesion?.nombre || 'Administrador'"
  >
    <div class="calificaciones-pagina">
      <header class="calificaciones-header-principal">
        <div>
          <h1 class="calificaciones-titulo-principal">Supervisión de Calificaciones</h1>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 0.95rem;">
            Auditoría de satisfacción y alertas de servicio técnico (Documento Definitivo v2.0)
          </p>
        </div>
      </header>

      <div
        v-if="alerta"
        :class="['calificaciones-alerta', `calificaciones-alerta-${alerta.tipo}`]"
      >
        <span>{{ alerta.mensaje }}</span>
        <button
          type="button"
          class="calificaciones-alerta-cerrar"
          aria-label="Cerrar notificación"
          @click="alerta = null"
        >
          ×
        </button>
      </div>

      <!-- 1. BARRA DE FILTROS SUPERIOR -->
      <section class="seccion-filtros-calificaciones" aria-label="Filtros de calificaciones">
        <div class="filtros-contenedor-flex" style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
          <!-- Filtro: Técnico -->
          <div class="filtro-caja-select">
            <span class="filtro-icono" style="display: flex; align-items: center;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <select
              v-model="filtroTecnico"
              class="filtro-select-nativo"
              aria-label="Filtrar por técnico"
              @change="paginaActual = 1"
            >
              <option value="todos">[Todos los técnicos]</option>
              <option v-for="tec in tecnicosLista" :key="tec.id_tecnico" :value="tec.nombre">
                {{ tec.nombre }}
              </option>
            </select>
          </div>

          <!-- Filtro: Rango de Fechas -->
          <div class="filtro-caja-select">
            <span class="filtro-icono" style="display: flex; align-items: center;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </span>
            <select
              v-model="filtroRango"
              class="filtro-select-nativo"
              aria-label="Filtrar por rango de tiempo"
              @change="alCambiarFiltroRango"
            >
              <option value="todos">Todo el historial</option>
              <option value="este_mes">Agosto 2026</option>
            </select>
          </div>

          <!-- Selector de Fechas Personalizadas -->
          <div style="display: flex; gap: 6px; align-items: center; font-size: 0.85rem; color: #475569;">
            <span>Desde:</span>
            <input
              v-model="fechaInicio"
              type="date"
              style="padding: 6px 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.85rem;"
              @change="paginaActual = 1"
            />
            <span>Hasta:</span>
            <input
              v-model="fechaFin"
              type="date"
              style="padding: 6px 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.85rem;"
              @change="paginaActual = 1"
            />
          </div>

          <!-- Filtro: Puntaje de 1 a 5 -->
          <div class="filtro-caja-select">
            <span class="filtro-icono" style="display: flex; align-items: center; color: #f59e0b;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </span>
            <select
              v-model="filtroPuntaje"
              class="filtro-select-nativo"
              aria-label="Filtrar por puntaje"
              @change="paginaActual = 1"
            >
              <option value="todos">[Todos los puntajes]</option>
              <option value="5">5 estrellas (Excelente)</option>
              <option value="4">4 estrellas (Muy bueno)</option>
              <option value="3">3 estrellas (Aceptable)</option>
              <option value="2">2 estrellas (Deficiente - Alerta)</option>
              <option value="1">1 estrella (Crítico - Alerta)</option>
            </select>
          </div>
        </div>
      </section>

      <!-- 2. MÉTRICAS DE SATISFACCIÓN (3 Tarjetas) -->
      <section class="seccion-metricas-satisfaccion" aria-label="Métricas de satisfacción">
        <h2 class="metricas-titulo">Métricas de satisfacción</h2>

        <div class="metricas-cards-grid">
          <div class="tarjeta-satisfaccion">
            <div class="icono-caja-satisfaccion estrella" style="display: flex; align-items: center; justify-content: center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div class="satisfaccion-info">
              <span class="satisfaccion-label">Promedio general</span>
              <span class="satisfaccion-valor">
                <span class="valor-verde">{{ metricas.promedioGeneral }}</span>/5
              </span>
            </div>
          </div>

          <div class="tarjeta-satisfaccion">
            <div class="icono-caja-satisfaccion trofeo" style="display: flex; align-items: center; justify-content: center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                <path d="M4 22h16"></path>
                <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"></path>
                <path d="M6 4h12v7a6 6 0 0 1-12 0V4z"></path>
              </svg>
            </div>
            <div class="satisfaccion-info">
              <span class="satisfaccion-label">Mejor valorado</span>
              <span class="satisfaccion-valor">
                <span class="valor-morado">
                  {{ metricas.mejorValorado.nombre }} ({{ metricas.mejorValorado.promedio }}/5)
                </span>
              </span>
            </div>
          </div>

          <div class="tarjeta-satisfaccion">
            <div class="icono-caja-satisfaccion alerta" style="display: flex; align-items: center; justify-content: center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div class="satisfaccion-info">
              <span class="satisfaccion-label">Alertas de baja calificación</span>
              <span class="satisfaccion-valor">
                <span class="valor-rojo">
                  {{ metricas.alertasBajaCalif }} ticket(s) ≤ 2 estrellas
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. HISTORIAL DE CALIFICACIONES (Tabla) -->
      <section class="seccion-historial-calificaciones" aria-label="Historial de calificaciones">
        <h2 class="historial-titulo">Historial de calificaciones ({{ calificacionesFiltradas.length }})</h2>

        <div class="tabla-calificaciones-contenedor">
          <table class="tabla-calificaciones">
            <thead>
              <tr>
                <th scope="col">Ticket</th>
                <th scope="col">Técnico</th>
                <th scope="col">Calif.</th>
                <th scope="col">Comentario</th>
                <th scope="col">Fecha</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="cargando">
                <td colspan="6" style="text-align: center; padding: 28px;">
                  Cargando historial de calificaciones...
                </td>
              </tr>
              <tr v-else-if="calificacionesFiltradas.length === 0">
                <td colspan="6" style="text-align: center; padding: 28px; color: #64748b;">
                  No se encontraron calificaciones con los filtros seleccionados.
                </td>
              </tr>
              <tr
                v-for="item in calificacionesPaginadas"
                v-else
                :key="item.id_calificacion"
              >
                <td>
                  <span class="ticket-codigo-texto">{{ item.codigo_ticket }}</span>
                </td>
                <td>{{ item.tecnico }}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 2px;">
                    <svg
                      v-for="n in 5"
                      :key="n"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      :fill="n <= item.puntuacion ? (item.puntuacion <= 2 || item.esAlerta ? '#dc2626' : '#f59e0b') : '#e2e8f0'"
                      :stroke="n <= item.puntuacion ? (item.puntuacion <= 2 || item.esAlerta ? '#dc2626' : '#f59e0b') : '#cbd5e1'"
                      stroke-width="1"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </div>
                </td>
                <td>
                  <span :class="['comentario-texto', { alerta: item.puntuacion <= 2 || item.esAlerta }]">
                    {{ item.comentario_resumen }}
                  </span>
                </td>
                <td style="font-size: 0.85rem; color: #64748b;">
                  {{ item.fecha }}
                </td>
                <td>
                  <button
                    type="button"
                    class="boton-engranaje-accion"
                    title="Ver detalle del feedback"
                    :aria-label="`Ver detalles del ticket ${item.codigo_ticket}`"
                    @click="abrirDetalleModal(item)"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div v-if="totalPaginas > 1" class="paginacion-contenedor">
          <button
            type="button"
            class="paginacion-boton"
            :disabled="paginaActual === 1"
            @click="paginaActual = Math.max(1, paginaActual - 1)"
          >
            Anterior
          </button>
          <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>
          <button
            type="button"
            class="paginacion-boton"
            :disabled="paginaActual === totalPaginas"
            @click="paginaActual = Math.min(totalPaginas, paginaActual + 1)"
          >
            Siguiente
          </button>
        </div>
      </section>

      <!-- 4. MODAL: DETALLE DE CALIFICACIÓN -->
      <div v-if="ticketModal" class="modal-superposicion" @click="ticketModal = null">
        <div
          class="modal-detalle-ticket-contenedor"
          style="max-width: 600px;"
          @click.stop
        >
          <div class="modal-header-detalle">
            <h3 class="modal-titulo-detalle">
              Detalle del ticket #{{ ticketModal.codigo_ticket }}
            </h3>
            <button
              type="button"
              class="modal-boton-cerrar"
              aria-label="Cerrar modal"
              @click="ticketModal = null"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-cuerpo-detalle">
            <div class="modal-grid-datos">
              <div class="modal-dato-fila">
                <span class="modal-dato-clave">Técnico evaluado:</span>
                <span class="modal-dato-valor">{{ ticketModal.tecnico }}</span>
              </div>

              <div class="modal-dato-fila">
                <span class="modal-dato-clave">Cliente:</span>
                <span class="modal-dato-valor">
                  {{ ticketModal.cliente }} (contacto: {{ ticketModal.contacto || "N/A" }})
                </span>
              </div>

              <div class="modal-dato-fila">
                <span class="modal-dato-clave">Calificación:</span>
                <span :class="['modal-dato-valor', { 'modal-calif-roja': ticketModal.puntuacion <= 2 }]" style="display: inline-flex; align-items: center; gap: 4px;">
                  <span style="display: inline-flex; align-items: center; gap: 2px;">
                    <svg
                      v-for="n in 5"
                      :key="n"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      :fill="n <= ticketModal.puntuacion ? (ticketModal.puntuacion <= 2 ? '#dc2626' : '#f59e0b') : '#e2e8f0'"
                      :stroke="n <= ticketModal.puntuacion ? (ticketModal.puntuacion <= 2 ? '#dc2626' : '#f59e0b') : '#cbd5e1'"
                      stroke-width="1"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </span>
                  <span>({{ ticketModal.puntuacion }}/5)</span>
                </span>
              </div>

              <div class="modal-dato-fila">
                <span class="modal-dato-clave">Fecha de calificación:</span>
                <span class="modal-dato-valor">{{ ticketModal.fecha_calificacion }}</span>
              </div>
            </div>

            <div class="modal-bloque-comentario">
              <h4 class="modal-comentario-titulo">Comentario íntegro del cliente</h4>
              <p class="modal-comentario-caja">
                {{ ticketModal.comentario_completo }}
              </p>
            </div>

            <div
              v-if="correoEnviado"
              style="margin-top: 12px; padding: 10px 14px; background: #ecfdf5; color: #065f46; border-radius: 6px; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Correo de seguimiento enviado exitosamente al cliente ({{ ticketModal.correo_cliente || ticketModal.contacto }}).</span>
            </div>

            <!-- Historial completo del ticket -->
            <div v-if="mostrarHistorial" style="margin-top: 18px; border-top: 1px solid #e2e8f0; paddingTop: 14px;">
              <h4 style="margin: 0 0 10px 0; font-size: 0.95rem; color: #1e293b; font-weight: 700;">
                Historial completo de auditoría (Historial_Ticket)
              </h4>
              <p v-if="cargandoHistorial" style="color: #64748b; font-size: 0.85rem;">Cargando eventos de auditoría...</p>
              <p v-else-if="historialTicket.length === 0" style="color: #64748b; font-size: 0.85rem;">
                No se encontraron registros de auditoría para este ticket.
              </p>
              <div v-else style="display: flex; flex-direction: column; gap: 8px; max-height: 180px; overflow-y: auto;">
                <div
                  v-for="h in historialTicket"
                  :key="h.id_historial"
                  style="padding: 8px 10px; background-color: #f8fafc; border-radius: 6px; border-left: 3px solid var(--color-primario, #00bba6); font-size: 0.8rem;"
                >
                  <div style="display: flex; justify-content: space-between; font-weight: 600; color: #0f172a;">
                    <span>[{{ h.tipo_accion }}] {{ h.estado_nuevo ? `→ ${h.estado_nuevo}` : "" }}</span>
                    <span style="color: #64748b; font-size: 0.75rem;">{{ h.fecha_accion }}</span>
                  </div>
                  <div style="color: #475569; margin-top: 2px;">{{ h.detalles }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer-detalle">
            <button
              type="button"
              class="boton-modal-historial"
              @click="cargarHistorial"
            >
              {{ mostrarHistorial ? "Refrescar historial" : "Ver historial completo del ticket" }}
            </button>

            <button
              type="button"
              class="boton-modal-correo"
              style="background: linear-gradient(135deg, var(--color-primario, #00bba6) 0%, var(--color-primario-oscuro, #008f7e) 100%); color: white; border: none; border-radius: 8px; font-weight: 700;"
              @click="manejarEnviarCorreo"
            >
              Enviar correo al cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import Layout from '../../components/Layout.vue';
import { useAuth } from '../../context/useAuth';
import {
  obtenerCalificacionesSupervision,
  obtenerMetricasSatisfaccion,
  enviarCorreoSeguimientoCliente,
  obtenerHistorialTicketCalificacion,
  obtenerTecnicosParaAsignar
} from '../../services/adminService';
import './CalificacionesRecibidas.css';

const { sesion } = useAuth();

const calificaciones = ref([]);
const tecnicosLista = ref([]);
const metricas = ref({
  promedioGeneral: '0.0',
  mejorValorado: { nombre: '...', promedio: '0.0' },
  alertasBajaCalif: 0
});

const filtroTecnico = ref('todos');
const filtroRango = ref('todos');
const fechaInicio = ref('');
const fechaFin = ref('');
const filtroPuntaje = ref('todos');

const cargando = ref(true);
const alerta = ref(null);
const ticketModal = ref(null);
const historialTicket = ref([]);
const cargandoHistorial = ref(false);
const mostrarHistorial = ref(false);
const correoEnviado = ref(false);
const paginaActual = ref(1);

const elementosPorPagina = 5;

const mostrarAlerta = (tipo, mensaje) => {
  alerta.value = { tipo, mensaje };
  setTimeout(() => {
    alerta.value = null;
  }, 4500);
};

const cargarDatos = async () => {
  try {
    const [listaCalif, datosMetricas] = await Promise.all([
      obtenerCalificacionesSupervision({
        tecnico: filtroTecnico.value,
        rango: filtroRango.value,
        fechaInicio: fechaInicio.value || undefined,
        fechaFin: fechaFin.value || undefined,
        puntaje: filtroPuntaje.value
      }),
      obtenerMetricasSatisfaccion()
    ]);
    calificaciones.value = listaCalif;
    metricas.value = datosMetricas;
  } catch (err) {
    mostrarAlerta('error', 'Error al cargar calificaciones: ' + err.message);
  } finally {
    cargando.value = false;
  }
};

onMounted(async () => {
  try {
    const lista = await obtenerTecnicosParaAsignar();
    tecnicosLista.value = lista;
  } catch (e) {
    console.error(e);
  }
  await cargarDatos();
});

watch([filtroTecnico, filtroRango, fechaInicio, fechaFin, filtroPuntaje], () => {
  cargarDatos();
});

const alCambiarFiltroRango = () => {
  fechaInicio.value = '';
  fechaFin.value = '';
  paginaActual.value = 1;
};

const abrirDetalleModal = (item) => {
  ticketModal.value = item;
  mostrarHistorial.value = false;
  historialTicket.value = [];
  correoEnviado.value = false;
};

const cargarHistorial = async () => {
  if (!ticketModal.value) return;
  cargandoHistorial.value = true;
  mostrarHistorial.value = true;
  try {
    const filas = await obtenerHistorialTicketCalificacion(ticketModal.value.id_ticket);
    historialTicket.value = filas;
  } catch (err) {
    mostrarAlerta('error', 'Error al cargar historial: ' + err.message);
  } finally {
    cargandoHistorial.value = false;
  }
};

const manejarEnviarCorreo = async () => {
  if (!ticketModal.value) return;
  try {
    const respuesta = await enviarCorreoSeguimientoCliente(
      ticketModal.value.id_ticket,
      ticketModal.value.contacto
    );
    correoEnviado.value = true;
    mostrarAlerta('exito', respuesta.mensaje);
  } catch (err) {
    mostrarAlerta('error', 'Error al enviar correo: ' + err.message);
  }
};

const calificacionesFiltradas = computed(() => {
  return calificaciones.value.filter((item) => {
    if (filtroTecnico.value && filtroTecnico.value !== 'todos') {
      const valor = filtroTecnico.value.trim().toLowerCase();
      const coincideNombre = item.tecnico && item.tecnico.toLowerCase().includes(valor);
      const coincideId = String(item.id_tecnico) === valor;
      if (!coincideNombre && !coincideId) return false;
    }
    if (filtroPuntaje.value && filtroPuntaje.value !== 'todos') {
      if (item.puntuacion !== Number(filtroPuntaje.value)) return false;
    }
    if (fechaInicio.value && item.fecha && item.fecha < fechaInicio.value) return false;
    if (fechaFin.value && item.fecha && item.fecha > fechaFin.value) return false;
    return true;
  });
});

const totalPaginas = computed(() => {
  return Math.ceil(calificacionesFiltradas.value.length / elementosPorPagina) || 1;
});

const calificacionesPaginadas = computed(() => {
  const indiceUltimo = paginaActual.value * elementosPorPagina;
  const indicePrimero = indiceUltimo - elementosPorPagina;
  return calificacionesFiltradas.value.slice(indicePrimero, indiceUltimo);
});
</script>
