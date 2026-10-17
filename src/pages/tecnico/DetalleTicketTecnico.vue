<template>
  <Layout
    rol="tecnico"
    item-activo="tickets-asignados"
    :nombre-usuario="nombreParaMostrar"
  >
    <div v-if="cargando" style="padding: 40px; text-align: center; color: #556980;">
      <h2>Cargando ticket #{{ id }}...</h2>
    </div>

    <div v-else-if="error || !ticket" style="padding: 40px; text-align: center;">
      <h2 style="color: #ef4444;">Ticket no encontrado</h2>
      <p>{{ error || 'El ticket solicitado no existe o no tienes permisos.' }}</p>
      <Boton variante="secundario" @click="router.push('/tecnico/tickets')" texto="Volver a Tickets Asignados" />
    </div>

    <div v-else class="detalle-ticket-contenedor">
      <!-- Header Principal -->
      <header class="detalle-ticket-header">
        <div class="detalle-ticket-titulo-grupo">
          <span class="ticket-id-badge">#{{ ticket.id_ticket }}</span>
          <h1 class="detalle-ticket-titulo">{{ ticket.titulo }}</h1>
        </div>
        <div class="detalle-ticket-acciones-header">
          <Boton
            variante="secundario"
            @click="router.push('/tecnico/tickets')"
            texto="⬅ Mis Tickets"
          />
          <Boton
            variante="primario"
            @click="router.push(`/tecnico/tickets/${ticket.id_ticket}/avance`)"
            texto="📝 Registrar Avance"
          />
        </div>
      </header>

      <!-- Notificación de éxito al cambiar estado -->
      <div v-if="mensajeExito" class="alerta-exito-flotante" role="alert">
        <span>✅ {{ mensajeExito }}</span>
        <button
          type="button"
          @click="mensajeExito = ''"
          style="background: none; border: none; cursor: pointer; font-weight: bold; color: inherit;"
        >
          ✕
        </button>
      </div>

      <!-- 1. Barra de Control de Estado Rápido -->
      <section class="control-estado-banner" aria-label="Cambio de estado del ticket">
        <div class="control-estado-info">
          <span class="control-estado-label">Estado Actual:</span>
          <span class="badge-estado" :class="ticket.estado">
            {{ ticket.estado.replace('_', ' ') }}
          </span>
          <span class="badge-prioridad" :class="ticket.prioridad">
            Prioridad: {{ ticket.prioridad }}
          </span>
        </div>

        <div class="control-estado-selector-box">
          <label for="select-estado" style="font-size: 0.9rem; font-weight: 600; color: #556980;">
            Cambiar estado a:
          </label>
          <select
            id="select-estado"
            class="select-cambio-estado"
            v-model="estadoSeleccionado"
            :disabled="actualizandoEstado"
          >
            <option value="Abierto">Abierto</option>
            <option value="En_Proceso">En Proceso</option>
            <option value="Resuelto">Resuelto</option>
            <option value="Cerrado">Cerrado</option>
          </select>
          <Boton
            variante="primario"
            @click="manejarGuardarEstado"
            :deshabilitado="actualizandoEstado || estadoSeleccionado === ticket.estado"
            :texto="actualizandoEstado ? 'Guardando...' : 'Actualizar Estado'"
          />
        </div>
      </section>

      <!-- 2. Grid Principal con Información y Bitácora -->
      <div class="detalle-grid-principal">
        <!-- Columna Izquierda: Chat Prioritario, Descripción, Adjuntos e Historial -->
        <div>
          <!-- 💬 Chat con el Cliente -->
          <div class="detalle-card">
            <div class="chat-header-flex">
              <div>
                <h2 class="detalle-card-titulo" style="margin: 0;">
                  💬 Chat del Ticket con el Cliente
                </h2>
                <p style="margin: 4px 0 0; font-size: 0.85rem; color: #556980;">
                  Conversación directa con {{ ticket.cliente?.nombre }} {{ ticket.cliente?.apellido }}.
                </p>
              </div>
              <span class="badge-canal-activo">
                Canal activo
              </span>
            </div>

            <!-- Lista de mensajes con scroll automático -->
            <div
              ref="contenedorMensajes"
              class="chat-mensajes-scroll"
            >
              <div
                v-if="!ticket.comentarios || ticket.comentarios.length === 0"
                class="chat-vacio-box"
              >
                <span style="font-size: 2rem; display: block; margin-bottom: 8px;">💬</span>
                <p style="margin: 0; font-size: 0.92rem; font-weight: 700; color: #072137;">
                  No hay mensajes en este chat aún
                </p>
                <p style="margin: 4px 0 0; font-size: 0.82rem; color: #64748b;">
                  Escribe un mensaje abajo para comunicarte con {{ ticket.cliente?.nombre || 'el cliente' }}.
                </p>
              </div>

              <div
                v-else
                v-for="(c, idx) in ticket.comentarios"
                :key="c.id_comentario || idx"
                class="burbuja-chat-item"
                :class="{
                  'burbuja-nota-interna': c.es_nota_interna,
                  'burbuja-tecnico': (c.rolAutor || c.rol) === 'Tecnico' && !c.es_nota_interna,
                  'burbuja-cliente': (c.rolAutor || c.rol) !== 'Tecnico' && !c.es_nota_interna,
                }"
              >
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span
                      class="chip-rol-autor"
                      :class="(c.rolAutor || c.rol) === 'Tecnico' ? 'chip-tecnico' : 'chip-cliente'"
                    >
                      {{ (c.rolAutor || c.rol) === 'Tecnico' ? '🛠️ Técnico' : '👤 Cliente' }}
                    </span>
                    <span style="font-weight: 700; font-size: 0.88rem; color: #072137;">
                      {{ c.autor || c.usuario_nombre || 'Usuario' }}
                    </span>
                    <span
                      v-if="c.es_nota_interna"
                      class="chip-nota-interna"
                    >
                      🔒 Nota interna
                    </span>
                  </div>
                  <span style="font-size: 0.76rem; color: #8ca3ba;">
                    {{ c.fecha_creacion }}
                  </span>
                </div>
                <p style="margin: 0; font-size: 0.9rem; color: #072137; line-height: 1.5; white-space: pre-wrap;">
                  {{ c.contenido }}
                </p>
              </div>
            </div>

            <!-- Formulario de envío -->
            <form v-if="ticket.estado !== 'Cerrado'" @submit.prevent="manejarEnviarMensaje" style="border-top: 1px solid #edf2f7; padding-top: 14px;">
              <textarea
                rows="3"
                :placeholder="`Escribe un mensaje para ${ticket.cliente?.nombre || 'el cliente'}...`"
                v-model="nuevoMensaje"
                :disabled="enviandoMensaje"
                class="chat-input-textarea"
                id="textarea-mensaje-chat"
              ></textarea>

              <p v-if="errorMensaje" style="color: #ef4444; font-size: 0.85rem; margin: 6px 0 0;">
                {{ errorMensaje }}
              </p>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; flex-wrap: wrap; gap: 10px;">
                <label style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #556980; cursor: pointer;">
                  <input
                    type="checkbox"
                    v-model="esNotaInterna"
                  />
                  <span>Nota interna (invisible para el cliente)</span>
                </label>

                <button
                  type="submit"
                  :disabled="enviandoMensaje || !nuevoMensaje.trim()"
                  class="btn-enviar-chat"
                  :style="{
                    backgroundColor: esNotaInterna ? '#854d0e' : 'var(--color-primario, #00bba6)',
                  }"
                  id="btn-enviar-mensaje-chat"
                >
                  {{ enviandoMensaje ? 'Enviando...' : esNotaInterna ? '🔒 Guardar nota interna' : '💬 Enviar mensaje' }}
                </button>
              </div>
            </form>

            <div v-else style="padding: 10px 14px; background-color: #f8fafc; border: 1px solid #e2ebf1; border-radius: 8px; color: #556980; font-size: 0.85rem; text-align: center;">
              🔒 Este ticket se encuentra cerrado. No se admiten nuevos mensajes.
            </div>
          </div>

          <!-- Descripción del Requerimiento -->
          <div class="detalle-card">
            <h2 class="detalle-card-titulo">📋 Descripción del Problema</h2>
            <div class="detalle-descripcion-box">{{ ticket.descripcion }}</div>

            <div v-if="ticket.nombresCategorias && ticket.nombresCategorias.length > 0" style="margin-top: 16px;">
              <span style="font-size: 0.85rem; font-weight: 600; color: #556980;">
                Categorías de servicio:
              </span>
              <div style="display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap;">
                <span
                  v-for="(c, i) in ticket.nombresCategorias"
                  :key="i"
                  class="cat-chip"
                  style="font-size: 0.85rem; padding: 4px 10px;"
                >
                  {{ c }}
                </span>
              </div>
            </div>
          </div>

          <!-- Evidencias y Adjuntos -->
          <SeccionAdjuntos
            :id-ticket="ticket.id_ticket"
            :estado-ticket="ticket.estado"
          />

          <!-- Historial de Avances y Acciones -->
          <div class="detalle-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h2 class="detalle-card-titulo" style="margin: 0;">
                🕒 Historial del Ticket
              </h2>
              <button
                type="button"
                @click="router.push(`/tecnico/tickets/${ticket.id_ticket}/avance`)"
                style="background: none; border: none; color: var(--color-primario, #00bba6); font-weight: 700; cursor: pointer; font-size: 0.88rem;"
              >
                + Agregar nuevo avance
              </button>
            </div>

            <div class="timeline-historial">
              <div
                v-if="ticket.historial && ticket.historial.length > 0"
                v-for="(item, idx) in ticket.historial"
                :key="item.id_historial || idx"
                class="timeline-item"
              >
                <div class="timeline-punto"></div>
                <div class="timeline-contenido">
                  <div class="timeline-header">
                    <span class="timeline-tipo">{{ item.tipo_accion }}</span>
                    <span class="timeline-fecha">{{ item.fecha_accion }}</span>
                  </div>
                  <div class="timeline-detalles">{{ item.detalles }}</div>
                </div>
              </div>
              <p v-else style="color: #94a3b8; font-size: 0.9rem;">
                No hay registros en el historial todavía.
              </p>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Cliente, Equipo y Metadatos -->
        <div>
          <!-- Tarjeta del Cliente -->
          <div class="detalle-card">
            <h2 class="detalle-card-titulo">👤 Datos del Cliente</h2>
            <div class="campo-fila">
              <span class="campo-etiqueta">Nombre:</span>
              <span class="campo-valor">
                {{ ticket.cliente?.nombre }} {{ ticket.cliente?.apellido }}
              </span>
            </div>
            <div class="campo-fila">
              <span class="campo-etiqueta">Correo:</span>
              <span class="campo-valor">{{ ticket.cliente?.correo_electronico }}</span>
            </div>
          </div>

          <!-- Tarjeta del Equipo -->
          <div class="detalle-card">
            <div class="detalle-card-header-flex">
              <h2 class="detalle-card-titulo" style="margin-bottom: 0;">💻 Equipo Registrado</h2>
              <button
                type="button"
                class="btn-accion-card-tec"
                @click="abrirModalRegistrarEquipo"
                id="btn-abrir-modal-equipo"
                title="Registrar un nuevo equipo para este cliente"
              >
                + Registrar Equipo
              </button>
            </div>

            <div v-if="ticket.equipo" class="equipo-info-bloque">
              <div class="campo-fila">
                <span class="campo-etiqueta">Tipo:</span>
                <span class="campo-valor badge-tipo-equipo">{{ ticket.equipo.tipo }}</span>
              </div>
              <div class="campo-fila">
                <span class="campo-etiqueta">Marca / Modelo:</span>
                <span class="campo-valor font-semibold">
                  {{ ticket.equipo.marca }} {{ ticket.equipo.modelo }}
                </span>
              </div>
              <div class="campo-fila">
                <span class="campo-etiqueta">Número Serial:</span>
                <span class="campo-valor equipo-serial-code">
                  {{ ticket.equipo.serial }}
                </span>
              </div>
              <div v-if="ticket.equipo.sistema_operativo" class="campo-fila">
                <span class="campo-etiqueta">Sistema Op.:</span>
                <span class="campo-valor">{{ ticket.equipo.sistema_operativo }}</span>
              </div>
              <div v-if="ticket.equipo.area_departamento" class="campo-fila">
                <span class="campo-etiqueta">Área / Ubicación:</span>
                <span class="campo-valor">{{ ticket.equipo.area_departamento }}</span>
              </div>
              <div class="campo-fila">
                <span class="campo-etiqueta">Estado Equipo:</span>
                <span class="campo-valor badge-estado-equipo" :class="claseEstadoEquipo(ticket.equipo.estado_equipo)">
                  {{ formatearEstadoEquipo(ticket.equipo.estado_equipo) }}
                </span>
              </div>

              <div class="equipo-card-acciones-inferior">
                <button
                  type="button"
                  class="btn-link-tec"
                  @click="abrirModalVincularExistente"
                  id="btn-cambiar-equipo-vinculado"
                >
                  ⇄ Cambiar equipo vinculado
                </button>
              </div>
            </div>

            <div v-else class="equipo-vacio-box">
              <div class="equipo-vacio-icono">💻</div>
              <p class="equipo-vacio-titulo">Sin equipo asociado</p>
              <p class="equipo-vacio-subtexto">
                Este ticket aún no tiene un equipo asignado. Puedes registrar uno nuevo para <strong>{{ ticket.cliente?.nombre }} {{ ticket.cliente?.apellido }}</strong> o asociar uno de sus equipos ya registrados.
              </p>
              <div class="equipo-vacio-botones">
                <button
                  type="button"
                  class="btn-equipo-cta primario"
                  @click="abrirModalRegistrarEquipo"
                  id="btn-cta-registrar-equipo"
                >
                  + Registrar Nuevo Equipo
                </button>
                <button
                  type="button"
                  class="btn-equipo-cta secundario"
                  @click="abrirModalVincularExistente"
                  id="btn-cta-vincular-equipo"
                >
                  🔗 Asociar Equipo Existente
                </button>
              </div>
            </div>
          </div>

          <!-- Tiempos y Fechas -->
          <div class="detalle-card">
            <h2 class="detalle-card-titulo">📅 Tiempos del Ticket</h2>
            <div class="campo-fila">
              <span class="campo-etiqueta">Creación:</span>
              <span class="campo-valor">{{ ticket.fecha_creacion }}</span>
            </div>
            <div class="campo-fila">
              <span class="campo-etiqueta">Resolución:</span>
              <span class="campo-valor">{{ ticket.fecha_resolucion || 'Pendiente' }}</span>
            </div>
            <div class="campo-fila">
              <span class="campo-etiqueta">Cierre formal:</span>
              <span class="campo-valor">{{ ticket.fecha_cierre || 'Abierto' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Registrar o Vincular Equipo para el Cliente -->
    <div
      v-if="modalEquipoAbierto"
      class="modal-tecnico-overlay"
      @click.self="!guardandoEquipo && (modalEquipoAbierto = false)"
    >
      <div class="modal-tecnico-card">
        <div class="modal-tecnico-header">
          <div>
            <h3 class="modal-tecnico-titulo">Equipos del Cliente</h3>
            <p class="modal-tecnico-subtitulo">
              Cliente: <strong>{{ ticket?.cliente?.nombre }} {{ ticket?.cliente?.apellido }}</strong>
              <span v-if="ticket?.cliente?.correo_electronico"> ({{ ticket?.cliente?.correo_electronico }})</span>
            </p>
          </div>
          <button
            type="button"
            class="modal-btn-cerrar"
            @click="modalEquipoAbierto = false"
            :disabled="guardandoEquipo"
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        <!-- Pestañas del Modal -->
        <div class="modal-tecnico-tabs">
          <button
            type="button"
            class="modal-tab-btn"
            :class="{ activo: tabModalEquipo === 'nuevo' }"
            @click="tabModalEquipo = 'nuevo'"
          >
            + Registrar Nuevo Equipo
          </button>
          <button
            type="button"
            class="modal-tab-btn"
            :class="{ activo: tabModalEquipo === 'existentes' }"
            @click="cambiarATabExistentes"
          >
            📋 Equipos Registrados ({{ listaEquiposCliente.length }})
          </button>
        </div>

        <!-- Pestaña 1: Registrar Nuevo Equipo -->
        <div v-if="tabModalEquipo === 'nuevo'" class="modal-tecnico-cuerpo">
          <div v-if="alertaModalEquipo" class="alerta-modal-tec" :class="alertaModalEquipo.tipo">
            {{ alertaModalEquipo.texto }}
          </div>

          <form @submit.prevent="manejarGuardarNuevoEquipo">
            <div class="form-grid-2">
              <div class="campo-grupo-modal">
                <label for="eq-tipo" class="campo-etiqueta-modal">Tipo de Dispositivo *</label>
                <select
                  id="eq-tipo"
                  class="input-modal-tec"
                  v-model="formEquipo.tipo"
                  required
                  :disabled="guardandoEquipo"
                >
                  <option value="Portatil">Portátil / Laptop</option>
                  <option value="Computador">Computador de Escritorio</option>
                  <option value="Servidor">Servidor</option>
                  <option value="Impresora">Impresora / Multifuncional</option>
                  <option value="Red">Equipo de Red / Switch / Router</option>
                  <option value="Periferico">Periférico / Pantalla</option>
                  <option value="Otro">Otro Dispositivo</option>
                </select>
              </div>

              <div class="campo-grupo-modal">
                <label for="eq-estado" class="campo-etiqueta-modal">Estado del Equipo *</label>
                <select
                  id="eq-estado"
                  class="input-modal-tec"
                  v-model="formEquipo.estado_equipo"
                  required
                  :disabled="guardandoEquipo"
                >
                  <option value="En_Diagnostico">En Diagnóstico</option>
                  <option value="En_Reparacion">En Reparación</option>
                  <option value="Operativo">Operativo</option>
                  <option value="De_Baja">De Baja / No Reparable</option>
                </select>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="campo-grupo-modal">
                <label for="eq-marca" class="campo-etiqueta-modal">Marca *</label>
                <input
                  id="eq-marca"
                  type="text"
                  class="input-modal-tec"
                  placeholder="Ej. Lenovo, Dell, HP, Apple"
                  v-model="formEquipo.marca"
                  required
                  maxlength="50"
                  :disabled="guardandoEquipo"
                />
              </div>

              <div class="campo-grupo-modal">
                <label for="eq-modelo" class="campo-etiqueta-modal">Modelo *</label>
                <input
                  id="eq-modelo"
                  type="text"
                  class="input-modal-tec"
                  placeholder="Ej. ThinkPad T14 Gen 3"
                  v-model="formEquipo.modelo"
                  required
                  maxlength="50"
                  :disabled="guardandoEquipo"
                />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="campo-grupo-modal">
                <label for="eq-serial" class="campo-etiqueta-modal">Número de Serial (S/N) *</label>
                <input
                  id="eq-serial"
                  type="text"
                  class="input-modal-tec font-mono"
                  placeholder="Ej. SN-PF32910A"
                  v-model="formEquipo.serial"
                  required
                  maxlength="50"
                  :disabled="guardandoEquipo"
                />
              </div>

              <div class="campo-grupo-modal">
                <label for="eq-so" class="campo-etiqueta-modal">Sistema Operativo</label>
                <input
                  id="eq-so"
                  type="text"
                  class="input-modal-tec"
                  placeholder="Ej. Windows 11 Pro, Ubuntu 22.04"
                  v-model="formEquipo.sistema_operativo"
                  maxlength="50"
                  :disabled="guardandoEquipo"
                />
              </div>
            </div>

            <div class="campo-grupo-modal">
              <label for="eq-area" class="campo-etiqueta-modal">Área o Ubicación en la Empresa</label>
              <input
                id="eq-area"
                type="text"
                class="input-modal-tec"
                placeholder="Ej. Contabilidad - Oficina 204"
                v-model="formEquipo.area_departamento"
                maxlength="80"
                :disabled="guardandoEquipo"
              />
            </div>

            <!-- Checkbox de vinculación inmediata al ticket -->
            <div class="campo-checkbox-vincular">
              <label class="checkbox-label-tec">
                <input
                  type="checkbox"
                  v-model="formEquipo.vincularATicket"
                  :disabled="guardandoEquipo"
                />
                <span class="checkbox-texto-tec">
                  <strong>Vincular este equipo al Ticket actual #{{ ticket?.id_ticket }}</strong>
                  <small>Se actualizará la ficha del ticket y quedará registrado en el historial de auditoría.</small>
                </span>
              </label>
            </div>

            <div class="modal-tecnico-footer">
              <button
                type="button"
                class="btn-modal-secundario"
                @click="modalEquipoAbierto = false"
                :disabled="guardandoEquipo"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn-modal-primario"
                :disabled="guardandoEquipo"
                id="btn-guardar-nuevo-equipo"
              >
                {{ guardandoEquipo ? 'Registrando...' : 'Registrar Equipo' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Pestaña 2: Equipos Existentes del Cliente -->
        <div v-else class="modal-tecnico-cuerpo">
          <div v-if="cargandoEquiposCliente" class="modal-cargando">
            Cargando equipos del cliente...
          </div>
          <div v-else-if="listaEquiposCliente.length === 0" class="modal-vacio-equipos">
            <p>Este cliente aún no tiene equipos registrados en su ficha.</p>
            <button
              type="button"
              class="btn-modal-primario"
              @click="tabModalEquipo = 'nuevo'"
            >
              + Registrar el Primer Equipo
            </button>
          </div>
          <div v-else class="lista-equipos-cliente">
            <div
              v-for="eq in listaEquiposCliente"
              :key="eq.id_equipo"
              class="item-equipo-cliente-card"
              :class="{ 'item-equipo-actual': ticket?.equipo?.id_equipo === eq.id_equipo }"
            >
              <div class="item-eq-icono">💻</div>
              <div class="item-eq-detalles">
                <div class="item-eq-titulo">
                  <strong>{{ eq.marca }} {{ eq.modelo }}</strong>
                  <span class="badge-tipo-pequeno">{{ eq.tipo }}</span>
                </div>
                <div class="item-eq-sub">
                  <span>S/N: <code>{{ eq.serial }}</code></span>
                  <span v-if="eq.sistema_operativo">• {{ eq.sistema_operativo }}</span>
                  <span v-if="eq.area_departamento">• {{ eq.area_departamento }}</span>
                </div>
              </div>
              <div class="item-eq-accion">
                <span
                  v-if="ticket?.equipo?.id_equipo === eq.id_equipo"
                  class="badge-equipo-actual"
                >
                  ✓ Actualmente Vinculado
                </span>
                <button
                  v-else
                  type="button"
                  class="btn-vincular-equipo"
                  @click="manejarVincularEquipoExistente(eq)"
                  :disabled="guardandoEquipo"
                >
                  Vincular al Ticket
                </button>
              </div>
            </div>
          </div>

          <div class="modal-tecnico-footer" style="margin-top: 20px;">
            <button
              type="button"
              class="btn-modal-secundario"
              @click="modalEquipoAbierto = false"
              :disabled="guardandoEquipo"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Layout from '../../components/Layout.vue';
import Boton from '../../components/Boton.vue';
import SeccionAdjuntos from '../../components/SeccionAdjuntos.vue';
import { useAuth } from '../../context/useAuth';
import {
  obtenerDetalleTicket,
  cambiarEstadoTicket,
  obtenerTecnicoActual,
  comentarTicket,
  agregarEquipoCliente,
  vincularEquipoTicket,
  obtenerEquiposCliente,
} from '../../services/tecnicoService';
import './DetalleTicketTecnico.css';

const route = useRoute();
const router = useRouter();
const { sesion } = useAuth();

const id = computed(() => route.params.id);
const tecnico = ref(null);
const ticket = ref(null);
const cargando = ref(true);
const error = ref(null);

const estadoSeleccionado = ref('');
const actualizandoEstado = ref(false);
const mensajeExito = ref('');

const nuevoMensaje = ref('');
const esNotaInterna = ref(false);
const enviandoMensaje = ref(false);
const errorMensaje = ref('');
const contenedorMensajes = ref(null);

const scrollAlUltimoMensaje = () => {
  nextTick(() => {
    if (contenedorMensajes.value) {
      contenedorMensajes.value.scrollTop = contenedorMensajes.value.scrollHeight;
    }
  });
};

// Estado para gestión de equipos por parte del técnico
const modalEquipoAbierto = ref(false);
const tabModalEquipo = ref('nuevo'); // 'nuevo' | 'existentes'
const guardandoEquipo = ref(false);
const cargandoEquiposCliente = ref(false);
const listaEquiposCliente = ref([]);
const alertaModalEquipo = ref(null);

const formEquipo = ref({
  tipo: 'Portatil',
  marca: '',
  modelo: '',
  serial: '',
  sistema_operativo: '',
  area_departamento: '',
  estado_equipo: 'En_Diagnostico',
  vincularATicket: true,
});

onMounted(async () => {
  try {
    obtenerTecnicoActual().then((datos) => (tecnico.value = datos));
    const datos = await obtenerDetalleTicket(id.value);
    ticket.value = datos;
    estadoSeleccionado.value = datos.estado;
    scrollAlUltimoMensaje();
  } catch (err) {
    error.value = err.message || 'Error al cargar el detalle del ticket.';
  } finally {
    cargando.value = false;
  }
});

const nombreParaMostrar = computed(() => {
  return (
    sesion.value?.nombre ||
    (tecnico.value ? `${tecnico.value.nombre} ${tecnico.value.apellido}` : 'Técnico')
  );
});

const manejarGuardarEstado = async () => {
  if (!ticket.value || estadoSeleccionado.value === ticket.value.estado) return;

  actualizandoEstado.value = true;
  mensajeExito.value = '';

  try {
    const ticketActualizado = await cambiarEstadoTicket(ticket.value.id_ticket, estadoSeleccionado.value);
    ticket.value = {
      ...ticket.value,
      ...ticketActualizado,
      historial: [
        {
          id_historial: Date.now(),
          id_ticket: ticket.value.id_ticket,
          tipo_accion: 'Cambio_Estado',
          estado_anterior: ticket.value.estado,
          estado_nuevo: estadoSeleccionado.value,
          fecha_accion: new Date().toISOString().replace('T', ' ').substring(0, 19),
          detalles: `Estado actualizado a ${estadoSeleccionado.value.replace('_', ' ')}.`,
        },
        ...(ticket.value.historial || []),
      ],
    };
    mensajeExito.value = `Estado actualizado correctamente a "${estadoSeleccionado.value.replace('_', ' ')}".`;
  } catch (err) {
    alert('No se pudo actualizar el estado.');
  } finally {
    actualizandoEstado.value = false;
  }
};

const manejarEnviarMensaje = async () => {
  if (!nuevoMensaje.value.trim() || enviandoMensaje.value) return;

  errorMensaje.value = '';
  enviandoMensaje.value = true;

  try {
    const resp = await comentarTicket(ticket.value.id_ticket, {
      contenido: nuevoMensaje.value.trim(),
      es_nota_interna: esNotaInterna.value,
    });

    const nuevoItem = {
      id_comentario: resp?.id_comentario || Date.now(),
      id_ticket: ticket.value.id_ticket,
      contenido: nuevoMensaje.value.trim(),
      autor: nombreParaMostrar.value,
      rolAutor: 'Tecnico',
      es_nota_interna: esNotaInterna.value,
      fecha_creacion: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    ticket.value = {
      ...ticket.value,
      comentarios: [...(ticket.value.comentarios || []), nuevoItem],
    };

    nuevoMensaje.value = '';
    esNotaInterna.value = false;
    scrollAlUltimoMensaje();
  } catch (err) {
    errorMensaje.value = err.message || 'Error al enviar el mensaje.';
  } finally {
    enviandoMensaje.value = false;
  }
};

// ==============================================================================
// GESTIÓN DE EQUIPOS POR EL TÉCNICO
// ==============================================================================

const abrirModalRegistrarEquipo = () => {
  tabModalEquipo.value = 'nuevo';
  alertaModalEquipo.value = null;
  formEquipo.value = {
    tipo: 'Portatil',
    marca: '',
    modelo: '',
    serial: '',
    sistema_operativo: '',
    area_departamento: ticket.value?.area_departamento || '',
    estado_equipo: 'En_Diagnostico',
    vincularATicket: true,
  };
  modalEquipoAbierto.value = true;
  cargarEquiposCliente();
};

const abrirModalVincularExistente = () => {
  tabModalEquipo.value = 'existentes';
  alertaModalEquipo.value = null;
  modalEquipoAbierto.value = true;
  cargarEquiposCliente();
};

const cambiarATabExistentes = () => {
  tabModalEquipo.value = 'existentes';
  cargarEquiposCliente();
};

const cargarEquiposCliente = async () => {
  if (!ticket.value?.cliente?.id_usuario) return;
  cargandoEquiposCliente.value = true;
  try {
    const data = await obtenerEquiposCliente(ticket.value.cliente.id_usuario);
    listaEquiposCliente.value = data || [];
  } catch (err) {
    console.error('Error al cargar equipos del cliente:', err);
  } finally {
    cargandoEquiposCliente.value = false;
  }
};

const manejarGuardarNuevoEquipo = async () => {
  if (!formEquipo.value.marca || !formEquipo.value.modelo || !formEquipo.value.serial) {
    alertaModalEquipo.value = {
      tipo: 'error',
      texto: 'Por favor completa los campos obligatorios: Tipo, Marca, Modelo y Serial.',
    };
    return;
  }

  guardandoEquipo.value = true;
  alertaModalEquipo.value = null;

  try {
    const payload = {
      tipo: formEquipo.value.tipo,
      marca: formEquipo.value.marca.trim(),
      modelo: formEquipo.value.modelo.trim(),
      serial: formEquipo.value.serial.trim().toUpperCase(),
      sistema_operativo: formEquipo.value.sistema_operativo?.trim() || null,
      area_departamento: formEquipo.value.area_departamento?.trim() || 'General',
      estado_equipo: formEquipo.value.estado_equipo,
      id_cliente: ticket.value.cliente.id_usuario,
      id_ticket: formEquipo.value.vincularATicket ? ticket.value.id_ticket : null,
    };

    const nuevoEq = await agregarEquipoCliente(payload);

    // Actualizar estado local del ticket
    if (formEquipo.value.vincularATicket) {
      ticket.value = {
        ...ticket.value,
        id_equipo: nuevoEq.id_equipo,
        equipo: nuevoEq,
        historial: [
          {
            id_historial: Date.now(),
            id_ticket: ticket.value.id_ticket,
            tipo_accion: 'Actualizacion',
            estado_anterior: ticket.value.estado,
            estado_nuevo: ticket.value.estado,
            fecha_accion: new Date().toISOString().replace('T', ' ').substring(0, 19),
            detalles: `Equipo registrado y vinculado al ticket: ${nuevoEq.tipo} ${nuevoEq.marca} ${nuevoEq.modelo} (${nuevoEq.serial}).`,
          },
          ...(ticket.value.historial || []),
        ],
      };
      mensajeExito.value = `Equipo "${nuevoEq.marca} ${nuevoEq.modelo}" registrado y vinculado al ticket correctamente.`;
    } else {
      mensajeExito.value = `Equipo "${nuevoEq.marca} ${nuevoEq.modelo}" registrado en la ficha del cliente correctamente.`;
    }

    modalEquipoAbierto.value = false;
  } catch (err) {
    alertaModalEquipo.value = {
      tipo: 'error',
      texto: err.message || 'Error al registrar el equipo para el cliente.',
    };
  } finally {
    guardandoEquipo.value = false;
  }
};

const manejarVincularEquipoExistente = async (eq) => {
  guardandoEquipo.value = true;
  try {
    await vincularEquipoTicket(ticket.value.id_ticket, eq.id_equipo);
    ticket.value = {
      ...ticket.value,
      id_equipo: eq.id_equipo,
      equipo: eq,
      historial: [
        {
          id_historial: Date.now(),
          id_ticket: ticket.value.id_ticket,
          tipo_accion: 'Actualizacion',
          estado_anterior: ticket.value.estado,
          estado_nuevo: ticket.value.estado,
          fecha_accion: new Date().toISOString().replace('T', ' ').substring(0, 19),
          detalles: `Equipo vinculado por el técnico: ${eq.tipo} ${eq.marca} ${eq.modelo} (${eq.serial}).`,
        },
        ...(ticket.value.historial || []),
      ],
    };
    mensajeExito.value = `Equipo "${eq.marca} ${eq.modelo}" vinculado al ticket correctamente.`;
    modalEquipoAbierto.value = false;
  } catch (err) {
    alert(err.message || 'Error al vincular el equipo al ticket.');
  } finally {
    guardandoEquipo.value = false;
  }
};

const claseEstadoEquipo = (estado) => {
  switch (estado) {
    case 'Operativo': return 'estado-operativo';
    case 'En_Reparacion': return 'estado-reparacion';
    case 'En_Diagnostico': return 'estado-diagnostico';
    case 'De_Baja': return 'estado-debaja';
    default: return 'estado-default';
  }
};

const formatearEstadoEquipo = (estado) => {
  if (!estado) return 'No especificado';
  return estado.replace(/_/g, ' ');
};
</script>

<style scoped>
.btn-enviar-chat {
  padding: 8px 18px;
  color: #ffffff;
  border: none;
  border-radius: var(--radio-boton, 10px);
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(0, 187, 166, 0.25);
  transition: all 0.2s ease;
}

.btn-enviar-chat:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
