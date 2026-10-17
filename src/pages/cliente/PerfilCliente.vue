<template>
  <Layout rol="cliente" item-activo="perfil-equipos" :nombre-usuario="nombreMostrar">
    <div v-if="cargando" style="padding: 40px; text-align: center; color: #556980;">
      Cargando perfil y equipos...
    </div>

    <div v-else class="perfil-contenedor">
      <header class="perfil-header">
        <h1>Mi Perfil y Equipos Registrados</h1>
        <p>Consulta y administra tus datos personales y el inventario de equipos asignados a tu cuenta.</p>
      </header>

      <div class="perfil-grid">
        <!-- Tarjeta de Datos Personales -->
        <section class="perfil-card">
          <div class="perfil-user-header">
            <div class="perfil-avatar">
              {{ perfil?.nombre?.charAt(0) || 'U' }}{{ perfil?.apellido?.charAt(0) || '' }}
            </div>
            <div class="perfil-user-info">
              <h2>{{ perfil?.nombre }} {{ perfil?.apellido }}</h2>
              <span class="perfil-badge-rol">{{ perfil?.rol || 'Cliente' }}</span>
            </div>
          </div>

          <div class="perfil-info-list">
            <div class="perfil-info-item">
              <label>Correo Electrónico</label>
              <span>{{ perfil?.correo_electronico || 'No especificado' }}</span>
            </div>
            <div class="perfil-info-item">
              <label>Teléfono</label>
              <span>{{ perfil?.telefono || 'No especificado' }}</span>
            </div>
            <div class="perfil-info-item">
              <label>Dirección</label>
              <span>{{ perfil?.direccion || 'No especificado' }}</span>
            </div>
            <div class="perfil-info-item">
              <label>Área / Departamento</label>
              <span>{{ perfil?.area_departamento || 'No especificado' }}</span>
            </div>
            <div class="perfil-info-item">
              <label>Miembro desde</label>
              <span>{{ perfil?.fecha_registro || 'No especificado' }}</span>
            </div>
          </div>

          <footer class="perfil-card-footer">
            <Boton variante="secundario" @click="abrirModalPerfil">
              Editar Perfil
            </Boton>
          </footer>
        </section>

        <!-- Tarjeta de Mis Equipos Registrados -->
        <section class="perfil-card">
          <div class="perfil-equipos-header">
            <div>
              <h2>Mis Equipos Registrados</h2>
              <span style="font-size: 12px; color: #556980;">
                {{ equipos.length }} {{ equipos.length === 1 ? 'equipo asociado' : 'equipos asociados' }}
              </span>
            </div>
            <Boton
              variante="primario"
              @click="abrirModalEquipo"
              style="padding: 7px 14px; font-size: 13px;"
            >
              + Añadir Equipo
            </Boton>
          </div>

          <div v-if="equipos.length > 0" class="perfil-equipos-lista">
            <div v-for="equipo in equipos" :key="equipo.id_equipo" class="equipo-item">
              <div>
                <p class="equipo-info-titulo">
                  {{ equipo.tipo }} - {{ equipo.marca }} {{ equipo.modelo }}
                </p>
                <p class="equipo-info-detalle">
                  S/N: {{ equipo.serial }}
                  {{ equipo.sistema_operativo ? ` • OS: ${equipo.sistema_operativo}` : '' }}
                  {{ equipo.area_departamento ? ` • Ubicación: ${equipo.area_departamento}` : '' }}
                </p>
              </div>

              <div class="equipo-item-acciones">
                <span
                  class="badge-estado-equipo"
                  :class="{
                    'badge-operativo': equipo.estado_equipo === 'Operativo',
                    'badge-reparacion': equipo.estado_equipo === 'En_Reparacion',
                    'badge-baja': equipo.estado_equipo !== 'Operativo' && equipo.estado_equipo !== 'En_Reparacion',
                  }"
                >
                  {{ (equipo.estado_equipo || 'Operativo').replace('_', ' ') }}
                </span>
                <button
                  type="button"
                  class="btn-editar-equipo"
                  @click="abrirModalEditarEquipo(equipo)"
                  title="Editar información de este equipo"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>

          <p v-else style="color: #556980; font-size: 14px; text-align: center; padding: 30px 0;">
            No tienes equipos registrados actualmente. Usa el botón superior para agregar tu primer equipo.
          </p>
        </section>
      </div>

      <!-- Modal: Editar Perfil -->
      <div v-if="modalPerfilAbierto" class="perfil-modal-overlay" @click.self="!guardandoPerfil && (modalPerfilAbierto = false)">
        <div class="perfil-modal-card">
          <div class="perfil-modal-header">
            <h3>Editar Información de Perfil</h3>
            <button
              type="button"
              @click="modalPerfilAbierto = false"
              :disabled="guardandoPerfil"
              style="background: none; border: none; font-size: 20px; cursor: pointer; color: #556980;"
            >
              ×
            </button>
          </div>

          <form @submit.prevent="manejarGuardarPerfil">
            <div class="perfil-modal-body">
              <div v-if="mensajePerfil" class="perfil-alerta" :class="mensajePerfil.tipo === 'exito' ? 'perfil-alerta-exito' : 'perfil-alerta-error'">
                {{ mensajePerfil.texto }}
              </div>

              <div class="perfil-form-group">
                <label for="perfil-correo">Correo Electrónico (No modificable)</label>
                <input
                  id="perfil-correo"
                  type="email"
                  class="perfil-input"
                  :value="perfil?.correo_electronico || ''"
                  disabled
                />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="perfil-form-group">
                  <label for="perfil-nombre">Nombre *</label>
                  <input
                    id="perfil-nombre"
                    type="text"
                    class="perfil-input"
                    v-model="formPerfil.nombre"
                    required
                    maxlength="50"
                    :disabled="guardandoPerfil"
                  />
                </div>
                <div class="perfil-form-group">
                  <label for="perfil-apellido">Apellido *</label>
                  <input
                    id="perfil-apellido"
                    type="text"
                    class="perfil-input"
                    v-model="formPerfil.apellido"
                    required
                    maxlength="50"
                    :disabled="guardandoPerfil"
                  />
                </div>
              </div>

              <div class="perfil-form-group">
                <label for="perfil-telefono">Teléfono de Contacto</label>
                <input
                  id="perfil-telefono"
                  type="text"
                  class="perfil-input"
                  v-model="formPerfil.telefono"
                  placeholder="Ej. +57 300 1234567"
                  maxlength="20"
                  :disabled="guardandoPerfil"
                />
              </div>

              <div class="perfil-form-group">
                <label for="perfil-direccion">Dirección</label>
                <input
                  id="perfil-direccion"
                  type="text"
                  class="perfil-input"
                  v-model="formPerfil.direccion"
                  placeholder="Ej. Cra 45 # 12-34 Oficina 301"
                  maxlength="150"
                  :disabled="guardandoPerfil"
                />
              </div>

              <div class="perfil-form-group">
                <label for="perfil-area">Área / Departamento</label>
                <input
                  id="perfil-area"
                  type="text"
                  class="perfil-input"
                  v-model="formPerfil.area_departamento"
                  placeholder="Ej. Finanzas, Contabilidad, Operaciones"
                  maxlength="80"
                  :disabled="guardandoPerfil"
                />
              </div>
            </div>

            <div class="perfil-modal-footer">
              <Boton
                variante="secundario"
                type="button"
                @click="modalPerfilAbierto = false"
                :deshabilitado="guardandoPerfil"
              >
                Cancelar
              </Boton>
              <Boton
                variante="primario"
                type="submit"
                :deshabilitado="guardandoPerfil"
              >
                {{ guardandoPerfil ? 'Guardando...' : 'Guardar Cambios' }}
              </Boton>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal: Añadir Equipo -->
      <div v-if="modalEquipoAbierto" class="perfil-modal-overlay" @click.self="!guardandoEquipo && (modalEquipoAbierto = false)">
        <div class="perfil-modal-card">
          <div class="perfil-modal-header">
            <h3>Registrar Nuevo Equipo</h3>
            <button
              type="button"
              @click="modalEquipoAbierto = false"
              :disabled="guardandoEquipo"
              style="background: none; border: none; font-size: 20px; cursor: pointer; color: #556980;"
            >
              ×
            </button>
          </div>

          <form @submit.prevent="manejarGuardarEquipo">
            <div class="perfil-modal-body">
              <div v-if="mensajeEquipo" class="perfil-alerta" :class="mensajeEquipo.tipo === 'exito' ? 'perfil-alerta-exito' : 'perfil-alerta-error'">
                {{ mensajeEquipo.texto }}
              </div>

              <div class="perfil-form-group">
                <label for="equipo-tipo">Tipo de Dispositivo *</label>
                <select id="equipo-tipo" class="perfil-input" v-model="formEquipo.tipo" :disabled="guardandoEquipo">
                  <option value="Computador">Computador</option>
                  <option value="Impresora">Impresora</option>
                  <option value="Servidor">Servidor</option>
                  <option value="Red">Equipo de Red</option>
                  <option value="Otro">Otro Dispositivo</option>
                </select>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="perfil-form-group">
                  <label for="equipo-marca">Marca *</label>
                  <input
                    id="equipo-marca"
                    type="text"
                    class="perfil-input"
                    placeholder="Ej. Dell, HP, Lenovo"
                    v-model="formEquipo.marca"
                    required
                    maxlength="50"
                    :disabled="guardandoEquipo"
                  />
                </div>
                <div class="perfil-form-group">
                  <label for="equipo-modelo">Modelo *</label>
                  <input
                    id="equipo-modelo"
                    type="text"
                    class="perfil-input"
                    placeholder="Ej. Latitude 5420"
                    v-model="formEquipo.modelo"
                    required
                    maxlength="50"
                    :disabled="guardandoEquipo"
                  />
                </div>
              </div>

              <div class="perfil-form-group">
                <label for="equipo-serial">Número de Serial (S/N) *</label>
                <input
                  id="equipo-serial"
                  type="text"
                  class="perfil-input"
                  placeholder="Ej. ABC123XYZ"
                  v-model="formEquipo.serial"
                  required
                  maxlength="50"
                  :disabled="guardandoEquipo"
                />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="perfil-form-group">
                  <label for="equipo-so">Sistema Operativo</label>
                  <input
                    id="equipo-so"
                    type="text"
                    class="perfil-input"
                    placeholder="Ej. Windows 11 Pro"
                    v-model="formEquipo.sistema_operativo"
                    maxlength="50"
                    :disabled="guardandoEquipo"
                  />
                </div>
                <div class="perfil-form-group">
                  <label for="equipo-area">Área o Ubicación</label>
                  <input
                    id="equipo-area"
                    type="text"
                    class="perfil-input"
                    v-model="formEquipo.area_departamento"
                    maxlength="80"
                    :disabled="guardandoEquipo"
                  />
                </div>
              </div>
            </div>

            <div class="perfil-modal-footer">
              <Boton
                variante="secundario"
                type="button"
                @click="modalEquipoAbierto = false"
                :deshabilitado="guardandoEquipo"
              >
                Cancelar
              </Boton>
              <Boton
                variante="primario"
                type="submit"
                :deshabilitado="guardandoEquipo"
              >
                {{ guardandoEquipo ? 'Guardando...' : 'Registrar Equipo' }}
              </Boton>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal: Editar Equipo -->
      <div v-if="modalEditarEquipoAbierto" class="perfil-modal-overlay" @click.self="!guardandoEditarEquipo && (modalEditarEquipoAbierto = false)">
        <div class="perfil-modal-card">
          <div class="perfil-modal-header">
            <h3>Editar Equipo Registrado</h3>
            <button
              type="button"
              @click="modalEditarEquipoAbierto = false"
              :disabled="guardandoEditarEquipo"
              style="background: none; border: none; font-size: 20px; cursor: pointer; color: #556980;"
            >
              ×
            </button>
          </div>

          <form @submit.prevent="manejarGuardarEditarEquipo">
            <div class="perfil-modal-body">
              <div v-if="mensajeEditarEquipo" class="perfil-alerta" :class="mensajeEditarEquipo.tipo === 'exito' ? 'perfil-alerta-exito' : 'perfil-alerta-error'">
                {{ mensajeEditarEquipo.texto }}
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="perfil-form-group">
                  <label for="editar-equipo-tipo">Tipo de Dispositivo *</label>
                  <select id="editar-equipo-tipo" class="perfil-input" v-model="formEditarEquipo.tipo" :disabled="guardandoEditarEquipo">
                    <option value="Computador">Computador</option>
                    <option value="Impresora">Impresora</option>
                    <option value="Servidor">Servidor</option>
                    <option value="Red">Equipo de Red</option>
                    <option value="Otro">Otro Dispositivo</option>
                  </select>
                </div>
                <div class="perfil-form-group">
                  <label for="editar-equipo-estado">Estado del Equipo *</label>
                  <select id="editar-equipo-estado" class="perfil-input" v-model="formEditarEquipo.estado_equipo" :disabled="guardandoEditarEquipo">
                    <option value="Operativo">Operativo</option>
                    <option value="En_Reparacion">En Reparación</option>
                    <option value="Fuera_de_Servicio">Fuera de Servicio</option>
                  </select>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="perfil-form-group">
                  <label for="editar-equipo-marca">Marca *</label>
                  <input
                    id="editar-equipo-marca"
                    type="text"
                    class="perfil-input"
                    v-model="formEditarEquipo.marca"
                    required
                    maxlength="50"
                    :disabled="guardandoEditarEquipo"
                  />
                </div>
                <div class="perfil-form-group">
                  <label for="editar-equipo-modelo">Modelo *</label>
                  <input
                    id="editar-equipo-modelo"
                    type="text"
                    class="perfil-input"
                    v-model="formEditarEquipo.modelo"
                    required
                    maxlength="50"
                    :disabled="guardandoEditarEquipo"
                  />
                </div>
              </div>

              <div class="perfil-form-group">
                <label for="editar-equipo-serial">Número de Serial (S/N) *</label>
                <input
                  id="editar-equipo-serial"
                  type="text"
                  class="perfil-input"
                  v-model="formEditarEquipo.serial"
                  required
                  maxlength="50"
                  :disabled="guardandoEditarEquipo"
                />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="perfil-form-group">
                  <label for="editar-equipo-so">Sistema Operativo</label>
                  <input
                    id="editar-equipo-so"
                    type="text"
                    class="perfil-input"
                    v-model="formEditarEquipo.sistema_operativo"
                    maxlength="50"
                    :disabled="guardandoEditarEquipo"
                  />
                </div>
                <div class="perfil-form-group">
                  <label for="editar-equipo-area">Área o Ubicación</label>
                  <input
                    id="editar-equipo-area"
                    type="text"
                    class="perfil-input"
                    v-model="formEditarEquipo.area_departamento"
                    maxlength="80"
                    :disabled="guardandoEditarEquipo"
                  />
                </div>
              </div>
            </div>

            <div class="perfil-modal-footer">
              <Boton
                variante="secundario"
                type="button"
                @click="modalEditarEquipoAbierto = false"
                :deshabilitado="guardandoEditarEquipo"
              >
                Cancelar
              </Boton>
              <Boton
                variante="primario"
                type="submit"
                :deshabilitado="guardandoEditarEquipo"
              >
                {{ guardandoEditarEquipo ? 'Guardando...' : 'Guardar Cambios' }}
              </Boton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Layout from '../../components/Layout.vue';
