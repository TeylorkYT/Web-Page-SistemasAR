<template>
  <Layout
    rol="administrador"
    item-activo="asignacion"
    :nombre-usuario="sesion?.nombre || 'Administrador'"
  >
    <div class="asignar-pagina">
      <header class="asignar-header-principal">
        <h1 class="asignar-titulo-principal">Asignación de Técnico a Ticket</h1>
        <p style="color: #64748b; margin: 4px 0 0 0; font-size: 0.95rem;">
          Bandeja de triaje y balanceo de carga técnica (Documento Definitivo v2.0)
        </p>
      </header>

      <div v-if="alerta" :class="['asignar-alerta', `asignar-alerta-${alerta.tipo}`]">
        <span>{{ alerta.mensaje }}</span>
        <button
          type="button"
          class="asignar-alerta-cerrar"
          aria-label="Cerrar notificación"
          @click="alerta = null"
        >
          ×
        </button>
      </div>

      <div v-if="cargando" class="asignar-vacio">
        <p>Cargando tickets pendientes y técnicos...</p>
      </div>

      <div v-else class="asignar-grid">
        <!-- COLUMNA IZQUIERDA: TICKETS PENDIENTES -->
        <section class="columna-tickets" aria-labelledby="titulo-pendientes">
          <div class="columna-tickets-header">
            <h2 id="titulo-pendientes" class="columna-tickets-titulo">
              Tickets Pendientes ({{ tickets.length }})
            </h2>

            <select
              v-model="filtroPrioridad"
              class="filtro-prioridad-select"
              aria-label="Filtrar por prioridad"
              @change="manejarCambioFiltro(filtroPrioridad)"
            >
              <option value="TODAS">[Todas las prioridades]</option>
              <option value="Critica">Crítica</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>

          <div v-if="tickets.length === 0" class="asignar-vacio">
            <p>No hay tickets pendientes con este filtro de prioridad.</p>
          </div>

          <div v-else class="tickets-pendientes-lista">
            <div
              v-for="tkt in tickets"
              :key="tkt.id_ticket"
              class="tarjeta-ticket-pendiente"
              :class="{ seleccionado: tkt.id_ticket === ticketSeleccionadoId }"
              role="button"
              tabindex="0"
              @click="seleccionarTicket(tkt)"
              @keydown.enter="seleccionarTicket(tkt)"
              @keydown.space.prevent="seleccionarTicket(tkt)"
            >
              <div class="tarjeta-ticket-top">
                <span class="tarjeta-ticket-id">
                  {{ tkt.codigo }}
                </span>
                <span :class="['badge-prioridad', (tkt.prioridad || '').toLowerCase()]">
                  {{ tkt.prioridad }}
                </span>
              </div>

              <div class="tarjeta-ticket-cuerpo">
                <div class="tarjeta-ticket-linea">
                  <svg class="ticket-icono-sutil" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span class="ticket-etiqueta-gris">Cliente:</span>
                  <span class="ticket-valor-destacado">{{ tkt.cliente }}</span>
                </div>

                <div class="tarjeta-ticket-linea">
                  <svg class="ticket-icono-sutil" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <span class="ticket-etiqueta-gris">Título:</span>
                  <span class="ticket-valor-destacado">{{ tkt.titulo }}</span>
                </div>

                <div class="tarjeta-ticket-linea">
                  <svg class="ticket-icono-sutil" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                  </svg>
                  <span class="ticket-etiqueta-gris">Categorías:</span>
                  <span class="ticket-valor-destacado">
                    {{ Array.isArray(tkt.categorias) ? tkt.categorias.join(', ') : tkt.categoria }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- COLUMNA DERECHA: DETALLE DEL TICKET Y ASIGNACIÓN -->
        <section class="columna-detalle" aria-labelledby="titulo-detalle">
          <div class="panel-detalle-asignacion">
            <h2 id="titulo-detalle" class="detalle-header-titulo">
              Detalle y Asignación
            </h2>

            <template v-if="ticketActivo">
              <div class="detalle-datos-tabla">
                <div class="detalle-dato-fila">
                  <span class="detalle-dato-clave">Código:</span>
                  <span class="detalle-dato-valor id-destacado">
                    {{ ticketActivo.codigo }}
                  </span>
                </div>
                <div class="detalle-dato-fila">
                  <span class="detalle-dato-clave">Cliente:</span>
                  <span class="detalle-dato-valor">{{ ticketActivo.cliente }}</span>
                </div>
                <div class="detalle-dato-fila">
                  <span class="detalle-dato-clave">Título:</span>
                  <span class="detalle-dato-valor">{{ ticketActivo.titulo }}</span>
                </div>
                <div class="detalle-dato-fila">
                  <span class="detalle-dato-clave">Categorías:</span>
                  <span class="detalle-dato-valor">
                    {{ Array.isArray(ticketActivo.categorias) ? ticketActivo.categorias.join(', ') : ticketActivo.categoria }}
                  </span>
                </div>
                <div class="detalle-dato-fila">
                  <span class="detalle-dato-clave">Modalidad:</span>
                  <span class="detalle-dato-valor">{{ ticketActivo.modalidad || 'Presencial' }}</span>
                </div>
                <div class="detalle-dato-fila">
                  <span class="detalle-dato-clave">Creación:</span>
                  <span class="detalle-dato-valor">
                    {{ ticketActivo.fecha_creacion }}
                  </span>
                </div>
              </div>

              <div class="detalle-bloque-descripcion">
                <h3 class="detalle-desc-titulo">Descripción de la falla:</h3>
                <p class="detalle-desc-parrafo">
                  {{ ticketActivo.descripcion }}
                </p>
              </div>

              <!-- Ajuste de Prioridad antes de asignar -->
              <div style="margin-top: 18px; padding: 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                <label for="ajuste-prioridad" style="display: block; font-size: 0.9rem; font-weight: 600; color: #334155; margin-bottom: 6px;">
                  Ajustar nivel de prioridad antes de asignar:
                </label>
                <select
                  id="ajuste-prioridad"
                  v-model="prioridadAjustada"
                  style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.95rem; font-weight: 600;"
                >
                  <option value="Critica">Crítica (SLA Urgente)</option>
                  <option value="Alta">Alta</option>
                  <option value="Media">Media (Por defecto)</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>

              <!-- Selector de técnico -->
              <div class="seccion-seleccionar-tecnico">
                <h3 class="seleccionar-tecnico-titulo">Seleccionar Técnico Asignado</h3>

                <div
                  v-if="tecnicoSeleccionado?.alertaCarga"
                  style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #fffbeb; border: 1px solid #fef3c7; color: #b45309; border-radius: 8px; margin-bottom: 12px; font-size: 0.85rem;"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <span><strong>Alerta:</strong> Este técnico ya tiene 5 tickets en proceso simultáneos.</span>
                </div>

                <div class="lista-opciones-tecnicos" role="radiogroup">
                  <div
                    v-for="tec in tecnicos"
                    :key="tec.id_tecnico"
                    :class="[
                      'opcion-tecnico-item',
                      { seleccionado: tec.id_tecnico === tecnicoSeleccionadoId, deshabilitado: tec.deshabilitado }
                    ]"
                    :style="{
                      opacity: tec.deshabilitado ? 0.5 : 1,
                      cursor: tec.deshabilitado ? 'not-allowed' : 'pointer'
                    }"
                    @click="!tec.deshabilitado && (tecnicoSeleccionadoId = tec.id_tecnico)"
                  >
                    <div class="tecnico-radio-contenedor">
                      <input
                        :id="`radio-tecnico-${tec.id_tecnico}`"
                        v-model="tecnicoSeleccionadoId"
                        type="radio"
                        :value="tec.id_tecnico"
                        name="tecnicoSeleccionado"
                        class="tecnico-radio-input"
                        :disabled="tec.deshabilitado"
                      />
                      <label
                        :for="`radio-tecnico-${tec.id_tecnico}`"
                        class="tecnico-nombre-label"
                      >
                        {{ tec.nombre }} ({{ tec.especialidad }})
                      </label>
                    </div>

                    <div style="display: flex; gap: 8px; align-items: center;">
                      <span style="font-size: 0.8rem; color: #64748b;">
                        {{ tec.ticketsEnProceso }} en proceso
                      </span>
                      <span
                        :class="[
                          'tecnico-badge-disponibilidad',
                          tec.disponibilidad === 'Disponible' ? 'libre' : 'ocupado'
                        ]"
                      >
                        ● {{ tec.estado }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Botón de asignación -->
              <button
                type="button"
                class="boton-asignar-tecnico-accion"
                :disabled="asignando || !tecnicoSeleccionadoId || tecnicoSeleccionado?.deshabilitado"
                @click="manejarAsignarTecnico"
              >
                {{ asignando ? "ASIGNANDO..." : "ASIGNAR TÉCNICO" }}
              </button>
            </template>

            <div v-else class="asignar-vacio">
              <p>No hay ningún ticket seleccionado para asignar.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Layout from '../../components/Layout.vue';
import { useAuth } from '../../context/useAuth';
import {
  obtenerTicketsPendientes,
  obtenerTecnicosParaAsignar,
  asignarTecnicoATicket
} from '../../services/adminService';
import './AsignarTecnico.css';

const route = useRoute();
const { sesion } = useAuth();

const tickets = ref([]);
const tecnicos = ref([]);
const ticketSeleccionadoId = ref(null);
const tecnicoSeleccionadoId = ref(null);
const prioridadAjustada = ref('Media');
const filtroPrioridad = ref('TODAS');

const cargando = ref(true);
const asignando = ref(false);
const alerta = ref(null);

const mostrarAlerta = (tipo, mensaje) => {
  alerta.value = { tipo, mensaje };
  setTimeout(() => {
    alerta.value = null;
  }, 4500);
};

onMounted(async () => {
  try {
    const [listaTickets, listaTecnicos] = await Promise.all([
      obtenerTicketsPendientes('TODAS'),
      obtenerTecnicosParaAsignar()
    ]);

    tickets.value = listaTickets;
    tecnicos.value = listaTecnicos;

    if (listaTickets.length > 0) {
      const paramId = route.params.id;
      const buscado = paramId
        ? listaTickets.find((t) => String(t.id_ticket) === String(paramId))
        : null;
      const elegido = buscado || listaTickets[0];
      ticketSeleccionadoId.value = elegido.id_ticket;
      prioridadAjustada.value = elegido.prioridad;
    }

    const primerHabilitado = listaTecnicos.find((t) => !t.deshabilitado);
    if (primerHabilitado) {
      tecnicoSeleccionadoId.value = primerHabilitado.id_tecnico;
    }
  } catch (err) {
    mostrarAlerta('error', 'Error al cargar datos: ' + err.message);
  } finally {
    cargando.value = false;
  }
});

const seleccionarTicket = (tkt) => {
  ticketSeleccionadoId.value = tkt.id_ticket;
  prioridadAjustada.value = tkt.prioridad;
};

const manejarCambioFiltro = async (nuevaPrioridad) => {
  filtroPrioridad.value = nuevaPrioridad;
  try {
    const filtrados = await obtenerTicketsPendientes(nuevaPrioridad);
    tickets.value = filtrados;
    if (filtrados.length > 0 && !filtrados.some((t) => t.id_ticket === ticketSeleccionadoId.value)) {
      ticketSeleccionadoId.value = filtrados[0].id_ticket;
      prioridadAjustada.value = filtrados[0].prioridad;
    }
  } catch (err) {
    mostrarAlerta('error', 'Error al filtrar tickets: ' + err.message);
  }
};

const manejarAsignarTecnico = async () => {
  if (!ticketSeleccionadoId.value) {
    mostrarAlerta('error', 'Debe seleccionar un ticket pendiente');
    return;
  }
  if (!tecnicoSeleccionadoId.value) {
    mostrarAlerta('error', 'Debe seleccionar un técnico responsable');
    return;
  }

  const tecnicoElegido = tecnicos.value.find((t) => t.id_tecnico === tecnicoSeleccionadoId.value);
  if (tecnicoElegido?.deshabilitado) {
    mostrarAlerta('error', 'El técnico seleccionado se encuentra Fuera de Servicio');
    return;
  }

  asignando.value = true;
  try {
    const respuesta = await asignarTecnicoATicket(
      ticketSeleccionadoId.value,
      tecnicoSeleccionadoId.value,
      prioridadAjustada.value
    );
    mostrarAlerta('exito', respuesta.mensaje);

    const restantes = tickets.value.filter((t) => t.id_ticket !== ticketSeleccionadoId.value);
    tickets.value = restantes;

    const nuevosTecnicos = await obtenerTecnicosParaAsignar();
    tecnicos.value = nuevosTecnicos;

    if (restantes.length > 0) {
      ticketSeleccionadoId.value = restantes[0].id_ticket;
      prioridadAjustada.value = restantes[0].prioridad;
    } else {
      ticketSeleccionadoId.value = null;
    }
  } catch (err) {
    mostrarAlerta('error', err.message || 'Error al asignar el técnico');
  } finally {
    asignando.value = false;
  }
};

const ticketActivo = computed(() => {
  return tickets.value.find((t) => t.id_ticket === ticketSeleccionadoId.value);
});

const tecnicoSeleccionado = computed(() => {
  return tecnicos.value.find((t) => t.id_tecnico === tecnicoSeleccionadoId.value);
});
</script>
