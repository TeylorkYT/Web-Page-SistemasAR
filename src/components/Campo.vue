<template>
  <div class="campo-contenedor" :style="{ marginBottom: '18px' }">
    <label v-if="etiqueta" class="campo-etiqueta">
      {{ etiqueta }}
      <span v-if="requerido" class="campo-requerido">*</span>
    </label>
    <input
      :type="tipo"
      :value="valorActual"
      :placeholder="placeholder"
      :required="requerido"
      :disabled="deshabilitado"
      class="campo-input"
      :class="{ 'campo-error-input': !!error }"
      @input="alCambiar"
    />
    <p v-if="error" class="campo-mensaje-error">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  etiqueta: {
    type: String,
    default: '',
  },
  tipo: {
    type: String,
    default: 'text',
  },
  modelValue: {
    type: [String, Number],
    default: undefined,
  },
  valor: {
    type: [String, Number],
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  requerido: {
    type: Boolean,
    default: false,
  },
  deshabilitado: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'change', 'input']);

const valorActual = computed(() => {
  return props.modelValue !== undefined ? props.modelValue : props.valor;
});

const alCambiar = (e) => {
  emit('update:modelValue', e.target.value);
  emit('input', e);
  emit('change', e);
};
</script>

<style scoped>
.campo-contenedor {
  display: flex;
  flex-direction: column;
}

.campo-etiqueta {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-texto-principal, #072137);
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}

.campo-requerido {
  color: var(--color-peligro, #ef4444);
  margin-left: 2px;
}

.campo-input {
  width: 100%;
  padding: 10px 14px;
  font-size: 0.95rem;
  font-family: var(--fuente-principal);
  color: var(--color-texto-principal, #072137);
  background-color: var(--color-superficie, #ffffff);
  border: 1px solid var(--color-borde, #e2ebf1);
  border-radius: var(--radio-boton, 10px);
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.campo-input:focus {
  outline: none;
  border-color: var(--color-primario, #00bba6);
  box-shadow: 0 0 0 3px rgba(0, 187, 166, 0.15);
}

.campo-input:disabled {
  background-color: #f8fafc;
  cursor: not-allowed;
  opacity: 0.7;
}

.campo-error-input {
  border-color: var(--color-peligro, #ef4444) !important;
}

.campo-mensaje-error {
  color: var(--color-peligro, #ef4444);
  font-size: 0.8rem;
  font-weight: 500;
  margin: 5px 0 0 0;
}
</style>
