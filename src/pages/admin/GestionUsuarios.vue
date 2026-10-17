<template>
  <Layout rol="administrador" item-activo="usuarios">
    <div style="max-width: 1200px; margin: 0 auto; padding: 8px 16px 40px 16px;">
      <h1 style="color: var(--color-sidebar-fondo, #071e33); font-weight: 700; margin-bottom: 24px;">
        Gestión de usuarios
      </h1>

      <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px;">
        <input
          v-model="busqueda"
          placeholder="Buscar por nombre o correo"
          style="flex: 1; padding: 10px 16px; border-radius: 20px; border: 1.5px solid #cbd5e1; outline: none;"
          @input="pagina = 1"
        />
        <select
          v-model="filtroRol"
          style="padding: 10px 16px; border-radius: 20px; border: 1.5px solid #cbd5e1; outline: none; background: #fff; font-weight: 600;"
          @change="pagina = 1"
        >
          <option value="todos">Filtro: rol</option>
          <option value="Cliente">Cliente</option>
          <option value="Tecnico">Técnico</option>
          <option value="Administrador">Administrador</option>
        </select>
        <button
          style="padding: 10px 20px; background: linear-gradient(135deg, var(--color-primario, #00bba6) 0%, var(--color-primario-oscuro, #008f7e) 100%); color: white; border: none; border-radius: 20px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(0, 187, 166, 0.25);"
          @click="abrirNuevo"
        >
          + Nuevo usuario
        </button>
      </div>

      <div
        v-if="mensaje"
        style="padding: 12px 18px; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; border-radius: 8px; margin-bottom: 16px;"
      >
        {{ mensaje }}
      </div>

      <h3 style="color: var(--color-sidebar-fondo, #071e33); font-weight: 700; margin-bottom: 12px;">
        Listado de usuarios
      </h3>

      <div style="background-color: #ffffff; border: 1px solid var(--color-borde, #e2e8f0); border-radius: 14px; overflow: hidden; box-shadow: 0 4px 14px rgba(7, 30, 51, 0.04);">
        <Tabla :columnas="columnas" :filas="visibles" mensaje-vacio="No hay usuarios con ese filtro">
          <template #col-id_usuario="{ fila }">
            <span style="font-weight: 700; color: var(--color-primario, #00bba6);">
              {{ String(fila.id_usuario).padStart(2, '0') }}
            </span>
          </template>

          <template #col-nombre="{ fila }">
            <strong>{{ fila.nombre }} {{ fila.apellido }}</strong>
            <br />
            <small style="color: #64748b;">{{ fila.correo_electronico }}</small>
          </template>

          <template #col-rol="{ fila }">
            <span style="font-weight: 600;">{{ normalizarRol(fila.rol) }}</span>
          </template>

          <template #col-estado="{ fila }">
            <EstadoBadge :estado="fila.estado" />
          </template>

          <template #col-acciones="{ fila }">
            <div style="display: flex; gap: 8px;">
              <button
                title="Editar usuario"
                style="padding: 6px 12px; background: #f0fdfa; color: var(--color-primario-oscuro, #008f7e); border: 1px solid rgba(0, 187, 166, 0.3); border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"
                @click="abrirEditar(fila)"
              >
                ⚙️ Editar
              </button>
              <button
                title="Eliminar usuario"
                style="padding: 6px 12px; background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"
                @click="solicitarEliminar(fila)"
              >
                🗑️ Eliminar
              </button>
            </div>
          </template>
        </Tabla>
      </div>

      <!-- Paginación -->
      <div style="text-align: center; margin-top: 16px; display: flex; align-items: center; justify-content: center; gap: 12px;">
        <button
          :disabled="paginaActual === 1"
          style="padding: 6px 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; font-weight: 600;"
          @click="pagina = paginaActual - 1"
        >
          Anterior
        </button>
        <span style="color: #475569; font-weight: 600;">Página {{ paginaActual }} de {{ totalPaginas }}</span>
        <button
          :disabled="paginaActual === totalPaginas"
          style="padding: 6px 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; font-weight: 600;"
          @click="pagina = paginaActual + 1"
        >
          Siguiente
        </button>
      </div>

      <!-- Modal de Formulario -->
      <div v-if="form" class="modal-overlay">
        <div class="modal-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h2 style="margin: 0; font-size: 1.3rem; color: var(--color-sidebar-fondo, #071e33);">
              {{ form.id_usuario ? "Editar usuario" : "Nuevo usuario" }}
            </h2>
            <button
              style="background: none; border: none; font-size: 1.3rem; cursor: pointer; color: #6b7280;"
              @click="cerrar"
            >
              ✕
            </button>
          </div>

          <form @submit.prevent="guardar">
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 4px;">Tipo de usuario</label>
            <select v-model="form.rol" class="campo-input">
              <option value="Cliente">Cliente</option>
              <option value="Tecnico">Técnico</option>
              <option value="Administrador">Administrador</option>
            </select>

            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 4px;">Nombre</label>
            <input v-model="form.nombre" class="campo-input" />

            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 4px;">Apellido</label>
            <input v-model="form.apellido" class="campo-input" />

            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 4px;">Correo electrónico</label>
            <input v-model="form.correo_electronico" class="campo-input" />

            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 4px;">Contraseña</label>
            <input
              v-model="form.contrasena"
              type="password"
              :placeholder="form.id_usuario ? 'Dejar vacío para no cambiar' : ''"
              class="campo-input"
            />

            <div style="margin-bottom: 16px;">
              <span style="font-size: 0.85rem; font-weight: 600; color: #334155; margin-right: 12px;">Estado:</span>
              <label style="margin-right: 12px; font-size: 0.9rem; cursor: pointer;">
                <input
                  v-model="form.estado"
                  type="radio"
                  value="Activo"
                  accent-color="var(--color-primario, #00bba6)"
                /> Activo
              </label>
              <label style="font-size: 0.9rem; cursor: pointer;">
                <input
                  v-model="form.estado"
                  type="radio"
                  value="Inactivo"
                  accent-color="var(--color-primario, #00bba6)"
                /> Inactivo
              </label>
            </div>

            <p v-if="error" style="color: #dc2626; font-size: 0.9rem; margin-bottom: 12px;">{{ error }}</p>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
              <button
                v-if="form.id_usuario"
                type="button"
                style="padding: 8px 14px; background: #fff; color: #dc2626; border: 1px solid #fca5a5; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600;"
                @click="solicitarEliminar(form)"
              >
                🗑️ Eliminar
              </button>
              <div style="display: flex; gap: 10px; margin-left: auto;">
                <button
                  type="button"
                  style="padding: 8px 18px; border-radius: 8px; border: 1px solid #ccc; background: #f9fafb; font-weight: 600; cursor: pointer;"
                  @click="cerrar"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style="padding: 8px 18px; background: linear-gradient(135deg, var(--color-primario, #00bba6) 0%, var(--color-primario-oscuro, #008f7e) 100%); color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 8px rgba(0, 187, 166, 0.25);"
                >
                  Guardar usuario
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Confirmar Eliminación -->
      <div v-if="usuarioAEliminar" class="modal-overlay">
        <div class="modal-card" style="width: 440px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0; color: #991b1b; display: flex; align-items: center; gap: 6px;">
              <span>⚠️</span> Confirmar eliminación
            </h3>
            <button
              style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #6b7280;"
              @click="usuarioAEliminar = null; errorEliminar = '';"
            >
              ✕
            </button>
          </div>

          <p style="margin: 0 0 12px 0; color: #374151; font-size: 0.95rem;">
            ¿Estás seguro de que deseas eliminar permanentemente al usuario:
          </p>

          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 14px;">
            <div style="font-weight: 600; color: #111827;">
              {{ usuarioAEliminar.nombre }} {{ usuarioAEliminar.apellido }}
            </div>
            <div style="font-size: 0.85rem; color: #6b7280;">
              {{ usuarioAEliminar.correo_electronico }}
            </div>
            <div style="font-size: 0.85rem; color: #4b5563; margin-top: 4px;">
              Rol: <strong>{{ normalizarRol(usuarioAEliminar.rol) }}</strong>
            </div>
          </div>

          <div
            v-if="errorEliminar"
            style="padding: 10px; background: #fef2f2; color: #b91c1c; border-radius: 6px; font-size: 0.85rem; margin-bottom: 14px; border: 1px solid #f87171;"
          >
            {{ errorEliminar }}
          </div>
          <p v-else style="font-size: 0.8rem; color: #6b7280; margin: 0 0 16px 0;">
            Esta acción no se puede deshacer. Se desvinculará al usuario del sistema.
          </p>

          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button
              type="button"
              style="padding: 8px 16px; border-radius: 6px; border: 1px solid #d1d5db; background: white; cursor: pointer; font-weight: 600;"
              @click="usuarioAEliminar = null; errorEliminar = '';"
            >
              {{ errorEliminar ? "Cerrar" : "Cancelar" }}
            </button>
            <button
              v-if="!errorEliminar"
              type="button"
              :disabled="eliminando"
              style="padding: 8px 16px; border-radius: 6px; border: none; background: #dc2626; color: white; font-weight: 600; cursor: pointer;"
              @click="confirmarEliminar"
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
import Tabla from '../../components/Tabla.vue';
import EstadoBadge from '../../components/EstadoBadge.vue';
import { useAuth } from '../../context/useAuth';
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../../services/usuariosService';

const POR_PAGINA = 10;
const formVacio = {
  rol: 'Cliente',
  nombre: '',
  apellido: '',
  correo_electronico: '',
  contrasena: '',
  estado: 'Activo'
};

const { sesion } = useAuth();
const usuarios = ref([]);
const busqueda = ref('');
const filtroRol = ref('todos');
const pagina = ref(1);
const form = ref(null);
const error = ref('');
const mensaje = ref('');

const usuarioAEliminar = ref(null);
const eliminando = ref(false);
const errorEliminar = ref('');

const normalizarRol = (rol) => {
  if (!rol) return 'Cliente';
  const r = String(rol).trim().toLowerCase();
  if (r === 'administrador' || r === 'admin') return 'Administrador';
  if (r === 'tecnico' || r === 'técnico') return 'Tecnico';
  return 'Cliente';
};

onMounted(async () => {
  const lista = await listarUsuarios();
  usuarios.value = lista;
});

const filtrados = computed(() => {
  return usuarios.value.filter((u) => {
    const texto = `${u.nombre} ${u.apellido} ${u.correo_electronico}`.toLowerCase();
    const coincideRol = filtroRol.value === 'todos' || normalizarRol(u.rol) === filtroRol.value;
    return texto.includes(busqueda.value.toLowerCase()) && coincideRol;
  });
});

const totalPaginas = computed(() => {
  return Math.max(1, Math.ceil(filtrados.value.length / POR_PAGINA));
});

const paginaActual = computed(() => {
  return Math.min(pagina.value, totalPaginas.value);
});

const visibles = computed(() => {
  const inicio = (paginaActual.value - 1) * POR_PAGINA;
  return filtrados.value.slice(inicio, inicio + POR_PAGINA);
});

const abrirNuevo = () => {
  form.value = { ...formVacio };
  error.value = '';
};

const abrirEditar = (u) => {
  form.value = { ...u, rol: normalizarRol(u.rol), contrasena: '' };
  error.value = '';
};

const cerrar = () => {
  form.value = null;
  error.value = '';
};

const solicitarEliminar = (u) => {
  const correoSesion = sesion.value?.correo_electronico;
  const nombreSesion = sesion.value?.nombre;
  const esMismoUsuario =
    (correoSesion && u.correo_electronico?.toLowerCase() === correoSesion.toLowerCase()) ||
    (nombreSesion && `${u.nombre} ${u.apellido}`.trim().toLowerCase() === nombreSesion.trim().toLowerCase());

  if (esMismoUsuario) {
    errorEliminar.value = 'No puedes eliminar la cuenta con la que has iniciado sesión actualmente.';
    usuarioAEliminar.value = u;
    return;
  }

  errorEliminar.value = '';
  usuarioAEliminar.value = u;
};

const confirmarEliminar = async () => {
  if (!usuarioAEliminar.value) return;
  eliminando.value = true;
  errorEliminar.value = '';

  try {
    await eliminarUsuario(usuarioAEliminar.value.id_usuario);
    usuarios.value = usuarios.value.filter((u) => u.id_usuario !== usuarioAEliminar.value.id_usuario);
    mensaje.value = `Usuario "${usuarioAEliminar.value.nombre} ${usuarioAEliminar.value.apellido}" eliminado correctamente`;
    if (form.value && form.value.id_usuario === usuarioAEliminar.value.id_usuario) {
      cerrar();
    }
    usuarioAEliminar.value = null;
  } catch (err) {
    errorEliminar.value = err.message || 'Error al eliminar el usuario';
  } finally {
    eliminando.value = false;
  }
};

const guardar = async () => {
  const esNuevo = !form.value.id_usuario;

  if (!form.value.nombre.trim() || !form.value.apellido.trim() || !form.value.correo_electronico.trim()) {
    error.value = 'Nombre, apellido y correo son obligatorios';
    return;
  }
  if (esNuevo && !form.value.contrasena.trim()) {
    error.value = 'La contraseña es obligatoria para un usuario nuevo';
    return;
  }

  try {
    const rolDefinido = normalizarRol(form.value.rol);
    if (esNuevo) {
      const nuevo = await crearUsuario({
        ...form.value,
        rol: rolDefinido
      });
      usuarios.value.push(nuevo);
      mensaje.value = 'Usuario creado correctamente';
    } else {
      const payload = {
        nombre: form.value.nombre,
        apellido: form.value.apellido,
        correo_electronico: form.value.correo_electronico,
        rol: rolDefinido,
        estado: form.value.estado
      };
      if (form.value.contrasena && form.value.contrasena.trim()) {
        payload.contrasena = form.value.contrasena.trim();
      }
      const actualizado = await actualizarUsuario(form.value.id_usuario, payload);
      usuarios.value = usuarios.value.map((u) => (u.id_usuario === form.value.id_usuario ? actualizado : u));
      mensaje.value = 'Usuario actualizado correctamente';
    }
    cerrar();
  } catch (err) {
    error.value = err.message || 'Error al guardar el usuario';
  }
};

const columnas = [
  { titulo: 'ID', campo: 'id_usuario' },
  { titulo: 'Nombre / correo', campo: 'nombre' },
  { titulo: 'Rol', campo: 'rol' },
  { titulo: 'Estado', campo: 'estado' },
  { titulo: 'Acciones', campo: 'acciones' }
];
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(7, 30, 51, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
}

.campo-input {
  display: block;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 12px;
  border-radius: 8px;
  border: 1.5px solid #cbd5e1;
  font-size: 0.95rem;
  box-sizing: border-box;
  outline: none;
}

.campo-input:focus {
  border-color: var(--color-primario, #00bba6);
}
</style>
