<template>
  <div class="recuperar-pantalla">
    <div class="recuperar-tarjeta">
      <div class="recuperar-cabecera">
        <h1 class="recuperar-titulo">Recuperar Contraseña</h1>
        <p class="recuperar-subtitulo">
          Ingresa tu correo y te enviaremos las instrucciones.
        </p>
      </div>

      <div v-if="error" class="recuperar-alerta recuperar-error">
        {{ error }}
      </div>

      <div v-if="mensaje" class="recuperar-alerta recuperar-exito">
        {{ mensaje }}
      </div>

      <form @submit.prevent="manejarEnvio" no-validate>
        <Campo
          etiqueta="Correo electrónico"
          tipo="email"
          v-model="correo"
          placeholder="ejemplo@prueba.com"
          requerido
        />

        <div style="margin-top: 14px;">
          <Boton
            tipo="submit"
            variante="primario"
            ancho-completo
            :deshabilitado="enviando || segundosBloqueo > 0"
          >
            {{
              enviando
                ? 'Enviando…'
                : segundosBloqueo > 0
                ? `Espera ${segundosBloqueo}s para reenviar`
                : 'Enviar instrucciones'
            }}
          </Boton>
        </div>
      </form>

      <div class="recuperar-pie">
        <router-link to="/login" class="recuperar-enlace">
          Volver al Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Campo from '../../components/Campo.vue';
import Boton from '../../components/Boton.vue';
import { solicitarRecuperacion } from '../../services/authService';

const correo = ref('');
const mensaje = ref('');
const error = ref('');
const enviando = ref(false);
const segundosBloqueo = ref(0);
let timer = null;

const manejarEnvio = async () => {
  error.value = '';
  mensaje.value = '';

  if (!correo.value.trim()) {
    error.value = 'Por favor ingresa tu correo electrónico registrado.';
    return;
  }

  enviando.value = true;
  try {
    const respuesta = await solicitarRecuperacion(correo.value);
    mensaje.value =
      respuesta.mensaje ||
      'Si el correo está registrado, recibirás las instrucciones para restablecer tu contraseña.';
    segundosBloqueo.value = 20;
    iniciarTemporizador();
  } catch (err) {
    error.value = err.message || 'Ocurrió un error al procesar tu solicitud.';
  } finally {
    enviando.value = false;
  }
};

const iniciarTemporizador = () => {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (segundosBloqueo.value > 0) {
      segundosBloqueo.value--;
    } else {
      clearInterval(timer);
    }
  }, 1000);
};

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.recuperar-pantalla {
  min-height: 100vh;
  background-color: var(--color-fondo-app, #f4f8fa);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: var(--fuente-principal);
}

.recuperar-tarjeta {
  background-color: var(--color-superficie, #ffffff);
  padding: 36px 32px;
  border-radius: var(--radio-tarjeta, 14px);
  box-shadow: var(--sombra-elevada, 0 12px 32px rgba(7, 30, 51, 0.12));
  border: 1px solid var(--color-borde, #e2ebf1);
  width: 100%;
  max-width: 440px;
  box-sizing: border-box;
}

.recuperar-cabecera {
  text-align: center;
  margin-bottom: 24px;
}

.recuperar-titulo {
  margin: 0 0 6px 0;
  font-size: 1.5rem;
  color: var(--color-texto-principal, #072137);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.recuperar-subtitulo {
  margin: 0;
  font-size: 0.88rem;
  color: var(--color-texto-secundario, #556980);
}

.recuperar-alerta {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.86rem;
  margin-bottom: 18px;
  text-align: center;
}

.recuperar-error {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.recuperar-exito {
  background-color: #e6f9f6;
  border: 1px solid #9ee7dc;
  color: #007a6c;
}

.recuperar-pie {
  margin-top: 24px;
  text-align: center;
}

.recuperar-enlace {
  color: var(--color-primario, #00bba6);
  font-weight: 700;
  font-size: 0.88rem;
  text-decoration: none;
}

.recuperar-enlace:hover {
  text-decoration: underline;
}
</style>
