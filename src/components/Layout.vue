<template>
  <div class="layout-contenedor">
    <!-- Overlay oscuro para pantallas móviles -->
    <div
      class="layout-overlay"
      :class="{ activo: menuMovilAbierto }"
      @click="menuMovilAbierto = false"
      aria-hidden="true"
    ></div>

    <!-- 1. BARRA LATERAL FIJA (Sidebar) -->
    <aside class="layout-sidebar" :class="{ abierto: menuMovilAbierto }">
      <div class="sidebar-header">
        <div class="sidebar-logo-icono">S</div>
        <h2 class="sidebar-titulo">{{ configActual.tituloPanel }}</h2>
      </div>

      <nav class="sidebar-nav">
        <ul class="sidebar-lista">
          <li v-for="item in configActual.items" :key="item.id">
            <button
              type="button"
              class="sidebar-item"
              :class="{ activo: item.id === itemActivoCalculado }"
              @click="seleccionarOpcion(item.id)"
            >
              <span class="sidebar-item-icono" v-html="item.svgIcono"></span>
              <span>{{ item.etiqueta }}</span>
            </button>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <span>SistemasAR • {{ rolCalculado }}</span>
        <span title="Conexión activa">🟢 Online</span>
      </div>
    </aside>

    <!-- 2. COLUMNA PRINCIPAL -->
    <div class="layout-principal">
      <header class="layout-header">
        <div class="header-izquierda">
          <button
            type="button"
            class="header-boton-menu"
            @click="menuMovilAbierto = !menuMovilAbierto"
            aria-label="Menú"
          >
            ☰
          </button>
          <div class="header-marca">
            <span class="header-marca-dark">Sistemas</span><span>AR</span>
          </div>
        </div>

        <div v-if="configActual.mostrarBuscador" class="header-centro">
          <div class="header-buscador-contenedor">
            <span class="header-buscador-icono">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              class="header-buscador-input"
              placeholder="Buscar ticket..."
            />
          </div>
        </div>

        <div class="header-derecha">
          <!-- Selector rápido de rol (para demo/pruebas si se proporciona onCambiarRol o siempre accesible) -->
          <div v-if="mostrarSelectorRol" class="header-selector-roles" title="Cambiar rol para ver su Layout">
            <button
              type="button"
              class="selector-rol-boton"
              :class="{ activo: rolCalculado === 'cliente' }"
              @click="cambiarRolDemo('cliente')"
            >
              Cliente
            </button>
            <button
              type="button"
              class="selector-rol-boton"
              :class="{ activo: rolCalculado === 'tecnico' }"
              @click="cambiarRolDemo('tecnico')"
            >
              Técnico
            </button>
            <button
              type="button"
              class="selector-rol-boton"
              :class="{ activo: rolCalculado === 'administrador' }"
              @click="cambiarRolDemo('administrador')"
            >
              Admin
            </button>
          </div>

          <!-- Campana de alertas interactiva -->
          <div ref="notifContenedorRef" style="position: relative">
            <button
              type="button"
              class="header-icono-alerta"
              aria-label="Notificaciones"
              title="Notificaciones"
              @click="panelNotifAbierto = !panelNotifAbierto"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span v-if="noLeidas > 0" class="header-badge-notificacion">{{ noLeidas }}</span>
            </button>

            <!-- Dropdown de notificaciones -->
            <div v-if="panelNotifAbierto" class="panel-notificaciones-dropdown">
              <div class="panel-notif-header">
                <div class="panel-notif-titulo">
                  <span>🔔</span>
                  <span>Notificaciones {{ noLeidas > 0 ? `(${noLeidas} nuevas)` : '' }}</span>
                </div>
                <div class="panel-notif-acciones-rapidas">
                  <button
                    v-if="noLeidas > 0"
                    type="button"
                    class="panel-notif-btn-accion"
                    @click="marcarTodasComoLeidas"
                  >
                    Marcar leídas
                  </button>
                </div>
              </div>

              <div v-if="notificaciones.length === 0" style="padding: 24px; text-align: center; color: #556980; font-size: 0.85rem;">
                No tienes notificaciones
              </div>

              <ul v-else class="panel-notif-lista">
                <li
                  v-for="n in notificaciones.slice(0, 5)"
                  :key="n.id_notificacion"
                  class="panel-notif-item"
                  :class="{ 'no-leida': !n.leida }"
                  @click="abrirNotificacion(n)"
                >
                  <div class="panel-notif-item-top">
                    <span class="notif-badge-tipo" :class="claseBadgeTipo(n.tipo)">
                      {{ etiquetaBadgeTipo(n.tipo) }}
                    </span>
                    <span class="panel-notif-tiempo">{{ n.fecha_creacion ? n.fecha_creacion.slice(0, 10) : '' }}</span>
                  </div>
                  <p class="panel-notif-mensaje">{{ n.mensaje }}</p>
                </li>
              </ul>

              <div class="panel-notif-footer" style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                <button
                  type="button"
                  class="panel-notif-btn-ver-todas"
                  @click="abrirHistorialCompleto"
                >
                  📜 Ver historial completo ({{ notificaciones.length }})
                </button>
                <button
                  type="button"
                  style="background: none; border: none; color: #64748b; font-size: 0.8rem; font-weight: 600; cursor: pointer;"
                  @click="panelNotifAbierto = false"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>

          <!-- MODAL: HISTORIAL COMPLETO DE NOTIFICACIONES -->
          <div
            v-if="modalHistorialAbierto"
            class="modal-historial-overlay"
            role="dialog"
            aria-modal="true"
            @click="modalHistorialAbierto = false"
          >
            <div class="modal-historial-card" @click.stop>
              <div class="modal-historial-header">
                <div class="modal-historial-titulo-bloque">
                  <div class="modal-historial-icono">🔔</div>
                  <div>
                    <h3 class="modal-historial-titulo">Historial de Notificaciones</h3>
                    <span style="font-size: 0.8rem; color: #64748b;">
                      {{ notificaciones.length }} en total • {{ noLeidas }} sin leer
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  style="background: none; border: none; font-size: 1.4rem; color: #64748b; cursor: pointer; padding: 4px;"
                  aria-label="Cerrar modal"
                  @click="modalHistorialAbierto = false"
                >
                  ✕
                </button>
              </div>

              <!-- Filtros y buscador dentro del modal -->
              <div class="modal-historial-filtros">
                <div class="modal-historial-tabs">
                  <button
                    type="button"
                    class="modal-historial-tab-btn"
                    :class="{ activo: filtroHistorial === 'todas' }"
                    @click="filtroHistorial = 'todas'"
                  >
                    Todas ({{ notificaciones.length }})
                  </button>
                  <button
                    type="button"
                    class="modal-historial-tab-btn"
                    :class="{ activo: filtroHistorial === 'no-leidas' }"
                    @click="filtroHistorial = 'no-leidas'"
                  >
                    No leídas ({{ noLeidas }})
                  </button>
                  <button
                    type="button"
                    class="modal-historial-tab-btn"
                    :class="{ activo: filtroHistorial === 'leidas' }"
                    @click="filtroHistorial = 'leidas'"
                  >
                    Leídas ({{ notificaciones.length - noLeidas }})
                  </button>
                </div>

                <input
                  v-model="busquedaNotif"
                  type="search"
                  placeholder="Buscar en notificaciones..."
                  class="modal-historial-buscador"
                />
              </div>

              <!-- Lista completa de notificaciones -->
              <div class="modal-historial-lista">
                <div v-if="notificacionesFiltradasModal.length === 0" style="padding: 40px 20px; text-align: center; color: #64748b;">
                  <span style="font-size: 2rem; display: block; margin-bottom: 8px;">📭</span>
                  <p style="margin: 0; font-weight: 600;">No hay notificaciones con los filtros seleccionados.</p>
                </div>

                <div
                  v-for="n in notificacionesFiltradasModal"
                  v-else
                  :key="n.id_notificacion"
                  class="modal-historial-item"
                  :class="{ 'no-leida': !n.leida }"
                  @click="abrirNotificacion(n)"
                >
                  <div class="modal-historial-item-top">
                    <span class="notif-badge-tipo" :class="claseBadgeTipo(n.tipo)">
                      {{ etiquetaBadgeTipo(n.tipo) }}
                    </span>
                    <span class="panel-notif-tiempo">
                      {{ n.fecha_creacion || 'Reciente' }}
                    </span>
                  </div>

                  <p class="modal-historial-item-mensaje">
                    {{ n.mensaje }}
                  </p>

                  <div class="modal-historial-item-acciones" @click.stop>
                    <button
                      v-if="n.id_ticket"
                      type="button"
                      class="modal-historial-btn-ir"
                      @click="abrirNotificacion(n)"
                    >
                      🔍 Ver ticket #{{ n.id_ticket }} →
                    </button>
                    <span v-else style="font-size: 0.8rem; color: #94a3b8;">Notificación general</span>

                    <div style="display: flex; gap: 10px; align-items: center;">
                      <button
                        v-if="!n.leida"
                        type="button"
                        style="background: none; border: none; color: var(--color-primario, #00bba6); font-size: 0.8rem; font-weight: 600; cursor: pointer;"
                        @click="marcarIndividualLeida(n)"
                      >
                        Marcar leída
                      </button>
                      <button
                        type="button"
                        class="modal-historial-btn-eliminar"
                        title="Eliminar notificación"
                        @click="eliminarIndividual(n.id_notificacion)"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer del modal -->
              <div class="modal-historial-footer">
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  <button
                    v-if="noLeidas > 0"
                    type="button"
                    style="padding: 6px 14px; border-radius: 20px; border: 1px solid var(--color-primario, #00bba6); background: #ffffff; color: var(--color-primario, #00bba6); font-size: 0.82rem; font-weight: 700; cursor: pointer;"
                    @click="marcarTodasComoLeidas"
                  >
                    ✓ Marcar todas como leídas
                  </button>
                  <button
                    v-if="notificaciones.length > 0"
                    type="button"
                    style="padding: 6px 14px; border-radius: 20px; border: 1px solid #fecaca; background: #fff; color: #dc2626; font-size: 0.82rem; font-weight: 700; cursor: pointer;"
                    @click="borrarTodoHistorial"
                  >
                    🗑️ Limpiar historial
                  </button>
                </div>

                <button
                  type="button"
                  style="padding: 6px 18px; border-radius: 20px; border: 1px solid #cbd5e1; background: #ffffff; color: #334155; font-size: 0.85rem; font-weight: 600; cursor: pointer;"
                  @click="modalHistorialAbierto = false"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>

          <!-- Usuario y Avatar -->
          <div class="header-usuario">
            <div class="header-avatar">{{ inicialUsuario }}</div>
            <div class="header-usuario-info">
              <span class="header-usuario-nombre">{{ nombreActivo }}</span>
              <span class="header-usuario-rol">{{ rolCalculado }}</span>
            </div>
            <button
              type="button"
              class="header-btn-logout"
              @click="manejarCerrarSesion"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <!-- 3. ÁREA DE CONTENIDO -->
      <main class="layout-contenido">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../context/useAuth';