import Boton from '../../components/Boton.vue';
import { useAuth } from '../../context/useAuth';
import {
  obtenerPerfilCliente,
  actualizarPerfilCliente,
  obtenerEquiposCliente,
  crearEquipoCliente,
  actualizarEquipoCliente,
} from '../../services/clienteService';
import './PerfilCliente.css';

const { sesion, guardarSesion } = useAuth();
const perfil = ref(null);
const equipos = ref([]);
const cargando = ref(true);

const modalPerfilAbierto = ref(false);
const guardandoPerfil = ref(false);
const mensajePerfil = ref(null);
const formPerfil = ref({
  nombre: '',
  apellido: '',
  telefono: '',
  direccion: '',
  area_departamento: '',
});

const modalEquipoAbierto = ref(false);
const guardandoEquipo = ref(false);
const mensajeEquipo = ref(null);
const formEquipo = ref({
  tipo: 'Computador',
  marca: '',
  modelo: '',
  serial: '',
  sistema_operativo: '',
  area_departamento: 'General',
});

const modalEditarEquipoAbierto = ref(false);
const equipoAEditar = ref(null);
const guardandoEditarEquipo = ref(false);
const mensajeEditarEquipo = ref(null);
const formEditarEquipo = ref({
  tipo: 'Computador',
  marca: '',
  modelo: '',
  serial: '',
  sistema_operativo: '',
  area_departamento: 'General',
  estado_equipo: 'Operativo',
});

