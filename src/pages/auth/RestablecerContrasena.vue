<template>
  <div class="restablecer-pantalla">
    <div class="restablecer-tarjeta">
      <div class="restablecer-cabecera">
        <h1 class="restablecer-titulo">Restablecer Contraseña</h1>
        <p class="restablecer-subtitulo">
          Crea una nueva contraseña segura para tu cuenta.
        </p>
      </div>

      <div v-if="!token" class="restablecer-alerta restablecer-error">
        <p style="margin: 0 0 8px 0;">El enlace no contiene un token válido de recuperación.</p>
        <router-link to="/recuperar" style="color: #b91c1c; font-weight: 700; text-decoration: underline;">
          Solicitar un nuevo enlace
        </router-link>
      </div>

      <div v-if="error" class="restablecer-alerta restablecer-error">
        <p style="margin: 0;">{{ error }}</p>
        <div v-if="error.includes('expirado') || error.includes('utilizado') || error.includes('inválido')" style="margin-top: 8px;">
          <router-link to="/recuperar" style="color: #b91c1c; font-weight: 700;">
            Solicitar otro enlace
          </router-link>
        </div>
      </div>

      <div v-if="exito" class="restablecer-alerta restablecer-exito">
        {{ exito }}
      </div>

      <form v-if="token" @submit.prevent="manejarEnvio" no-validate>
        <Campo
          etiqueta="Nueva contraseña"
          tipo="password"
          v-model="nuevaContrasena"
          placeholder="Mínimo 8 caracteres"
          requerido
        />

        <Campo
          etiqueta="Confirmar nueva contraseña"
          tipo="password"
          v-model="confirmarContrasena"
          placeholder="Repite la nueva contraseña"
          requerido
        />

        <div style="margin-top: 18px;">
          <Boton
            tipo="submit"
            variante="primario"
            ancho-completo
            :deshabilitado="guardando"
          >
            {{ guardando ? 'Actualizando…' : 'Restablecer contraseña' }}
          </Boton>
        </div>
      </form>

      <div class="restablecer-pie">
        <router-link to="/login" class="restablecer-enlace">
          Volver al inicio de sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Campo from '../../components/Campo.vue';
import Boton from '../../components/Boton.vue';
import { restablecerContrasena } from '../../services/authService';

const route = useRoute();
const router = useRouter();

const token = computed(() => route.query.token);

const nuevaContrasena = ref('');
const confirmarContrasena = ref('');
const error = ref('');
const exito = ref('');
const guardando = ref(false);

const manejarEnvio = async () => {
  error.value = '';
  exito.value = '';

  if (!token.value) {
    error.value = 'No se encontró el token de seguridad en la dirección URL.';
    return;
  }

  if (nuevaContrasena.value.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres.';
    return;
  }

  if (nuevaContrasena.value !== confirmarContrasena.value) {
    error.value = 'Las contraseñas no coinciden. Por favor verifícalas.';
    return;
  }

  guardando.value = true;
  try {
    await restablecerContrasena(token.value, nuevaContrasena.value);
    exito.value = '¡Contraseña restablecida con éxito! Redirigiendo al inicio de sesión…';
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (err) {
    error.value = err.message || 'El enlace de recuperación no es válido o ya fue utilizado.';
  } finally {
    guardando.value = false;
  }
};
</script>

<style scoped>
.restablecer-pantalla {
  min-height: 100vh;
  background-color: var(--color-fondo-app, #f4f8fa);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: var(--fuente-principal);
}

.restablecer-tarjeta {
  background-color: var(--color-superficie, #ffffff);
  padding: 36px 32px;
  border-radius: var(--radio-tarjeta, 14px);
  box-shadow: var(--sombra-elevada, 0 12px 32px rgba(7, 30, 51, 0.12));
  border: 1px solid var(--color-borde, #e2ebf1);
  width: 100%;
  max-width: 440px;
  box-sizing: border-box;
}

.restablecer-cabecera {
  text-align: center;
  margin-bottom: 24px;
}

.restablecer-titulo {
  margin: 0 0 6px 0;
  font-size: 1.5rem;
  color: var(--color-texto-principal, #072137);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.restablecer-subtitulo {
  margin: 0;
  font-size: 0.88rem;
  color: var(--color-texto-secundario, #556980);
}

.restablecer-alerta {
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 0.88rem;
  margin-bottom: 18px;
  text-align: center;
}

.restablecer-error {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.restablecer-exito {
  background-color: #e6f9f6;
  border: 1px solid #9ee7dc;
  color: #007a6c;
}

.restablecer-pie {
  margin-top: 24px;
  text-align: center;
}

.restablecer-enlace {
  color: var(--color-primario, #00bba6);
  font-weight: 700;
  font-size: 0.88rem;
  text-decoration: none;
}

.restablecer-enlace:hover {
  text-decoration: underline;
}
</style>
