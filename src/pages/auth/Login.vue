<template>
  <div class="login-pantalla">
    <div class="login-tarjeta">
      <div class="login-cabecera">
        <div class="login-logo-badge">
          <span>⚙️ SistemasAR</span>
        </div>
        <h1 class="login-titulo">Iniciar sesión</h1>
        <p class="login-subtitulo">
          Sistema de Gestión de Tickets de Soporte Técnico
        </p>
      </div>

      <!-- Sección de Cuentas de Demostración -->
      <div class="login-demo-seccion">
        <div class="login-demo-header">
          <span class="login-demo-titulo">Credenciales de prueba (1-Clic)</span>
          <span class="login-demo-clave">Pass: Prueba123*</span>
        </div>

        <div class="login-demo-lista">
          <div
            v-for="cuenta in CUENTAS_DEMO"
            :key="cuenta.rol"
            class="login-demo-item"
            :style="{ backgroundColor: cuenta.bg, borderColor: cuenta.borde }"
          >
            <div class="login-demo-info">
              <span class="login-demo-icono">{{ cuenta.icono }}</span>
              <div class="login-demo-texto">
                <div class="login-demo-rol" :style="{ color: cuenta.color }">
                  {{ cuenta.rol }} • {{ cuenta.nombre }}
                </div>
                <div class="login-demo-correo">{{ cuenta.correo }}</div>
              </div>
            </div>

            <div class="login-demo-acciones">
              <button
                type="button"
                class="login-btn-demo-entrar"
                :style="{ backgroundColor: cuenta.color }"
                @click="seleccionarCuentaDemo(cuenta, true)"
                :disabled="cargando"
                :title="`Entrar directamente como ${cuenta.rol}`"
              >
                Entrar
              </button>
              <button
                type="button"
                class="login-btn-demo-llenar"
                @click="seleccionarCuentaDemo(cuenta, false)"
                :disabled="cargando"
                title="Llenar campos del formulario"
              >
                Llenar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="mensajeExito" class="login-alerta login-alerta-exito">
        ✓ {{ mensajeExito }}
      </div>

      <div v-if="error" class="login-alerta login-alerta-error">
        {{ error }}
      </div>

      <form @submit.prevent="manejarEnvio" no-validate>
        <Campo
          etiqueta="Correo electrónico"
          tipo="email"
          v-model="correo_electronico"
          placeholder="ejemplo@prueba.com"
          :deshabilitado="cargando"
          requerido
        />
        <Campo
          etiqueta="Contraseña"
          tipo="password"
          v-model="contrasena"
          placeholder="Ingresa tu contraseña"
          :deshabilitado="cargando"
          requerido
        />

        <div class="login-olvido-pass">
          <router-link to="/recuperar" class="login-enlace-olvido">
            ¿Olvidaste tu contraseña?
          </router-link>
        </div>

        <Boton
          tipo="submit"
          variante="primario"
          ancho-completo
          :deshabilitado="cargando"
        >
          {{ cargando ? 'Validando credenciales...' : 'Ingresar con credenciales' }}
        </Boton>
      </form>

      <div class="login-pie">
        <div class="login-pie-info">
          <span>🏢</span>
          <span>¿Nuevo cliente? <strong>Solicita tu cuenta al administrador</strong></span>
        </div>

        <button
          type="button"
          class="login-btn-reset"
          @click="manejarReiniciarDatos"
          title="Restaura tickets y datos iniciales"
        >
          Reset datos demo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Campo from '../../components/Campo.vue';
import Boton from '../../components/Boton.vue';
import { iniciarSesion } from '../../services/authService';
import { obtenerRutaPorRol } from '../../routes/rutaPorRol';
import { useAuth } from '../../context/useAuth';
import { reiniciarBaseDeDatos } from '../../api/mockDataStore';

const CUENTAS_DEMO = [
  {
    rol: 'Administrador',
    nombre: 'Carlos Administrador',
    correo: 'admin@prueba.com',
    icono: '👑',
    color: '#072137',
    bg: '#f0f5fa',
    borde: '#cbe0f0',
    descripcion: 'Gestión completa de usuarios, categorías, técnicos y reportes',
  },
  {
    rol: 'Tecnico',
    nombre: 'Diana Paz',
    correo: 'tecnico@prueba.com',
    icono: '🛠️',
    color: '#008b7a',
    bg: '#e6f9f6',
    borde: '#9ee7dc',
    descripcion: 'Atención de tickets asignados, registro de avance y soluciones',
  },
  {
    rol: 'Cliente',
    nombre: 'Laura Ramírez',
    correo: 'cliente@prueba.com',
    icono: '👤',
    color: '#0284c7',
    bg: '#f0f9ff',
    borde: '#bae6fd',
    descripcion: 'Creación de tickets, equipos personales y calificaciones',
  },
];

const correo_electronico = ref('');
const contrasena = ref('');
const cargando = ref(false);
const error = ref('');
const mensajeExito = ref('');

const router = useRouter();
const { sesion, guardarSesion } = useAuth();