const cargarDatos = async () => {
  cargando.value = true;
  try {
    const [resultadoPerfil, resultadoEquipos] = await Promise.allSettled([
      obtenerPerfilCliente(),
      obtenerEquiposCliente(),
    ]);

    if (resultadoPerfil.status === 'fulfilled') {
      perfil.value = resultadoPerfil.value;
    }
    if (resultadoEquipos.status === 'fulfilled') {
      equipos.value = resultadoEquipos.value || [];
    }
  } catch (error) {
    console.error('Error al cargar perfil y equipos:', error);
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  cargarDatos();
});

const nombreMostrar = computed(() => {
  return perfil.value?.nombre
    ? `${perfil.value.nombre} ${perfil.value.apellido}`
    : sesion.value?.nombre;
});

const abrirModalPerfil = () => {
  mensajePerfil.value = null;
  formPerfil.value = {
    nombre: perfil.value?.nombre || '',
    apellido: perfil.value?.apellido || '',
    telefono: perfil.value?.telefono || '',
    direccion: perfil.value?.direccion || '',
    area_departamento: perfil.value?.area_departamento || '',
  };
  modalPerfilAbierto.value = true;
};

const manejarGuardarPerfil = async () => {
  if (!formPerfil.value.nombre.trim() || !formPerfil.value.apellido.trim()) {
    mensajePerfil.value = {
      tipo: 'error',
      texto: 'Nombre y apellido son obligatorios.',
    };
    return;
  }

  guardandoPerfil.value = true;
  mensajePerfil.value = null;
  try {
    const perfilActualizado = await actualizarPerfilCliente({
      nombre: formPerfil.value.nombre.trim(),
      apellido: formPerfil.value.apellido.trim(),
      telefono: formPerfil.value.telefono.trim(),
      direccion: formPerfil.value.direccion.trim(),
      area_departamento: formPerfil.value.area_departamento.trim(),
    });
    perfil.value = perfilActualizado;

    if (sesion.value) {
      guardarSesion({
        ...sesion.value,
        nombre: `${perfilActualizado.nombre} ${perfilActualizado.apellido}`,
      });
    }

    mensajePerfil.value = {
      tipo: 'exito',
      texto: '¡Tus datos de perfil han sido actualizados con éxito!',
    };

    setTimeout(() => {
      modalPerfilAbierto.value = false;
      mensajePerfil.value = null;
    }, 1200);
  } catch (error) {
    const detalle = error.response?.data?.detail || 'No se pudo actualizar el perfil.';
    mensajePerfil.value = {
      tipo: 'error',
      texto: typeof detalle === 'string' ? detalle : 'Error al guardar cambios.',
    };
  } finally {
    guardandoPerfil.value = false;
  }
};

