<template>
  <Layout rol="administrador" item-activo="usuarios" :nombre-usuario="sesion?.nombre || 'Administrador'">
    <div class="usuarios-modulo">
      <!-- Encabezado de Página -->
      <header class="usuarios-topbar">
        <div>
          <h1 class="usuarios-titulo">Gestión de Usuarios</h1>
          <p class="usuarios-bajada">
            Control centralizado de identidades, asignación de roles y estados de cuenta en el sistema.
          </p>
        </div>
        <button
          id="btn-nuevo-usuario"
          type="button"
          class="btn-primario"
          @click="abrirNuevo"
        >
          <svg class="icono-btn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Nuevo Usuario</span>
        </button>
      </header>

      <!-- Métricas Resumen (KPI) -->
      <section class="kpi-contenedor" aria-label="Resumen de usuarios">
        <div class="kpi-card">
          <div class="kpi-cuerpo">
            <span class="kpi-label">Total Registrados</span>
            <span class="kpi-numero">{{ metricas.total }}</span>
          </div>
          <div class="kpi-icono-wrapper total">
            <svg class="kpi-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-cuerpo">
            <span class="kpi-label">Clientes</span>
            <span class="kpi-numero">{{ metricas.clientes }}</span>
          </div>
          <div class="kpi-icono-wrapper clientes">
            <svg class="kpi-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-cuerpo">
            <span class="kpi-label">Personal Técnico</span>
            <span class="kpi-numero">{{ metricas.tecnicos }}</span>
          </div>
          <div class="kpi-icono-wrapper tecnicos">
            <svg class="kpi-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-cuerpo">
            <span class="kpi-label">Administradores</span>
            <span class="kpi-numero">{{ metricas.admins }}</span>
          </div>
          <div class="kpi-icono-wrapper admins">
            <svg class="kpi-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-cuerpo">
            <span class="kpi-label">Cuentas Activas</span>
            <span class="kpi-numero">{{ metricas.activos }}</span>
          </div>
          <div class="kpi-icono-wrapper activos">
            <svg class="kpi-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
        </div>
      </section>

      <!-- Barra de Filtros y Búsqueda -->
      <section class="filtros-seccion">
        <div class="busqueda-wrapper">
          <svg class="busqueda-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            id="input-buscar-usuario"
            v-model="busqueda"
            type="search"
            placeholder="Buscar por ID, nombre o correo corporativo..."
            class="busqueda-input"
            @input="pagina = 1"
          />
          <button
            v-if="busqueda"
            type="button"
            class="busqueda-clear"
            title="Limpiar búsqueda"
            @click="busqueda = ''; pagina = 1;"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="selectores-wrapper">
          <div class="select-personalizado">
            <select
              id="filtro-rol-select"
              v-model="filtroRol"
              class="filtro-control"
              @change="pagina = 1"
            >
              <option value="todos">Rol: Todos</option>
              <option value="Cliente">Rol: Clientes</option>
              <option value="Tecnico">Rol: Técnicos</option>
              <option value="Administrador">Rol: Administradores</option>
            </select>
          </div>

          <div class="select-personalizado">
            <select
              id="filtro-estado-select"
              v-model="filtroEstado"
              class="filtro-control"
              @change="pagina = 1"
            >
              <option value="todos">Estado: Todos</option>
              <option value="Activo">Estado: Activos</option>
              <option value="Inactivo">Estado: Inactivos</option>
            </select>
          </div>

          <button
            v-if="hayFiltrosActivos"
            type="button"
            class="btn-limpiar"
            @click="limpiarFiltros"
          >
            Restablecer
          </button>
        </div>
      </section>

      <!-- Notificación de Éxito / Feedback -->
      <transition name="fade">
        <div v-if="mensaje" class="banner-feedback exito" role="status">
          <div class="feedback-contenido">
            <svg class="feedback-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{{ mensaje }}</span>
          </div>
          <button type="button" class="btn-cerrar-feedback" @click="mensaje = ''" aria-label="Cerrar notificación" style="display: flex; align-items: center; justify-content: center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </transition>

      <!-- Tabla de Usuarios -->
      <section class="tabla-panel">
        <div v-if="cargando" class="estado-cargando">
          <div class="spinner"></div>
          <p>Cargando directorio de usuarios...</p>
        </div>

        <Tabla
          v-else
          :columnas="columnas"
          :filas="visibles"
          mensaje-vacio="No se encontraron registros que coincidan con los criterios seleccionados."
        >
          <!-- Columna ID -->
          <template #col-id_usuario="{ fila }">
            <span class="id-etiqueta">
              #{{ String(fila.id_usuario).padStart(2, '0') }}
            </span>
          </template>

          <!-- Columna Nombre y Correo -->
          <template #col-nombre="{ fila }">
            <div class="usuario-fila-info">
              <div class="usuario-avatar" :style="{ backgroundColor: obtenerColorAvatar(fila.nombre) }">
                {{ obtenerIniciales(fila.nombre, fila.apellido) }}
              </div>
              <div class="usuario-detalles">
                <div class="usuario-nombre">
                  <span>{{ fila.nombre }} {{ fila.apellido }}</span>
                  <span
                    v-if="esUsuarioActual(fila)"
                    class="badge-sesion-actual"
                    title="Esta es tu sesión activa"
                  >
                    Tu cuenta
                  </span>
                </div>
                <div class="usuario-correo">{{ fila.correo_electronico }}</div>
              </div>
            </div>
          </template>

          <!-- Columna Rol -->
          <template #col-rol="{ fila }">
            <span :class="['rol-chip', `rol-${normalizarRol(fila.rol).toLowerCase()}`]">
              <span class="rol-punto"></span>
              <span>{{ formatearNombreRol(fila.rol) }}</span>
            </span>
          </template>

          <!-- Columna Estado -->
          <template #col-estado="{ fila }">
            <EstadoBadge :estado="fila.estado || 'Activo'" />
          </template>

          <!-- Columna Acciones -->
          <template #col-acciones="{ fila }">
            <div class="acciones-fila">
              <button
                :id="`btn-editar-usuario-${fila.id_usuario}`"
                type="button"
                class="btn-tabla-accion editar"
                title="Editar usuario"
                @click="abrirEditar(fila)"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
                <span>Editar</span>
              </button>

              <button
                :id="`btn-eliminar-usuario-${fila.id_usuario}`"
                type="button"
                class="btn-tabla-accion eliminar"
                :class="{ deshabilitado: esUsuarioActual(fila) }"
                :title="esUsuarioActual(fila) ? 'No es posible eliminar la sesión activa actual' : 'Eliminar usuario'"
                @click="solicitarEliminar(fila)"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                <span>Eliminar</span>
              </button>
            </div>
          </template>
        </Tabla>
      </section>

      <!-- Paginación -->
      <footer v-if="!cargando && filtrados.length > 0" class="paginacion-barra">
        <div class="paginacion-resumen">
          Mostrando <strong>{{ rangoInicio }}</strong> a <strong>{{ rangoFin }}</strong> de <strong>{{ filtrados.length }}</strong> usuarios
        </div>

        <div class="paginacion-acciones">
          <button
            type="button"
            :disabled="paginaActual === 1"
            class="btn-pag"
            @click="pagina = Math.max(1, paginaActual - 1)"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span>Anterior</span>
          </button>

          <span class="pag-contador">
            Página {{ paginaActual }} de {{ totalPaginas }}
          </span>

          <button
            type="button"
            :disabled="paginaActual === totalPaginas"
            class="btn-pag"
            @click="pagina = Math.min(totalPaginas, paginaActual + 1)"
          >
            <span>Siguiente</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </footer>

      <!-- Modal de Formulario (Crear / Editar) -->
      <transition name="modal">
        <div v-if="form" class="modal-backdrop" @click.self="cerrar">
          <div class="modal-dialog">
            <div class="modal-cabecera">
              <div class="modal-cabecera-texto">
                <h2 class="modal-titulo">
                  {{ form.id_usuario ? `Editar Usuario #${form.id_usuario}` : "Crear Nuevo Usuario" }}
                </h2>
                <p class="modal-subtitulo">
                  {{ form.id_usuario ? "Actualiza la información de perfil y credenciales de acceso." : "Ingresa los datos para dar de alta una nueva cuenta en la plataforma." }}
                </p>
              </div>
              <button
                type="button"
                class="btn-cerrar-modal"
                aria-label="Cerrar ventana modal"
                @click="cerrar"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form @submit.prevent="guardar" class="modal-formulario">
              <div class="campo-bloque">
                <label class="campo-etiqueta" for="form-rol">Rol en la organización</label>
                <select id="form-rol" v-model="form.rol" class="campo-control">
                  <option value="Cliente">Cliente (Creación y seguimiento de requerimientos)</option>
                  <option value="Tecnico">Técnico de Soporte (Gestión operativa y solución)</option>
                  <option value="Administrador">Administrador (Control global y configuración)</option>
                </select>
              </div>

              <div class="campo-grid-doble">
                <div class="campo-bloque">
                  <label class="campo-etiqueta" for="form-nombre">Nombre <span class="req">*</span></label>
                  <input
                    id="form-nombre"
                    v-model="form.nombre"
                    type="text"
                    required
                    placeholder="Ej. Laura"
                    class="campo-control"
                  />
                </div>
                <div class="campo-bloque">
                  <label class="campo-etiqueta" for="form-apellido">Apellido <span class="req">*</span></label>
                  <input
                    id="form-apellido"
                    v-model="form.apellido"
                    type="text"
                    required
                    placeholder="Ej. Ramírez"
                    class="campo-control"
                  />
                </div>
              </div>

              <div class="campo-bloque">
                <label class="campo-etiqueta" for="form-correo">Correo electrónico corporativo <span class="req">*</span></label>
                <input
                  id="form-correo"
                  v-model="form.correo_electronico"
                  type="email"
                  required
                  placeholder="usuario@sistemasar.net"
                  class="campo-control"
                />
              </div>

              <div class="campo-bloque">
                <div class="campo-etiqueta-fila">
                  <label class="campo-etiqueta" for="form-password" style="margin-bottom: 0;">
                    Contraseña <span v-if="!form.id_usuario" class="req">*</span>
                  </label>
                  <span v-if="form.id_usuario" class="campo-ayuda">
                    Dejar en blanco para mantener la clave actual
                  </span>
                </div>
                <div class="input-password-wrapper">
                  <input
                    id="form-password"
                    v-model="form.contrasena"
                    :type="mostrarPassword ? 'text' : 'password'"
                    :placeholder="form.id_usuario ? '••••••••' : 'Mínimo 6 caracteres'"
                    class="campo-control password-input"
                  />
                  <button
                    type="button"
                    class="btn-toggle-pass"
                    :title="mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'"
                    @click="mostrarPassword = !mostrarPassword"
                  >
                    <svg v-if="!mostrarPassword" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="campo-bloque">
                <label class="campo-etiqueta">Estado de la cuenta</label>
                <div class="estado-toggle-grupo">
                  <label class="estado-toggle-opcion" :class="{ activa: form.estado === 'Activo' }">
                    <input
                      v-model="form.estado"
                      type="radio"
                      value="Activo"
                    />
                    <span class="punto-estado verde"></span>
                    <span>Activo</span>
                  </label>
                  <label class="estado-toggle-opcion" :class="{ activa: form.estado === 'Inactivo' }">
                    <input
                      v-model="form.estado"
                      type="radio"
                      value="Inactivo"
                    />
                    <span class="punto-estado gris"></span>
                    <span>Inactivo</span>
                  </label>
                </div>
              </div>

              <div v-if="error" class="alerta-error">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{{ error }}</span>
              </div>

              <div class="modal-footer">
                <button
                  type="button"
                  class="btn-secundario"
                  :disabled="guardando"
                  @click="cerrar"
                >
                  Cancelar
                </button>
                <button
                  id="btn-guardar-usuario"
                  type="submit"
                  class="btn-primario"
                  :disabled="guardando"
                >
                  <span v-if="guardando" class="spinner-pequeno"></span>
                  <span>{{ guardando ? "Guardando..." : (form.id_usuario ? "Guardar Cambios" : "Crear Usuario") }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>

      <!-- Modal de Confirmación de Eliminación -->
      <transition name="modal">
        <div v-if="usuarioAEliminar" class="modal-backdrop" @click.self="cerrarModalEliminar">
          <div class="modal-dialog modal-dialog-peligro">
            <div class="modal-cabecera">
              <div class="cabecera-icono-destructivo">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div class="modal-cabecera-texto">
                <h3 class="modal-titulo" style="color: #991b1b;">Confirmar Baja de Usuario</h3>
                <p class="modal-subtitulo">
                  Esta operación revocará el acceso de forma definitiva.
                </p>
              </div>
              <button
                type="button"
                class="btn-cerrar-modal"
                aria-label="Cerrar modal"
                @click="cerrarModalEliminar"
                style="display: flex; align-items: center; justify-content: center;"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- Bloqueo si intenta autoeliminarse -->
            <div v-if="esMismoUsuarioActivo" class="alerta-bloqueo-sesion">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#b45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
              </svg>
              <div>
                <strong>Operación restringida por seguridad</strong>
                <p>
                  No es posible dar de baja la cuenta activa actual (<strong>{{ sesion?.correo_electronico || sesion?.nombre }}</strong>). Para eliminarla, inicia sesión con otra cuenta de administrador.
                </p>
              </div>
            </div>

            <template v-else>
              <div class="resumen-cuenta-baja">
                <div class="resumen-cuenta-linea principal">
                  {{ usuarioAEliminar.nombre }} {{ usuarioAEliminar.apellido }}
                </div>
                <div class="resumen-cuenta-linea correo">
                  {{ usuarioAEliminar.correo_electronico }}
                </div>
                <div class="resumen-cuenta-metadatos">
                  <span>ID: <strong>#{{ usuarioAEliminar.id_usuario }}</strong></span>
                  <span>•</span>
                  <span>Rol: <strong>{{ normalizarRol(usuarioAEliminar.rol) }}</strong></span>
                  <span>•</span>
                  <span>Estado: <strong>{{ usuarioAEliminar.estado || 'Activo' }}</strong></span>
                </div>
              </div>

              <div v-if="errorEliminar" class="alerta-error">
                <span>{{ errorEliminar }}</span>
              </div>
              <p v-else class="texto-advertencia-definitiva">
                ¿Confirmas que deseas eliminar esta cuenta? Los datos y accesos asociados serán desvinculados permanentemente.
              </p>
            </template>

            <div class="modal-footer">
              <button
                type="button"
                class="btn-secundario"
                @click="cerrarModalEliminar"
              >
                {{ esMismoUsuarioActivo ? "Cerrar" : "Cancelar" }}
              </button>
              <button
                v-if="!esMismoUsuarioActivo"
                id="btn-confirmar-eliminar"
                type="button"
                :disabled="eliminando"
                class="btn-destructivo"
                @click="confirmarEliminar"
              >
                <span v-if="eliminando" class="spinner-pequeno"></span>
                <span>{{ eliminando ? "Eliminando..." : "Eliminar Definitivamente" }}</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
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
const cargando = ref(true);
const busqueda = ref('');
const filtroRol = ref('todos');
const filtroEstado = ref('todos');
const pagina = ref(1);

const form = ref(null);
const mostrarPassword = ref(false);
const guardando = ref(false);
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

const formatearNombreRol = (rol) => {
  const norm = normalizarRol(rol);
  if (norm === 'Administrador') return 'Administrador';
  if (norm === 'Tecnico') return 'Técnico TI';
  return 'Cliente';
};

const obtenerIniciales = (nombre, apellido) => {
  const n = (nombre || '').trim()[0] || '';
  const a = (apellido || '').trim()[0] || '';
  return (n + a).toUpperCase() || 'U';
};

const obtenerColorAvatar = (nombre) => {
  const paleta = [
    '#0f766e', // Teal corporativo
    '#0369a1', // Sky profundo
    '#1d4ed8', // Azul cobalto
    '#6d28d9', // Indigo suave
    '#475569', // Slate sobrio
    '#059669'  // Emerald
  ];
  const charCode = (nombre || 'A').charCodeAt(0);
  return paleta[charCode % paleta.length];
};

const esUsuarioActual = (u) => {
  if (!u || !sesion.value) return false;
  const sesId = sesion.value.id_usuario;
  const sesEmail = sesion.value.correo_electronico;
  const sesNombre = sesion.value.nombre;

  if (sesId && u.id_usuario === sesId) return true;
  if (sesEmail && u.correo_electronico?.toLowerCase() === sesEmail.toLowerCase()) return true;
  if (sesNombre && `${u.nombre} ${u.apellido}`.trim().toLowerCase() === sesNombre.trim().toLowerCase()) return true;
  return false;
};

const esMismoUsuarioActivo = computed(() => {
  return esUsuarioActual(usuarioAEliminar.value);
});

const cargarUsuarios = async () => {
  cargando.value = true;
  try {
    const lista = await listarUsuarios();
    usuarios.value = Array.isArray(lista) ? lista : [];
  } catch (err) {
    console.error('Error al cargar la lista de usuarios:', err);
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  cargarUsuarios();
});

const metricas = computed(() => {
  const total = usuarios.value.length;
  const clientes = usuarios.value.filter((u) => normalizarRol(u.rol) === 'Cliente').length;
  const tecnicos = usuarios.value.filter((u) => normalizarRol(u.rol) === 'Tecnico').length;
  const admins = usuarios.value.filter((u) => normalizarRol(u.rol) === 'Administrador').length;
  const activos = usuarios.value.filter((u) => (u.estado || 'Activo').toLowerCase() === 'activo').length;
  return { total, clientes, tecnicos, admins, activos };
});

const hayFiltrosActivos = computed(() => {
  return busqueda.value.trim() !== '' || filtroRol.value !== 'todos' || filtroEstado.value !== 'todos';
});

const limpiarFiltros = () => {
  busqueda.value = '';
  filtroRol.value = 'todos';
  filtroEstado.value = 'todos';
  pagina.value = 1;
};

const filtrados = computed(() => {
  const query = busqueda.value.toLowerCase().trim();
  return usuarios.value.filter((u) => {
    const texto = `${u.id_usuario} ${u.nombre || ''} ${u.apellido || ''} ${u.correo_electronico || ''}`.toLowerCase();
    const coincideTexto = !query || texto.includes(query);
    const coincideRol = filtroRol.value === 'todos' || normalizarRol(u.rol) === filtroRol.value;
    const coincideEstado = filtroEstado.value === 'todos' || (u.estado || 'Activo').toLowerCase() === filtroEstado.value.toLowerCase();
    return coincideTexto && coincideRol && coincideEstado;
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

const rangoInicio = computed(() => {
  if (filtrados.value.length === 0) return 0;
  return (paginaActual.value - 1) * POR_PAGINA + 1;
});

const rangoFin = computed(() => {
  return Math.min(paginaActual.value * POR_PAGINA, filtrados.value.length);
});

const abrirNuevo = () => {
  form.value = { ...formVacio };
  mostrarPassword.value = false;
  error.value = '';
};

const abrirEditar = (u) => {
  form.value = {
    id_usuario: u.id_usuario,
    nombre: u.nombre || '',
    apellido: u.apellido || '',
    correo_electronico: u.correo_electronico || '',
    rol: normalizarRol(u.rol),
    estado: u.estado || 'Activo',
    contrasena: ''
  };
  mostrarPassword.value = false;
  error.value = '';
};

const cerrar = () => {
  form.value = null;
  error.value = '';
  guardando.value = false;
};

const solicitarEliminar = (u) => {
  errorEliminar.value = '';
  usuarioAEliminar.value = u;
};

const cerrarModalEliminar = () => {
  usuarioAEliminar.value = null;
  errorEliminar.value = '';
  eliminando.value = false;
};

const confirmarEliminar = async () => {
  if (!usuarioAEliminar.value || esMismoUsuarioActivo.value) return;
  eliminando.value = true;
  errorEliminar.value = '';

  try {
    const idParaEliminar = usuarioAEliminar.value.id_usuario;
    const nombreCompleto = `${usuarioAEliminar.value.nombre} ${usuarioAEliminar.value.apellido}`;
    await eliminarUsuario(idParaEliminar);

    usuarios.value = usuarios.value.filter((u) => u.id_usuario !== idParaEliminar);
    mensaje.value = `Usuario "${nombreCompleto}" eliminado exitosamente del directorio.`;
    setTimeout(() => {
      mensaje.value = '';
    }, 4000);

    if (form.value && form.value.id_usuario === idParaEliminar) {
      cerrar();
    }
    cerrarModalEliminar();
  } catch (err) {
    errorEliminar.value = err.message || 'Ocurrió un error al intentar eliminar el usuario';
  } finally {
    eliminando.value = false;
  }
};

const guardar = async () => {
  if (!form.value) return;
  const esNuevo = !form.value.id_usuario;

  const nombreLimpio = (form.value.nombre || '').trim();
  const apellidoLimpio = (form.value.apellido || '').trim();
  const correoLimpio = (form.value.correo_electronico || '').toLowerCase().trim();

  if (!nombreLimpio || !apellidoLimpio || !correoLimpio) {
    error.value = 'Nombre, apellido y correo electrónico son campos obligatorios.';
    return;
  }

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(correoLimpio)) {
    error.value = 'Ingresa una dirección de correo válida (ejemplo@empresa.com).';
    return;
  }

  if (esNuevo && (!form.value.contrasena || !form.value.contrasena.trim())) {
    error.value = 'Debes asignar una contraseña para la cuenta nueva.';
    return;
  }

  // Comprobar correo duplicado en la lista local
  const duplicado = usuarios.value.find(
    (u) =>
      u.correo_electronico?.toLowerCase() === correoLimpio &&
      u.id_usuario !== form.value.id_usuario
  );
  if (duplicado) {
    error.value = 'Ya existe un usuario registrado con este correo corporativo.';
    return;
  }

  guardando.value = true;
  error.value = '';

  try {
    const rolDefinido = normalizarRol(form.value.rol);

    if (esNuevo) {
      const nuevo = await crearUsuario({
        nombre: nombreLimpio,
        apellido: apellidoLimpio,
        correo_electronico: correoLimpio,
        contrasena: form.value.contrasena.trim(),
        rol: rolDefinido,
        estado: form.value.estado || 'Activo'
      });
      usuarios.value.push(nuevo);
      mensaje.value = `Usuario "${nuevo.nombre} ${nuevo.apellido}" registrado exitosamente.`;
    } else {
      const payload = {
        nombre: nombreLimpio,
        apellido: apellidoLimpio,
        correo_electronico: correoLimpio,
        rol: rolDefinido,
        estado: form.value.estado || 'Activo'
      };
      if (form.value.contrasena && form.value.contrasena.trim()) {
        payload.contrasena = form.value.contrasena.trim();
      }
      const actualizado = await actualizarUsuario(form.value.id_usuario, payload);
      usuarios.value = usuarios.value.map((u) => (u.id_usuario === form.value.id_usuario ? actualizado : u));
      mensaje.value = `Usuario "${actualizado.nombre} ${actualizado.apellido}" actualizado correctamente.`;
    }

    setTimeout(() => {
      mensaje.value = '';
    }, 4000);

    cerrar();
  } catch (err) {
    error.value = err.message || 'Error al guardar los datos del usuario.';
  } finally {
    guardando.value = false;
  }
};

const columnas = [
  { titulo: 'Identificador', campo: 'id_usuario', alineacion: 'left' },
  { titulo: 'Usuario y Contacto', campo: 'nombre', alineacion: 'left' },
  { titulo: 'Rol Organizacional', campo: 'rol', alineacion: 'left' },
  { titulo: 'Estado de Cuenta', campo: 'estado', alineacion: 'left' },
  { titulo: 'Gestión', campo: 'acciones', alineacion: 'right' }
];
</script>

<style scoped>
.usuarios-modulo {
  max-width: 1260px;
  margin: 0 auto;
  padding: 16px 20px 48px 20px;
  font-family: var(--fuente-principal, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
  color: var(--color-texto-principal, #072137);
}

/* 1. Header */
.usuarios-topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.usuarios-titulo {
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--color-texto-principal, #072137);
  letter-spacing: -0.025em;
  line-height: 1.25;
  margin: 0;
}

.usuarios-bajada {
  font-size: 0.9rem;
  color: #64748b;
  margin-top: 4px;
  line-height: 1.45;
}

/* Botón Primario Corporativo */
.btn-primario {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-primario, #00bba6);
  color: #ffffff;
  border: 1px solid transparent;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-primario:hover:not(:disabled) {
  background-color: var(--color-primario-hover, #009e8c);
}

.btn-primario:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.icono-btn {
  width: 16px;
  height: 16px;
}

/* 2. Tarjetas KPI / Stat Cards */
.kpi-contenedor {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}

.kpi-card {
  background-color: #ffffff;
  border: 1px solid var(--color-borde, #e2ebf1);
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 1px 3px rgba(7, 30, 51, 0.03);
}

.kpi-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(7, 30, 51, 0.05);
}

.kpi-cuerpo {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.kpi-numero {
  font-size: 1.625rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
  margin-top: 4px;
}

.kpi-icono-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-svg {
  width: 20px;
  height: 20px;
}

.kpi-icono-wrapper.total { background-color: #f1f5f9; color: #475569; }
.kpi-icono-wrapper.clientes { background-color: #f0fdf4; color: #16a34a; }
.kpi-icono-wrapper.tecnicos { background-color: #f0f9ff; color: #0284c7; }
.kpi-icono-wrapper.admins { background-color: #f5f3ff; color: #7c3aed; }
.kpi-icono-wrapper.activos { background-color: #e6f9f6; color: #008f7e; }

/* 3. Barra de Filtros y Búsqueda */
.filtros-seccion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  background-color: #ffffff;
  border: 1px solid var(--color-borde, #e2ebf1);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 20px;
  box-shadow: 0 1px 2px rgba(7, 30, 51, 0.02);
}

.busqueda-wrapper {
  position: relative;
  flex: 1 1 340px;
  display: flex;
  align-items: center;
}

.busqueda-icono {
  position: absolute;
  left: 12px;
  width: 16px;
  height: 16px;
  color: #94a3b8;
  pointer-events: none;
}

.busqueda-input {
  width: 100%;
  padding: 8px 34px 8px 36px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background-color: #f8fafc;
  outline: none;
  transition: all 0.15s ease;
}

.busqueda-input:focus {
  background-color: #ffffff;
  border-color: var(--color-primario, #00bba6);
  box-shadow: 0 0 0 3px rgba(0, 187, 166, 0.12);
}

.busqueda-clear {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.busqueda-clear:hover {
  color: #475569;
  background-color: #e2e8f0;
}

.selectores-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filtro-control {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #ffffff;
  font-size: 0.85rem;
  font-weight: 500;
  color: #334155;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.filtro-control:focus {
  border-color: var(--color-primario, #00bba6);
}

.btn-limpiar {
  padding: 8px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
  color: #64748b;
  font-size: 0.825rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-limpiar:hover {
  background-color: #f1f5f9;
  color: #334155;
}

/* 4. Notificaciones / Feedback Banner */
.banner-feedback {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 20px;
}

.banner-feedback.exito {
  background-color: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}

.feedback-contenido {
  display: flex;
  align-items: center;
  gap: 10px;
}

.feedback-icono {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.btn-cerrar-feedback {
  background: none;
  border: none;
  font-size: 1rem;
  color: currentColor;
  cursor: pointer;
  padding: 2px 6px;
  opacity: 0.7;
}

.btn-cerrar-feedback:hover {
  opacity: 1;
}

/* 5. Tabla */
.tabla-panel {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid var(--color-borde, #e2ebf1);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(7, 30, 51, 0.02);
}

.estado-cargando {
  padding: 60px 20px;
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.id-etiqueta {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.825rem;
  font-weight: 600;
  color: #475569;
  background-color: #f1f5f9;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid #e2e8f0;
}

.usuario-fila-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.usuario-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}

.usuario-detalles {
  line-height: 1.35;
}

.usuario-nombre {
  font-weight: 600;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-sesion-actual {
  font-size: 0.6875rem;
  font-weight: 600;
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 1px 6px;
  border-radius: 4px;
  letter-spacing: 0.02em;
}

.usuario-correo {
  font-size: 0.8125rem;
  color: #64748b;
}

/* Rol chips */
.rol-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 0.775rem;
  font-weight: 600;
  line-height: 1.3;
}

.rol-punto {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.rol-administrador {
  background-color: #f5f3ff;
  color: #6d28d9;
  border: 1px solid #ddd6fe;
}
.rol-administrador .rol-punto {
  background-color: #7c3aed;
}

.rol-tecnico {
  background-color: #f0f9ff;
  color: #0369a1;
  border: 1px solid #bae6fd;
}
.rol-tecnico .rol-punto {
  background-color: #0284c7;
}

.rol-cliente {
  background-color: #f8fafc;
  color: #334155;
  border: 1px solid #e2e8f0;
}
.rol-cliente .rol-punto {
  background-color: #64748b;
}

/* Botones de acción en tabla */
.acciones-fila {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.btn-tabla-accion {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  color: #334155;
  transition: all 0.15s ease;
}

.btn-tabla-accion.editar:hover {
  background-color: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

.btn-tabla-accion.eliminar {
  border-color: #fecaca;
  color: #b91c1c;
}

.btn-tabla-accion.eliminar:hover:not(.deshabilitado) {
  background-color: #fef2f2;
  border-color: #fca5a5;
  color: #991b1b;
}

.btn-tabla-accion.deshabilitado {
  opacity: 0.4;
  cursor: not-allowed;
  border-color: #e2e8f0;
  color: #94a3b8;
}

/* 6. Barra de Paginación */
.paginacion-barra {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
}

.paginacion-resumen {
  font-size: 0.85rem;
  color: #64748b;
}

.paginacion-acciones {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-pag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-pag:hover:not(:disabled) {
  background-color: #f8fafc;
  border-color: #94a3b8;
}

.btn-pag:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pag-contador {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
  padding: 0 4px;
}

/* 7. Modal General */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-dialog {
  background-color: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  width: 480px;
  max-width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
  padding: 24px 26px;
}

.modal-cabecera {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.modal-titulo {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.3;
}

.modal-subtitulo {
  font-size: 0.825rem;
  color: #64748b;
  margin: 4px 0 0 0;
}

.btn-cerrar-modal {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.btn-cerrar-modal:hover {
  color: #334155;
  background-color: #f1f5f9;
}

.modal-formulario {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.campo-bloque {
  display: flex;
  flex-direction: column;
}

.campo-grid-doble {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.campo-etiqueta {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.campo-etiqueta-fila {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.campo-ayuda {
  font-size: 0.75rem;
  color: #64748b;
}

.req {
  color: #dc2626;
}

.campo-control {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #0f172a;
  background-color: #ffffff;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.campo-control:focus {
  border-color: var(--color-primario, #00bba6);
  box-shadow: 0 0 0 3px rgba(0, 187, 166, 0.15);
}

.input-password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  padding-right: 38px;
}

.btn-toggle-pass {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.btn-toggle-pass:hover {
  color: #0f172a;
}

/* Toggle Estado */
.estado-toggle-grupo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.estado-toggle-opcion {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #475569;
  background-color: #f8fafc;
  cursor: pointer;
  transition: all 0.15s ease;
}

.estado-toggle-opcion input {
  display: none;
}

.estado-toggle-opcion.activa {
  border-color: var(--color-primario, #00bba6);
  background-color: var(--color-primario-suave, #e6f9f6);
  color: var(--color-primario-hover, #009e8c);
  font-weight: 600;
}

.punto-estado {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.punto-estado.verde {
  background-color: #10b981;
}

.punto-estado.gris {
  background-color: #94a3b8;
}

/* Alertas de error en modal */
.alerta-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 8px;
  font-size: 0.825rem;
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.btn-secundario {
  padding: 9px 16px;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  color: #334155;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-secundario:hover {
  background-color: #f8fafc;
  border-color: #94a3b8;
}

/* Modal Peligro / Eliminación */
.modal-dialog-peligro {
  border-top: 4px solid #dc2626;
}

.cabecera-icono-destructivo {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background-color: #fef2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alerta-bloqueo-sesion {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background-color: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.45;
  margin-bottom: 16px;
}

.alerta-bloqueo-sesion p {
  margin: 4px 0 0;
  color: #78350f;
  font-size: 0.825rem;
}

.resumen-cuenta-baja {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 14px;
}

.resumen-cuenta-linea.principal {
  font-weight: 700;
  font-size: 0.95rem;
  color: #0f172a;
}

.resumen-cuenta-linea.correo {
  font-size: 0.825rem;
  color: #64748b;
  margin-top: 2px;
}

.resumen-cuenta-metadatos {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.775rem;
  color: #475569;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
}

.texto-advertencia-definitiva {
  font-size: 0.825rem;
  color: #64748b;
  margin: 0 0 16px 0;
  line-height: 1.45;
}

.btn-destructivo {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background-color: #dc2626;
  color: #ffffff;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.btn-destructivo:hover:not(:disabled) {
  background-color: #b91c1c;
}

.btn-destructivo:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Spinner */
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-top-color: var(--color-primario, #00bba6);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.spinner-pequeno {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Animaciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