import {
  obtenerNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
  eliminarNotificacion,
  eliminarTodasNotificaciones,
} from '../services/reportesService';
import './Layout.css';

const props = defineProps({
  rol: {
    type: String,
    default: '',
  },
  itemActivo: {
    type: String,
    default: '',
  },
  nombreUsuario: {
    type: String,
    default: 'Usuario SistemasAR',
  },
  mostrarSelectorRol: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['cambiarRol', 'cambiarItem']);

const route = useRoute();
const router = useRouter();
const { sesion, cerrarSesion } = useAuth();

const notifContenedorRef = ref(null);
const menuMovilAbierto = ref(false);
const notificaciones = ref([]);
const panelNotifAbierto = ref(false);
const modalHistorialAbierto = ref(false);
const filtroHistorial = ref('todas');
const busquedaNotif = ref('');

const RUTAS_POR_ROL = {
  administrador: {
    dashboard: '/admin',
    asignacion: '/admin/asignacion',
    tickets: '/admin/tickets',
    usuarios: '/admin/usuarios',
    categorias: '/admin/categorias',
    reportes: '/admin/reportes',
    calificaciones: '/admin/calificaciones',
  },
  tecnico: {
    dashboard: '/tecnico',
    'tickets-asignados': '/tecnico/tickets',
  },
  cliente: {
    dashboard: '/cliente',
    'crear-ticket': '/cliente/tickets/nuevo',
    'mis-tickets': '/cliente/tickets',
    'perfil-equipos': '/cliente/perfil',
  },
};

const SVGS = {
  dashboard: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
  asignacion: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>',
  tickets: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
  usuarios: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
  categorias: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
  reportes: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
  calificaciones: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
  crearTicket: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>',
  misTickets: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>',
  perfil: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
  checkList: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>',
};

const CONFIG_POR_ROL = {
  administrador: {
    tituloPanel: 'Panel de Administrador',
    mostrarBuscador: false,
    items: [
      { id: 'dashboard', etiqueta: 'Dashboard', svgIcono: SVGS.dashboard },
      { id: 'asignacion', etiqueta: 'Asignación de tickets', svgIcono: SVGS.asignacion },
      { id: 'tickets', etiqueta: 'Historial de tickets', svgIcono: SVGS.tickets },
      { id: 'usuarios', etiqueta: 'Gestión de usuarios', svgIcono: SVGS.usuarios },
      { id: 'categorias', etiqueta: 'Categorías/servicios', svgIcono: SVGS.categorias },
      { id: 'reportes', etiqueta: 'Reportes', svgIcono: SVGS.reportes },
      { id: 'calificaciones', etiqueta: 'Calificaciones', svgIcono: SVGS.calificaciones },
    ],
  },
  tecnico: {
    tituloPanel: 'PANEL TÉCNICO',
    mostrarBuscador: true,
    items: [
      { id: 'dashboard', etiqueta: 'Dashboard', svgIcono: SVGS.dashboard },
      { id: 'tickets-asignados', etiqueta: 'Tickets asignados', svgIcono: SVGS.checkList },
    ],
  },
  cliente: {
    tituloPanel: 'Portal del Cliente',
    mostrarBuscador: false,
    items: [
      { id: 'dashboard', etiqueta: 'Dashboard', svgIcono: SVGS.dashboard },
      { id: 'crear-ticket', etiqueta: 'Crear ticket nuevo', svgIcono: SVGS.crearTicket },
      { id: 'mis-tickets', etiqueta: 'Listado de mis tickets', svgIcono: SVGS.misTickets },
      { id: 'perfil-equipos', etiqueta: 'Mi Perfil y Equipos', svgIcono: SVGS.perfil },
    ],
  },
};

function normalizarRol(r) {
  if (!r) return 'administrador';
  const lim = String(r).trim().toLowerCase();
  if (lim === 'admin' || lim === 'administrador') return 'administrador';
  if (lim === 'tecnico' || lim === 'técnico') return 'tecnico';
  if (lim === 'cliente') return 'cliente';
  return 'administrador';
}

function detectarRolPorRuta(pathname) {
  if (pathname.startsWith('/admin')) return 'administrador';
  if (pathname.startsWith('/tecnico')) return 'tecnico';
  if (pathname.startsWith('/cliente')) return 'cliente';
  return 'administrador';
}

function detectarItemPorRuta(pathname, rolNorm) {
  const rutas = RUTAS_POR_ROL[rolNorm] || RUTAS_POR_ROL.administrador;
  const entrada = Object.entries(rutas)
    .sort(([, a], [, b]) => b.length - a.length)
    .find(([, r]) => pathname === r || pathname.startsWith(r + '/'));
  return entrada ? entrada[0] : 'dashboard';
}

const rolCalculado = computed(() => {
  if (props.rol) return normalizarRol(props.rol);
  if (route?.path) {
    const rolRuta = detectarRolPorRuta(route.path);
    if (rolRuta) return rolRuta;
  }
  return normalizarRol(sesion.value?.rol);
});

const itemActivoCalculado = computed(() => {
  if (props.itemActivo) return props.itemActivo;
  return detectarItemPorRuta(route?.path || '', rolCalculado.value);
});

const configActual = computed(() => {
  return CONFIG_POR_ROL[rolCalculado.value] || CONFIG_POR_ROL.administrador;
});

const nombreActivo = computed(() => {
  return sesion.value?.nombre || props.nombreUsuario;
});

const inicialUsuario = computed(() => {
  return nombreActivo.value ? nombreActivo.value.charAt(0).toUpperCase() : 'U';
});

const noLeidas = computed(() => {
  return notificaciones.value.filter((n) => !n.leida).length;
});

const seleccionarOpcion = (id) => {
  const rolNorm = rolCalculado.value;
  const rutas = RUTAS_POR_ROL[rolNorm] || RUTAS_POR_ROL.administrador;
  if (rutas[id]) {
    router.push(rutas[id]);
  }
  emit('cambiarItem', id);
  menuMovilAbierto.value = false;
};

const cambiarRolDemo = (nuevoRol) => {
  emit('cambiarRol', nuevoRol);
  const destinos = {
    cliente: '/cliente',
    tecnico: '/tecnico',
    administrador: '/admin',
  };
  if (destinos[nuevoRol]) {
    router.push(destinos[nuevoRol]);
  }
};

const cargarNotifs = async () => {
  try {
    const data = await obtenerNotificaciones();
    notificaciones.value = data || [];
  } catch {
    // silencioso
  }
};

const marcarTodasComoLeidas = async () => {
  try {
    await marcarTodasNotificacionesLeidas();
    notificaciones.value = notificaciones.value.map((n) => ({ ...n, leida: true }));
  } catch (err) {
    console.error(err);
  }
};

const abrirNotificacion = async (n) => {
  if (!n.leida) {
    try {
      await marcarNotificacionLeida(n.id_notificacion);
      n.leida = true;
    } catch {}
  }
  if (n.id_ticket) {
    panelNotifAbierto.value = false;
    const rolNorm = rolCalculado.value;
    if (rolNorm === 'cliente') {
      router.push(`/cliente/tickets/${n.id_ticket}`);
    } else if (rolNorm === 'tecnico') {
      router.push(`/tecnico/tickets/${n.id_ticket}`);
    } else {
      router.push(`/admin/tickets/${n.id_ticket}/asignar`);
    }
  }
};

const claseBadgeTipo = (tipo) => {
  const t = (tipo || '').toLowerCase();
  if (t.includes('asignacion')) return 'asignacion';
  if (t.includes('resolucion')) return 'resolucion';
  if (t.includes('comentario')) return 'comentario';
  return 'actualizacion';
};

const etiquetaBadgeTipo = (tipo) => {
  const t = (tipo || '').toLowerCase();
  if (t.includes('asignacion')) return '🛠️ Asignación';
  if (t.includes('resolucion')) return '✅ Resolución';
  if (t.includes('comentario')) return '💬 Comentario';
  return '🔔 Actualización';
};

const notificacionesFiltradasModal = computed(() => {
  return notificaciones.value.filter((n) => {
    if (filtroHistorial.value === 'no-leidas' && n.leida) return false;
    if (filtroHistorial.value === 'leidas' && !n.leida) return false;
    if (!busquedaNotif.value.trim()) return true;
    const q = busquedaNotif.value.toLowerCase();
    return (
      (n.mensaje || '').toLowerCase().includes(q) ||
      (n.tipo || '').toLowerCase().includes(q) ||
      String(n.id_ticket || '').includes(q)
    );
  });
});

const manejarClickFuera = (e) => {
  if (panelNotifAbierto.value && notifContenedorRef.value && !notifContenedorRef.value.contains(e.target)) {
    panelNotifAbierto.value = false;
  }
};

const abrirHistorialCompleto = () => {
  panelNotifAbierto.value = false;
  modalHistorialAbierto.value = true;
};

const marcarIndividualLeida = async (n) => {
  try {
    await marcarNotificacionLeida(n.id_notificacion);
    n.leida = true;
  } catch (e) {
    console.error(e);
  }
};

const eliminarIndividual = async (id) => {
  try {
    await eliminarNotificacion(id);
    notificaciones.value = notificaciones.value.filter((n) => n.id_notificacion !== id);
  } catch (e) {
    console.error(e);
  }
};

const borrarTodoHistorial = async () => {
  if (!confirm('¿Deseas eliminar permanentemente todo el historial de notificaciones?')) return;
  try {
    await eliminarTodasNotificaciones();
    notificaciones.value = [];
  } catch (e) {
    console.error(e);
  }
};

const manejarCerrarSesion = () => {
  cerrarSesion();
  router.push('/login');
};

onMounted(() => {
  cargarNotifs();
  document.addEventListener('click', manejarClickFuera);
});

onUnmounted(() => {
  document.removeEventListener('click', manejarClickFuera);
});
</script>