const abrirModalEquipo = () => {
  mensajeEquipo.value = null;
  formEquipo.value = {
    tipo: 'Computador',
    marca: '',
    modelo: '',
    serial: '',
    sistema_operativo: '',
    area_departamento: perfil.value?.area_departamento || 'General',
  };
  modalEquipoAbierto.value = true;
};

const manejarGuardarEquipo = async () => {
  if (
    !formEquipo.value.marca.trim() ||
    !formEquipo.value.modelo.trim() ||
    !formEquipo.value.serial.trim()
  ) {
    mensajeEquipo.value = {
      tipo: 'error',
      texto: 'Marca, modelo y número de serial son obligatorios.',
    };
    return;
  }

  guardandoEquipo.value = true;
  mensajeEquipo.value = null;
  try {
    const nuevoEquipo = await crearEquipoCliente({
      tipo: formEquipo.value.tipo,
      marca: formEquipo.value.marca.trim(),
      modelo: formEquipo.value.modelo.trim(),
      serial: formEquipo.value.serial.trim(),
      sistema_operativo: formEquipo.value.sistema_operativo.trim() || null,
      area_departamento: formEquipo.value.area_departamento.trim() || 'General',
    });
    equipos.value = [nuevoEquipo, ...equipos.value];
    mensajeEquipo.value = {
      tipo: 'exito',
      texto: '¡Equipo registrado exitosamente!',
    };

    setTimeout(() => {
      modalEquipoAbierto.value = false;
      mensajeEquipo.value = null;
    }, 1200);
  } catch (error) {
    const detalle = error.response?.data?.detail || 'No se pudo registrar el equipo.';
    mensajeEquipo.value = {
      tipo: 'error',
      texto: typeof detalle === 'string' ? detalle : 'Error al registrar el equipo.',
    };
  } finally {
    guardandoEquipo.value = false;
  }
};