onMounted(() => {
  if (sesion.value?.rol) {
    router.replace(obtenerRutaPorRol(sesion.value.rol));
  }
});

const ejecutarLogin = async (correo, pass) => {
  error.value = '';
  cargando.value = true;
  try {
    const respuesta = await iniciarSesion(correo.trim(), pass);
    guardarSesion(respuesta);
    const destino = obtenerRutaPorRol(respuesta.rol);
    router.replace(destino);
  } catch (err) {
    error.value = err.message || 'Correo o contraseña incorrectos';
  } finally {
    cargando.value = false;
  }
};

const manejarEnvio = async () => {
  if (!correo_electronico.value.trim() || !contrasena.value.trim()) {
    error.value = 'Todos los campos son obligatorios';
    return;
  }
  await ejecutarLogin(correo_electronico.value, contrasena.value);
};

const seleccionarCuentaDemo = async (cuenta, entrarDirecto = false) => {
  correo_electronico.value = cuenta.correo;
  contrasena.value = 'Prueba123*';
  error.value = '';

  if (entrarDirecto) {
    await ejecutarLogin(cuenta.correo, 'Prueba123*');
  }
};

const manejarReiniciarDatos = () => {
  reiniciarBaseDeDatos();
  mensajeExito.value = 'Base de datos de prueba restaurada al estado original.';
  setTimeout(() => (mensajeExito.value = ''), 3500);
};
</script>

<style scoped>
.login-pantalla {
  min-height: 100vh;
  background-color: var(--color-fondo-app, #f4f8fa);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  font-family: var(--fuente-principal);
}

.login-tarjeta {
  background-color: var(--color-superficie, #ffffff);
  padding: 40px 36px;
  border-radius: var(--radio-tarjeta, 14px);
  box-shadow: var(--sombra-elevada, 0 12px 32px rgba(7, 30, 51, 0.12));
  border: 1px solid var(--color-borde, #e2ebf1);
  width: 100%;
  max-width: 490px;
  box-sizing: border-box;
}

.login-cabecera {
  text-align: center;
  margin-bottom: 24px;
}

.login-logo-badge {
  display: inline-block;
  background: linear-gradient(135deg, #072137 0%, #0c3358 100%);
  color: #00d2bc;
  font-weight: 800;
  font-size: 1.15rem;
  padding: 8px 20px;
  border-radius: 9999px;
  margin-bottom: 14px;
  letter-spacing: -0.01em;
  box-shadow: 0 4px 14px rgba(7, 33, 55, 0.25);
  border: 1px solid rgba(0, 187, 166, 0.4);
}

.login-titulo {
  margin: 0 0 6px 0;
  font-size: 1.6rem;
  color: var(--color-texto-principal, #072137);
  font-weight: 800;
  letter-spacing: -0.03em;
}

.login-subtitulo {
  margin: 0;
  font-size: 0.88rem;
  color: var(--color-texto-secundario, #556980);
}

.login-demo-seccion {
  background-color: #f8fafc;
  border: 1px solid var(--color-borde, #e2ebf1);
  border-radius: 12px;
  padding: 16px 14px 12px 14px;
  margin-bottom: 22px;
}

.login-demo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.login-demo-titulo {
  font-size: 0.75rem;
  font-weight: 800;
  color: #556980;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.login-demo-clave {
  font-size: 0.72rem;
  color: #007a6c;
  background-color: #e6f9f6;
  border: 1px solid #9ee7dc;
  padding: 2px 8px;
  border-radius: 9999px;
  font-weight: 700;
}

.login-demo-lista {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.login-demo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 10px;
}

.login-demo-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.login-demo-icono {
  font-size: 1.25rem;
}

.login-demo-texto {
  overflow: hidden;
}

.login-demo-rol {
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.25;
}

.login-demo-correo {
  font-size: 0.72rem;
  color: #556980;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.login-demo-acciones {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.login-btn-demo-entrar {
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  transition: opacity 0.2s, transform 0.1s;
}

.login-btn-demo-entrar:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.login-btn-demo-llenar {
  padding: 5px 8px;
  font-size: 0.72rem;
  font-weight: 600;
  background-color: #ffffff;
  color: #556980;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
}

.login-btn-demo-llenar:hover:not(:disabled) {
  background-color: #f1f5f9;
}

.login-alerta {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.84rem;
  margin-bottom: 18px;
  text-align: center;
}

.login-alerta-exito {
  background-color: #e6f9f6;
  border: 1px solid #9ee7dc;
  color: #007a6c;
}

.login-alerta-error {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.login-olvido-pass {
  text-align: right;
  margin-bottom: 18px;
}

.login-enlace-olvido {
  font-size: 0.82rem;
  color: var(--color-primario, #00bba6);
  font-weight: 600;
  text-decoration: none;
}

.login-enlace-olvido:hover {
  text-decoration: underline;
}

.login-pie {
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid var(--color-borde, #e2ebf1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.login-pie-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #556980;
}

.login-btn-reset {
  background: none;
  border: none;
  color: #8ca3ba;
  font-size: 0.72rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.login-btn-reset:hover {
  color: var(--color-primario, #00bba6);
}
</style>
