<template>
  <Layout rol="administrador" item-activo="tickets" :nombre-usuario="nombreUsuario">
    <div style="padding: 24px; max-width: 1350px; margin: 0 auto; font-family: var(--fuente-principal, sans-serif);">
      <!-- Encabezado -->
      <header style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px;">
        <div>
          <h1 style="margin: 0; fontSize: 1.75rem; color: var(--color-sidebar-fondo, #071e33); fontWeight: 700;">
            Historial General de Tickets
          </h1>
          <p style="margin: 4px 0 0; color: #64748b; font-size: 0.95rem;">
            Auditoría centralizada, estados y trazabilidad de todos los tickets del sistema ({{ tickets.length }} registrados).
          </p>
        </div>
        <button
          type="button"
          style="background: linear-gradient(135deg, var(--color-primario, #00bba6) 0%, var(--color-primario-oscuro, #008f7e) 100%); color: white; padding: 10px 20px; border-radius: 20px; border: none; font-weight: 700; font-size: 0.9rem; cursor: pointer; box-shadow: 0 4px 14px rgba(0, 187, 166, 0.25); display: inline-flex; align-items: center; gap: 8px; transition: transform 0.2s;"
          @click="router.push('/admin/asignacion')"
        >
          <span>🛠️</span> Bandeja de Asignación ({{ conteo.abiertos }})
        </button>
      </header>

      <!-- Tarjetas KPI de Estado -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="kpi-card-admin" :style="{ borderLeft: '4px solid #071e33' }">
          <div>
            <span style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Total Tickets</span>
            <h3 style="margin: 4px 0 0; font-size: 24px; color: #071e33; font-weight: 800;">{{ conteo.total }}</h3>
          </div>
          <span style="font-size: 24px; opacity: 0.85;">📋</span>
        </div>

        <div class="kpi-card-admin" :style="{ borderLeft: '4px solid #eab308' }">
          <div>
            <span style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Abiertos (Pendientes)</span>
            <h3 style="margin: 4px 0 0; font-size: 24px; color: #eab308; font-weight: 800;">{{ conteo.abiertos }}</h3>
          </div>
          <span style="font-size: 24px; opacity: 0.85;">⏳</span>
        </div>

        <div class="kpi-card-admin" :style="{ borderLeft: '4px solid #0284c7' }">
          <div>
            <span style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">En Atención Técnica</span>
            <h3 style="margin: 4px 0 0; font-size: 24px; color: #0284c7; font-weight: 800;">{{ conteo.enProceso }}</h3>
          </div>
          <span style="font-size: 24px; opacity: 0.85;">⚙️</span>
        </div>

        <div class="kpi-card-admin" :style="{ borderLeft: '4px solid #00bba6' }">
          <div>
            <span style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Resueltos</span>
            <h3 style="margin: 4px 0 0; font-size: 24px; color: #00bba6; font-weight: 800;">{{ conteo.resueltos }}</h3>
          </div>
          <span style="font-size: 24px; opacity: 0.85;">✅</span>
        </div>

        <div class="kpi-card-admin" :style="{ borderLeft: '4px solid #475569' }">
          <div>
            <span style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Cerrados / Archivados</span>
            <h3 style="margin: 4px 0 0; font-size: 24px; color: #475569; font-weight: 800;">{{ conteo.cerrados }}</h3>
          </div>
          <span style="font-size: 24px; opacity: 0.85;">🔒</span>
        </div>
      </div>

      <!-- Panel de Filtros y Búsqueda -->
      <div style="background-color: #ffffff; border: 1px solid var(--color-borde, #e2e8f0); border-radius: 14px; padding: 18px 22px; margin-bottom: 20px; box-shadow: 0 4px 14px rgba(7, 30, 51, 0.04);">
        <div style="display: flex; flex-wrap: wrap; gap: 14px; align-items: center; justify-content: space-between;">
          <!-- Buscador -->
          <input
            v-model="busqueda"
            type="search"
            placeholder="Buscar por #ID, título, cliente, técnico o categoría..."
            style="padding: 10px 16px; border-radius: 20px; border: 1.5px solid #cbd5e1; font-size: 0.9rem; min-width: 280px; flex: 1 1 300px; background-color: #ffffff; outline: none;"
          />

          <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
            <!-- Filtro por prioridad -->
            <select
              v-model="filtroPrioridad"
              style="padding: 8px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 0.85rem; background-color: #ffffff; color: #334155; font-weight: 600; outline: none;"
            >
              <option value="Todas">Todas las Prioridades</option>
              <option value="Critica">Crítica</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>

            <!-- Filtro por técnico -->
            <select
              v-model="filtroTecnico"
              style="padding: 8px 14px; border-radius: 10px; border: 1px solid #cbd5e1; font-size: 0.85rem; background-color: #ffffff; color: #334155; font-weight: 600; outline: none;"
            >
              <option value="Todos">Todos los Técnicos</option>
              <option value="sin_asignar">⚠️ Sin Asignar</option>
              <option v-for="t in tecnicos" :key="t.id_usuario" :value="String(t.id_usuario)">
                {{ t.nombre }} {{ t.apellido }}
              </option>
            </select>
          </div>
        </div>

        <!-- Pestañas de estado -->
        <div style="display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap;">
          <button
            v-for="est in ['Todos', 'Abierto', 'En_Proceso', 'Resuelto', 'Cerrado']"
            :key="est"
            type="button"
            :style="{
              padding: '6px 16px',
              borderRadius: '20px',
              border: filtroEstado === est ? '1px solid var(--color-primario, #00bba6)' : '1px solid #e2e8f0',
              backgroundColor: filtroEstado === est ? 'var(--color-primario, #00bba6)' : '#f8fafc',
              color: filtroEstado === est ? '#ffffff' : '#475569',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }"
            @click="filtroEstado = est"
          >
            {{ est === "Todos" ? "Todos" : est.replace("_", " ") }}
          </button>
        </div>
      </div>

      <!-- Tabla Principal -->
      <div style="background-color: #ffffff; border: 1px solid var(--color-borde, #e2e8f0); border-radius: 14px; overflow: hidden; box-shadow: 0 4px 14px rgba(7, 30, 51, 0.04);">
        <div v-if="cargando" style="padding: 40px; text-align: center; color: #64748b;">
          Cargando historial de tickets...
        </div>

        <div v-else-if="ticketsFiltrados.length === 0" style="padding: 40px 20px; text-align: center;">
          <span style="font-size: 2rem; display: block; margin-bottom: 8px;">📭</span>
          <p style="margin: 0; font-weight: 600; color: #1e293b;">No se encontraron tickets con los criterios indicados.</p>
          <button
            type="button"
            style="margin-top: 12px; padding: 6px 16px; border-radius: 20px; border: 1px solid #cbd5e1; background-color: #ffffff; font-size: 0.85rem; font-weight: 600; cursor: pointer;"
            @click="limpiarFiltros"
          >
            Limpiar filtros
          </button>
        </div>

        <div v-else style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; color: var(--color-texto-principal, #071e33); font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.05em;">
                <th style="padding: 14px 16px;">ID</th>
                <th style="padding: 14px 16px;">Título / Requerimiento</th>
                <th style="padding: 14px 16px;">Cliente</th>
                <th style="padding: 14px 16px;">Técnico Asignado</th>
                <th style="padding: 14px 16px;">Prioridad</th>
                <th style="padding: 14px 16px;">Estado</th>
                <th style="padding: 14px 16px;">Fecha Creación</th>
                <th style="padding: 14px 16px; text-align: right;">Acción / Auditoría</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in ticketsFiltrados" :key="t.id_ticket" style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 14px 16px; font-weight: bold;">
                  <span style="color: var(--color-primario, #00bba6);">#{{ t.id_ticket }}</span>
                </td>
                <td style="padding: 14px 16px;">
                  <div style="font-weight: 700; color: #1e293b; margin-bottom: 4px;">{{ t.titulo }}</div>
                  <div v-if="t.categorias && t.categorias.length > 0" style="display: flex; gap: 4px; flex-wrap: wrap;">
                    <span
                      v-for="(cat, idx) in t.categorias"
                      :key="idx"
                      style="font-size: 11px; background-color: #f1f5f9; padding: 2px 8px; border-radius: 12px; color: #475569; font-weight: 500;"
                    >
                      {{ cat }}
                    </span>
                  </div>
                </td>
                <td style="padding: 14px 16px;">
                  <div style="font-weight: 600; color: #334155;">{{ t.cliente_nombre || "Cliente" }}</div>
                  <div style="font-size: 12px; color: #64748b;">{{ t.cliente_correo || "" }}</div>
                </td>
                <td style="padding: 14px 16px;">
                  <span v-if="t.tecnico_nombre" style="font-weight: 600; color: var(--color-sidebar-fondo, #071e33); display: inline-flex; align-items: center; gap: 4px;">
                    🛠️ {{ t.tecnico_nombre }}
                  </span>
                  <button
                    v-else
                    type="button"
                    style="padding: 4px 10px; border-radius: 6px; background-color: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; font-size: 12px; font-weight: 700; cursor: pointer;"
                    @click="router.push(`/admin/tickets/${t.id_ticket}/asignar`)"
                  >
                    ⚠️ Sin asignar (Asignar →)
                  </button>
                </td>
                <td style="padding: 14px 16px;">
                  <span :style="{ color: obtenerColorPrioridad(t.prioridad), fontWeight: 700, fontSize: '0.85rem' }">
                    ● {{ t.prioridad }}
                  </span>
                </td>
                <td style="padding: 14px 16px;">
                  <EstadoBadge :estado="t.estado" />
                </td>
                <td style="padding: 14px 16px; font-size: 0.85rem; color: #64748b;">
                  {{ t.fecha_creacion }}
                </td>
                <td style="padding: 14px 16px; text-align: right;">
                  <button
                    type="button"
                    style="padding: 6px 14px; border-radius: 8px; background-color: #f8fafc; color: var(--color-sidebar-fondo, #071e33); border: 1px solid #cbd5e1; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
                    @click="abrirAuditoria(t.id_ticket)"
                  >
                    🔍 Ver Auditoría
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal de Auditoría y Trazabilidad Completa -->
      <div
        v-if="ticketAuditoria"
        style="position: fixed; inset: 0; background-color: rgba(7, 30, 51, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;"
      >
        <div
          style="background-color: #ffffff; border-radius: 16px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15);"
        >
          <!-- Modal Header -->
          <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="font-size: 1.1rem; font-weight: 700; color: var(--color-primario, #00bba6);">#{{ ticketAuditoria.id_ticket }}</span>
                <EstadoBadge :estado="ticketAuditoria.estado" />
                <span
                  v-if="!ticketAuditoria.id_tecnico"
                  style="padding: 3px 10px; border-radius: 9999px; background-color: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; font-size: 0.78rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;"
                >
                  ⚠️ Sin Asignar
                </span>
              </div>
              <h2 style="margin: 4px 0 0; font-size: 1.25rem; color: #1e293b;">{{ ticketAuditoria.titulo }}</h2>
            </div>
            <button
              type="button"
              style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b;"
              @click="cerrarAuditoria"
            >
              ✕
            </button>
          </div>

          <!-- Modal Body -->
          <div style="padding: 24px;">
            <!-- Alerta para tickets sin asignar -->
            <div
              v-if="!ticketAuditoria.id_tecnico"
              style="margin-bottom: 20px; padding: 14px 18px; border-radius: 12px; background-color: #fff7ed; border: 1.5px solid #fed7aa; display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;"
            >
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 1.75rem;">⚠️</span>
                <div>
                  <div style="font-weight: 700; color: #9a3412; font-size: 0.95rem;">
                    Ticket Pendiente de Asignación Técnica
                  </div>
                  <div style="font-size: 0.85rem; color: #c2410c; margin-top: 2px;">
                    Este ticket se encuentra en estado <strong>Abierto</strong> y aún no tiene ningún técnico asignado ni solución registrada.
                  </div>
                </div>
              </div>
              <button
                type="button"
                style="padding: 8px 18px; border-radius: 20px; background-color: #ea580c; color: #ffffff; border: none; font-size: 0.85rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(234, 88, 12, 0.25); transition: opacity 0.2s;"
                @click="irAAsignar(ticketAuditoria.id_ticket)"
              >
                <span>🛠️</span> Asignar Técnico Ahora →
              </button>
            </div>

            <!-- Metadatos -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; padding: 14px; background-color: #f8fafc; border-radius: 10px; margin-bottom: 20px;">
              <div>
                <span style="font-size: 12px; color: #64748b; display: block;">Cliente:</span>
                <strong style="font-size: 14px; color: #1e293b;">{{ ticketAuditoria.cliente_nombre || "Cliente" }}</strong>
              </div>
              <div>
                <span style="font-size: 12px; color: #64748b; display: block;">Técnico Asignado:</span>
                <strong
                  v-if="ticketAuditoria.tecnico_nombre"
                  style="font-size: 14px; color: var(--color-sidebar-fondo, #071e33);"
                >
                  🛠️ {{ ticketAuditoria.tecnico_nombre }}
                </strong>
                <span
                  v-else
                  style="font-size: 13px; font-weight: 700; color: #b91c1c; display: inline-flex; align-items: center; gap: 4px;"
                >
                  ⚠️ Sin Asignar (Pendiente de triaje)
                </span>
              </div>
              <div>
                <span style="font-size: 12px; color: #64748b; display: block;">Prioridad:</span>
                <strong style="font-size: 14px;">{{ ticketAuditoria.prioridad }}</strong>
              </div>
              <div>
                <span style="font-size: 12px; color: #64748b; display: block;">Modalidad:</span>
                <strong style="font-size: 14px;">{{ ticketAuditoria.modalidad || "Presencial" }}</strong>
              </div>
            </div>

            <!-- Descripción -->
            <div style="margin-bottom: 20px;">
              <h4 style="margin: 0 0 6px; font-size: 0.95rem; color: var(--color-sidebar-fondo, #071e33);">Descripción del caso:</h4>
              <p style="margin: 0; padding: 12px; background-color: #f1f5f9; border-radius: 8px; font-size: 0.9rem; color: #334155; line-height: 1.5;">
                {{ ticketAuditoria.descripcion }}
              </p>
            </div>

            <!-- Reporte de Solución Técnica (Solo si el ticket está Resuelto o Cerrado) -->
            <div
              v-if="(ticketAuditoria.estado === 'Resuelto' || ticketAuditoria.estado === 'Cerrado') && ticketAuditoria.reporte"
              style="margin-bottom: 20px; padding: 16px; border-radius: 10px; background-color: #e6f9f6; border: 1px solid #9ee7dc;"
            >
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
                <strong style="color: #007a6c; font-size: 14px; display: flex; align-items: center; gap: 6px;">
                  <span>🛠️</span> Reporte de Solución Técnica (Cierre de Atención)
                </strong>
                <span style="font-size: 12px; color: #007a6c; font-weight: 600;">
                  {{ ticketAuditoria.reporte.fecha_reporte }}
                </span>
              </div>
              <p style="margin: 0; font-size: 0.9rem; color: #071e33; line-height: 1.5;">
                {{ ticketAuditoria.reporte.solucion_aplicada }}
              </p>
            </div>

            <!-- Calificación del Cliente (Solo si el ticket está Resuelto o Cerrado) -->
            <div
              v-if="(ticketAuditoria.estado === 'Resuelto' || ticketAuditoria.estado === 'Cerrado') && ticketAuditoria.calificacion"
              style="margin-bottom: 20px; padding: 14px; border-radius: 8px; background-color: #fefce8; border: 1px solid #fef08a;"
            >
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="color: #eab308; font-size: 1.1rem;">
                  {{ '★'.repeat(ticketAuditoria.calificacion.puntuacion || 0) }}{{ '☆'.repeat(5 - (ticketAuditoria.calificacion.puntuacion || 0)) }}
                </span>
                <strong style="font-size: 14px; color: #854d0e;">
                  Calificación del Cliente ({{ ticketAuditoria.calificacion.puntuacion }}/5)
                </strong>
              </div>
              <p v-if="ticketAuditoria.calificacion.comentario" style="margin: 0; font-style: italic; font-size: 13px; color: #713f12;">
                "{{ ticketAuditoria.calificacion.comentario }}"
              </p>
            </div>

            <!-- Historial de Trazabilidad -->
            <div>
              <h4 style="margin: 0 0 12px; font-size: 0.95rem; color: var(--color-sidebar-fondo, #071e33);">📜 Historial de Eventos y Trazabilidad</h4>
              <p v-if="!ticketAuditoria.historial || ticketAuditoria.historial.length === 0" style="color: #64748b; font-size: 13px;">
                Sin historial registrado.
              </p>
              <div v-else style="display: flex; flex-direction: column; gap: 10px;">
                <div
                  v-for="(h, i) in ticketAuditoria.historial"
                  :key="h.id_historial || i"
                  style="padding: 12px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem;"
                >
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
                    <span
                      :style="{
                        backgroundColor: obtenerEstiloAccion(h.tipo_accion).bg,
                        color: obtenerEstiloAccion(h.tipo_accion).color,
                        border: `1px solid ${obtenerEstiloAccion(h.tipo_accion).borde}`,
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700
                      }"
                    >
                      {{ h.tipo_accion }}
                    </span>
                    <span style="color: #94a3b8; font-size: 12px;">{{ h.fecha_accion }}</span>
                  </div>
                  <div style="color: #334155; line-height: 1.4;">{{ h.detalles }}</div>
                  <div v-if="h.nombre_usuario" style="margin-top: 4px; font-size: 11px; color: #64748b;">
                    Ejecutado por: <strong>{{ h.nombre_usuario }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <button
                v-if="!ticketAuditoria.id_tecnico"
                type="button"
                style="padding: 8px 18px; border-radius: 20px; background-color: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; font-weight: 700; font-size: 0.85rem; cursor: pointer;"
                @click="irAAsignar(ticketAuditoria.id_ticket)"
              >
                ⚠️ Asignar a un técnico →
              </button>
            </div>
            <button
              type="button"
              style="padding: 8px 20px; border-radius: 20px; background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; font-weight: 600; cursor: pointer;"
              @click="cerrarAuditoria"
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Layout from '../../components/Layout.vue';
import EstadoBadge from '../../components/EstadoBadge.vue';
import { useAuth } from '../../context/useAuth';
import { listarTickets, obtenerTicket } from '../../services/ticketsService';
import { listarTecnicos } from '../../services/reportesService';

const router = useRouter();
const { sesion } = useAuth();

const tickets = ref([]);
const tecnicos = ref([]);
const cargando = ref(true);

const filtroEstado = ref('Todos');
const filtroPrioridad = ref('Todas');
const filtroTecnico = ref('Todos');
const busqueda = ref('');

const ticketAuditoria = ref(null);
const cargandoAuditoria = ref(false);

const nombreUsuario = computed(() => sesion.value?.nombre || 'Administrador');

onMounted(async () => {
  try {
    const [listaTickets, listaTecnicos] = await Promise.all([
      listarTickets({ todos: true }),
      listarTecnicos()
    ]);
    tickets.value = listaTickets;
    tecnicos.value = listaTecnicos;
  } catch (err) {
    console.error('Error al cargar historial de tickets:', err);
  } finally {
    cargando.value = false;
  }
});

const abrirAuditoria = async (idTicket) => {
  cargandoAuditoria.value = true;
  try {
    const detalle = await obtenerTicket(idTicket);
    ticketAuditoria.value = detalle;
  } catch (err) {
    alert('No se pudo cargar la auditoría del ticket: ' + err.message);
  } finally {
    cargandoAuditoria.value = false;
  }
};

const cerrarAuditoria = () => {
  ticketAuditoria.value = null;
};

const irAAsignar = (idTicket) => {
  cerrarAuditoria();
  router.push(`/admin/tickets/${idTicket}/asignar`);
};

const obtenerEstiloAccion = (tipoAccion) => {
  const tipo = String(tipoAccion || '').toLowerCase();
  if (tipo.includes('creacion')) return { bg: '#e0f2fe', color: '#0369a1', borde: '#bae6fd' };
  if (tipo.includes('asignacion')) return { bg: '#eef2ff', color: '#4338ca', borde: '#c7d2fe' };
  if (tipo.includes('resolucion')) return { bg: '#e6f9f6', color: '#007a6c', borde: '#9ee7dc' };
  if (tipo.includes('cierre')) return { bg: '#f1f5f9', color: '#475569', borde: '#cbd5e1' };
  return { bg: '#fef3c7', color: '#b45309', borde: '#fde68a' };
};

const conteo = computed(() => {
  return {
    total: tickets.value.length,
    abiertos: tickets.value.filter((t) => t.estado === 'Abierto').length,
    enProceso: tickets.value.filter((t) => t.estado === 'En_Proceso').length,
    resueltos: tickets.value.filter((t) => t.estado === 'Resuelto').length,
    cerrados: tickets.value.filter((t) => t.estado === 'Cerrado').length
  };
});

const ticketsFiltrados = computed(() => {
  return tickets.value.filter((t) => {
    const coincideEstado = filtroEstado.value === 'Todos' ? true : t.estado === filtroEstado.value;
    const coincidePrioridad = filtroPrioridad.value === 'Todas' ? true : t.prioridad === filtroPrioridad.value;

    let coincideTecnico = true;
    if (filtroTecnico.value === 'sin_asignar') {
      coincideTecnico = !t.id_tecnico;
    } else if (filtroTecnico.value !== 'Todos') {
      coincideTecnico = String(t.id_tecnico) === String(filtroTecnico.value);
    }

    if (!coincideEstado || !coincidePrioridad || !coincideTecnico) return false;

    if (!busqueda.value.trim()) return true;
    const q = busqueda.value.toLowerCase();
    const cliente = String(t.cliente_nombre || '').toLowerCase();
    const tecnico = String(t.tecnico_nombre || '').toLowerCase();
    const cats = (t.categorias || []).map((c) => String(c).toLowerCase());

    return (
      String(t.id_ticket).includes(q) ||
      String(t.titulo || '').toLowerCase().includes(q) ||
      cliente.includes(q) ||
      tecnico.includes(q) ||
      cats.some((c) => c.includes(q))
    );
  });
});

const limpiarFiltros = () => {
  filtroEstado.value = 'Todos';
  filtroPrioridad.value = 'Todas';
  filtroTecnico.value = 'Todos';
  busqueda.value = '';
};

const obtenerColorPrioridad = (prioridad) => {
  if (prioridad === 'Critica') return '#dc2626';
  if (prioridad === 'Alta') return '#ea580c';
  if (prioridad === 'Media') return '#00bba6';
  return '#64748b';
};
</script>

<style scoped>
.kpi-card-admin {
  background-color: #ffffff;
  padding: 16px 20px;
  border-radius: 14px;
  border: 1px solid var(--color-borde, #e2e8f0);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 14px rgba(7, 30, 51, 0.04);
  transition: transform 0.2s ease;
}

.kpi-card-admin:hover {
  transform: translateY(-2px);
}
</style>