const abrirModalEditarEquipo = (equipo) => {
  equipoAEditar.value = equipo;
  mensajeEditarEquipo.value = null;
  formEditarEquipo.value = {
    tipo: equipo.tipo || 'Computador',
    marca: equipo.marca || '',
    modelo: equipo.modelo || '',
    serial: equipo.serial || '',
    sistema_operativo: equipo.sistema_operativo || '',
    area_departamento: equipo.area_departamento || 'General',
    estado_equipo: equipo.estado_equipo || 'Operativo',
  };
  modalEditarEquipoAbierto.value = true;
};

const manejarGuardarEditarEquipo = async () => {
  if (
    !formEditarEquipo.value.marca.trim() ||
    !formEditarEquipo.value.modelo.trim() ||
    !formEditarEquipo.value.serial.trim()
  ) {
    mensajeEditarEquipo.value = {
      tipo: 'error',
      texto: 'Marca, modelo y número de serial son obligatorios.',
    };
    return;
  }

  guardandoEditarEquipo.value = true;
  mensajeEditarEquipo.value = null;
  try {
    const equipoActualizado = await actualizarEquipoCliente(equipoAEditar.value.id_equipo, {
      tipo: formEditarEquipo.value.tipo,
      marca: formEditarEquipo.value.marca.trim(),
      modelo: formEditarEquipo.value.modelo.trim(),
      serial: formEditarEquipo.value.serial.trim(),
      sistema_operativo: formEditarEquipo.value.sistema_operativo.trim() || null,
      area_departamento: formEditarEquipo.value.area_departamento.trim() || 'General',
      estado_equipo: formEditarEquipo.value.estado_equipo,
    });

    equipos.value = equipos.value.map((eq) =>
      eq.id_equipo === equipoActualizado.id_equipo ? equipoActualizado : eq
    );

    mensajeEditarEquipo.value = {
      tipo: 'exito',
      texto: '¡Equipo actualizado correctamente!',
    };

    setTimeout(() => {
      modalEditarEquipoAbierto.value = false;
      mensajeEditarEquipo.value = null;
    }, 1200);
  } catch (error) {
    const detalle = error.response?.data?.detail || 'No se pudo actualizar el equipo.';
    mensajeEditarEquipo.value = {
      tipo: 'error',
      texto: typeof detalle === 'string' ? detalle : 'Error al actualizar el equipo.',
    };
  } finally {
    guardandoEditarEquipo.value = false;
  }
};
</script>
