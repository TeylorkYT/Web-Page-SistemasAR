<template>
  <button
    :type="tipo"
    :class="clasesBoton"
    :disabled="deshabilitado"
    :style="estiloFinal"
    @click="manejarClick"
  >
    <span v-if="$slots.icono || icono" class="boton-icono">
      <slot name="icono">{{ icono }}</slot>
    </span>
    <span>
      <slot>{{ texto }}</slot>
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import './Boton.css';

const props = defineProps({
  texto: {
    type: String,
    default: '',
  },
  variante: {
    type: String,
    default: 'primario',
  },
  tipo: {
    type: String,
    default: 'button',
  },
  icono: {
    type: [String, Object],
    default: null,
  },
  deshabilitado: {
    type: Boolean,
    default: false,
  },
  anchoCompleto: {
    type: Boolean,
    default: false,
  },
  className: {
    type: String,
    default: '',
  },
  style: {
    type: [Object, String],
    default: null,
  },
  estilo: {
    type: [Object, String],
    default: null,
  },
});

const emit = defineEmits(['click']);

const estiloFinal = computed(() => props.style || props.estilo);

const clasesBoton = computed(() => {
  return [
    'boton-reutilizable',
    `boton-${props.variante}`,
    props.anchoCompleto ? 'boton-ancho-completo' : '',
    props.className,
  ]
    .filter(Boolean)
    .join(' ');
});

const manejarClick = (e) => {
  if (props.deshabilitado) {
    e.preventDefault();
    return;
  }
  emit('click', e);
};
</script>
