<template>
  <Layout
    rol="administrador"
    item-activo="categorias"
    :nombre-usuario="sesion?.nombre || 'Administrador'"
  >
    <div class="categorias-pagina">
      <!-- Encabezado principal -->
      <header class="categorias-header-principal">
        <div>
          <h1 class="categorias-titulo-principal">Gestión de Categorías</h1>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 0.95rem;">
            Catálogo oficial de soporte técnico según Documento Definitivo v2.0
          </p>
        </div>
        <button
          type="button"
          class="boton-nuevo"
          aria-label="Crear nueva categoría"
          @click="abrirModalNuevaCategoria"
        >
          + Nueva categoría
        </button>
      </header>

      <!-- Notificaciones / Alertas -->
      <div
        v-if="alerta"
        :class="['categorias-alerta', alerta.tipo === 'exito' ? 'categorias-alerta-exito' : 'categorias-alerta-error']"
        role="status"
      >
        <span>{{ alerta.mensaje }}</span>
        <button
          type="button"
          class="categorias-alerta-cerrar"
          aria-label="Cerrar alerta"
          @click="alerta = null"
        >
          ×
        </button>
      </div>

      <div v-if="cargando" style="text-align: center; padding: 48px; color: #64748b;">
        Cargando categorías...
      </div>

      <div v-else class="categorias-grid">
        <!-- COLUMNA IZQUIERDA: Listado de categorías con botón editar -->
        <section class="categorias-columna" aria-label="Listado de categorías">
          <div class="columna-header">
            <h2 class="columna-titulo">Categorías ({{ categorias.length }})</h2>
          </div>

          <div class="categorias-lista">
            <div
              v-for="cat in categorias"
              :key="cat.id_categoria"
              :class="['tarjeta-categoria', { seleccionada: cat.id_categoria === categoriaSeleccionadaId }]"
              role="button"
              tabindex="0"
              @click="categoriaSeleccionadaId = cat.id_categoria"
              @keydown.enter="categoriaSeleccionadaId = cat.id_categoria"
              @keydown.space.prevent="categoriaSeleccionadaId = cat.id_categoria"
            >
              <div class="tarjeta-categoria-info">
                <span class="tarjeta-categoria-nombre">{{ cat.nombre_categoria }}</span>
                <span
                  v-if="cat.descripcion"
                  class="tarjeta-categoria-subtexto"
                  style="display: block; color: #64748b; font-size: 0.85rem; margin-top: 2px;"
                >
                  {{ cat.descripcion.length > 55 ? cat.descripcion.substring(0, 52) + '...' : cat.descripcion }}
                </span>
              </div>

              <div class="tarjeta-acciones-categoria" @click.stop>
                <button
                  type="button"
                  class="boton-accion-icono boton-editar"
                  title="Editar categoría"
                  :aria-label="`Editar categoría ${cat.nombre_categoria}`"
                  @click="abrirModalEditarCategoria($event, cat)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                </button>
                <button
                  type="button"
                  class="boton-accion-icono boton-eliminar"
                  title="Eliminar categoría"
                  :aria-label="`Eliminar categoría ${cat.nombre_categoria}`"
                  @click="solicitarEliminarCategoria($event, cat)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- COLUMNA DERECHA: Detalle de la categoría seleccionada -->
        <section class="categorias-columna" aria-label="Detalle de categoría">
          <div class="columna-header">
            <h2 class="columna-titulo">Detalle de la categoría</h2>
            <div v-if="categoriaActiva" style="display: flex; gap: 8px;">
              <button
                type="button"
                class="boton-accion-icono boton-editar"
                title="Editar esta categoría"
                style="border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: 8px; display: flex; gap: 6px; align-items: center; font-size: 0.85rem; background: #fff; cursor: pointer; font-weight: 600;"
                @click="abrirModalEditarCategoria($event, categoriaActiva)"
              >
                ✏️ Editar
              </button>
              <button
                type="button"
                class="boton-eliminar-panel"
                title="Eliminar esta categoría"
                @click="solicitarEliminarCategoria($event, categoriaActiva)"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>

          <div
            v-if="categoriaActiva"
            class="categoria-detalle-panel"
            style="background-color: #ffffff; border-radius: 14px; border: 1px solid var(--color-borde, #e2e8f0); padding: 24px; box-shadow: 0 4px 14px rgba(7, 30, 51, 0.04);"
          >
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
              <div style="color: var(--color-primario, #00bba6); background: rgba(0, 187, 166, 0.1); padding: 12px; border-radius: 10px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div>
                <span style="font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">
                  Categoría #{{ categoriaActiva.id_categoria }}
                </span>
                <h3 style="margin: 2px 0 0 0; font-size: 1.35rem; color: var(--color-sidebar-fondo, #071e33); font-weight: 700;">
                  {{ categoriaActiva.nombre_categoria }}
                </h3>
              </div>
            </div>

            <div style="border-top: 1px solid #f1f5f9; padding-top: 16px;">
              <h4 style="margin: 0 0 8px 0; font-size: 0.95rem; color: #334155; font-weight: 600;">
                Descripción del servicio
              </h4>
              <p style="margin: 0; color: #475569; line-height: 1.6; font-size: 0.95rem;">
                {{ categoriaActiva.descripcion || "Sin descripción registrada." }}
              </p>
            </div>

            <div style="margin-top: 24px; padding: 12px 16px; background-color: #f8fafc; border-radius: 8px; border-left: 3px solid var(--color-primario, #00bba6); font-size: 0.85rem; color: #475569;">
              <strong>Alcance del modelo v2.0:</strong> La categoría clasifica los tickets técnicos. El catálogo oficial no incluye liquidación de repuestos ni costos referenciales.
            </div>
          </div>

          <div v-else style="text-align: center; padding: 32px; color: #94a3b8; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">
            Seleccione una categoría para consultar su detalle.
          </div>
        </section>
      </div>

      <!-- MODAL: Crear o Editar Categoría -->
      <div v-if="modalAbierto" class="modal-overlay" role="dialog" aria-modal="true">
        <div class="modal-contenido" style="max-width: 480px;">
          <div class="modal-header">
            <h3 class="modal-titulo">
              {{ categoriaEnEdicion ? "Editar categoría" : "Nueva categoría" }}
            </h3>
            <button
              type="button"
              class="modal-boton-cerrar"
              aria-label="Cerrar modal"
              @click="modalAbierto = false"
            >
              ×
            </button>
          </div>

          <form @submit.prevent="guardarCategoria">
            <div class="modal-body">
              <div v-if="errorFormulario" style="padding: 8px 12px; background: #fef2f2; color: #991b1b; border-radius: 6px; margin-bottom: 14px; font-size: 0.85rem;">
                {{ errorFormulario }}
              </div>

              <div class="formulario-campo">
                <label for="nombre_categoria">
                  Nombre de la categoría <span style="color: #ef4444;">*</span>
                </label>
                <input
                  id="nombre_categoria"
                  v-model="formCategoria.nombre_categoria"
                  type="text"
                  placeholder="Ej. Redes y Conectividad"
                  required
                  autofocus
                />
              </div>

              <div class="formulario-campo">
                <label for="descripcion_categoria">Descripción</label>
                <textarea
                  id="descripcion_categoria"
                  v-model="formCategoria.descripcion"
                  rows="3"
                  placeholder="Describa el alcance de la categoría técnica..."
                />
              </div>
            </div>

            <div class="modal-footer" :style="{ justifyContent: categoriaEnEdicion ? 'space-between' : 'flex-end' }">
              <button
                v-if="categoriaEnEdicion"
                type="button"
                class="boton-eliminar-panel"
                :disabled="guardando"
                @click="solicitarEliminarCategoria(null, categoriaEnEdicion)"
              >
                🗑️ Eliminar
              </button>
              <div style="display: flex; gap: 10px;">
                <button
                  type="button"
                  class="boton-secundario"
                  :disabled="guardando"
                  @click="modalAbierto = false"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="boton-primario"
                  :disabled="guardando"
                >
                  {{ guardando ? "Guardando..." : categoriaEnEdicion ? "Guardar cambios" : "Crear categoría" }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de confirmación para eliminar categoría -->
      <div v-if="categoriaAEliminar" class="modal-overlay" role="dialog" aria-modal="true">
        <div class="modal-contenido" style="max-width: 440px;">
          <div class="modal-header">
            <h3 class="modal-titulo" style="color: #dc2626; display: flex; align-items: center; gap: 8px;">
              <span>⚠️</span> Confirmar eliminación
            </h3>
            <button
              type="button"
              class="modal-boton-cerrar"
              aria-label="Cerrar modal"
              @click="categoriaAEliminar = null"
            >
              ×
            </button>
          </div>

          <div class="modal-body">
            <p style="margin: 0; color: #334155; font-size: 0.95rem;">
              ¿Estás seguro de que deseas eliminar permanentemente la categoría:
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
              <div style="fontWeight: 700; color: #0f172a; font-size: 1.05rem;">
                {{ categoriaAEliminar.nombre_categoria }}
              </div>
              <div v-if="categoriaAEliminar.descripcion" style="font-size: 0.85rem; color: #64748b; margin-top: 4px;">
                {{ categoriaAEliminar.descripcion }}
              </div>
            </div>

            <p style="margin: 0; font-size: 0.85rem; color: #64748b;">
              Esta acción desvinculará esta categoría del catálogo técnico oficial.
            </p>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="boton-secundario"
              :disabled="eliminando"
              @click="categoriaAEliminar = null"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="modal-boton-eliminar-confirmar"
              :disabled="eliminando"
              @click="confirmarEliminarCategoria"
            >
              {{ eliminando ? "Eliminando..." : "Sí, eliminar" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Layout from '../../components/Layout.vue';
import { useAuth } from '../../context/useAuth';
import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} from '../../services/adminService';
import './GestionCategorias.css';

const { sesion } = useAuth();

const categorias = ref([]);
const categoriaSeleccionadaId = ref(null);
const cargando = ref(true);
const alerta = ref(null);

const modalAbierto = ref(false);
const categoriaEnEdicion = ref(null);
const formCategoria = ref({ nombre_categoria: '', descripcion: '' });
const errorFormulario = ref('');
const guardando = ref(false);

const categoriaAEliminar = ref(null);
const eliminando = ref(false);

const mostrarAlerta = (tipo, mensaje) => {
  alerta.value = { tipo, mensaje };
  setTimeout(() => {
    alerta.value = null;
  }, 4000);
};

onMounted(async () => {
  try {
    const lista = await obtenerCategorias();
    categorias.value = lista;
    if (lista.length > 0) {
      categoriaSeleccionadaId.value = lista[0].id_categoria;
    }
  } catch (err) {
    mostrarAlerta('error', 'Error al cargar categorías: ' + err.message);
  } finally {
    cargando.value = false;
  }
});

const categoriaActiva = computed(() => {
  return categorias.value.find((c) => c.id_categoria === categoriaSeleccionadaId.value) || null;
});

const abrirModalNuevaCategoria = () => {
  categoriaEnEdicion.value = null;
  formCategoria.value = { nombre_categoria: '', descripcion: '' };
  errorFormulario.value = '';
  modalAbierto.value = true;
};

const abrirModalEditarCategoria = (e, cat) => {
  if (e) e.stopPropagation();
  categoriaEnEdicion.value = cat;
  formCategoria.value = {
    nombre_categoria: cat.nombre_categoria,
    descripcion: cat.descripcion || ''
  };
  errorFormulario.value = '';
  modalAbierto.value = true;
};

const solicitarEliminarCategoria = (e, cat) => {
  if (e) e.stopPropagation();
  categoriaAEliminar.value = cat;
};

const confirmarEliminarCategoria = async () => {
  if (!categoriaAEliminar.value) return;
  eliminando.value = true;
  try {
    await eliminarCategoria(categoriaAEliminar.value.id_categoria);
    categorias.value = categorias.value.filter((c) => c.id_categoria !== categoriaAEliminar.value.id_categoria);
    if (categoriaSeleccionadaId.value === categoriaAEliminar.value.id_categoria) {
      const restantes = categorias.value.filter((c) => c.id_categoria !== categoriaAEliminar.value.id_categoria);
      categoriaSeleccionadaId.value = restantes.length > 0 ? restantes[0].id_categoria : null;
    }
    mostrarAlerta('exito', `Categoría "${categoriaAEliminar.value.nombre_categoria}" eliminada correctamente.`);
    if (modalAbierto.value && categoriaEnEdicion.value?.id_categoria === categoriaAEliminar.value.id_categoria) {
      modalAbierto.value = false;
    }
    categoriaAEliminar.value = null;
  } catch (err) {
    mostrarAlerta('error', err.message || 'Error al eliminar la categoría');
  } finally {
    eliminando.value = false;
  }
};

const guardarCategoria = async () => {
  errorFormulario.value = '';
  const nombre = formCategoria.value.nombre_categoria.trim();
  if (!nombre) {
    errorFormulario.value = 'El nombre de la categoría es obligatorio';
    return;
  }

  guardando.value = true;
  try {
    if (categoriaEnEdicion.value) {
      const catActualizada = await actualizarCategoria(categoriaEnEdicion.value.id_categoria, formCategoria.value);
      categorias.value = categorias.value.map((c) =>
        c.id_categoria === catActualizada.id_categoria ? catActualizada : c
      );
      mostrarAlerta('exito', `Categoría "${catActualizada.nombre_categoria}" actualizada correctamente.`);
    } else {
      const nuevaCat = await crearCategoria(formCategoria.value);
      categorias.value.push(nuevaCat);
      categoriaSeleccionadaId.value = nuevaCat.id_categoria;
      mostrarAlerta('exito', `Categoría "${nuevaCat.nombre_categoria}" creada exitosamente.`);
    }
    modalAbierto.value = false;
  } catch (err) {
    errorFormulario.value = err.message || 'Error al guardar la categoría';
  } finally {
    guardando.value = false;
  }
};
</script>
