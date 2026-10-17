<template>
  <span class="estado-badge-pill" :style="estilosBadge">
    <span class="estado-punto" :style="{ backgroundColor: estiloActual.punto }"></span>
    {{ textoFormateado }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  estado: {
    type: [String, Number],
    default: '',
  },
});

const ESTILOS_POR_ESTADO = {
  activo: { bg: '#e6f9f6', color: '#007a6c', borde: '#9ee7dc', punto: '#00bba6' },
  disponible: { bg: '#e6f9f6', color: '#007a6c', borde: '#9ee7dc', punto: '#00bba6' },
  resuelto: { bg: '#e6f9f6', color: '#007a6c', borde: '#9ee7dc', punto: '#00bba6' },
  en_proceso: { bg: '#fef3c7', color: '#b45309', borde: '#fde68a', punto: '#f59e0b' },
  'en proceso': { bg: '#fef3c7', color: '#b45309', borde: '#fde68a', punto: '#f59e0b' },
  abierto: { bg: '#e0f2fe', color: '#0369a1', borde: '#bae6fd', punto: '#0284c7' },
  pendiente: { bg: '#fef3c7', color: '#b45309', borde: '#fde68a', punto: '#f59e0b' },
  cerrado: { bg: '#f1f5f9', color: '#475569', borde: '#e2e8f0', punto: '#64748b' },
  inactivo: { bg: '#f1f5f9', color: '#64748b', borde: '#e2e8f0', punto: '#94a3b8' },
  agotado: { bg: '#fff7ed', color: '#c2410c', borde: '#ffedd5', punto: '#ea580c' },
  de_baja: { bg: '#fee2e2', color: '#b91c1c', borde: '#fecaca', punto: '#ef4444' },
  alta: { bg: '#fee2e2', color: '#b91c1c', borde: '#fecaca', punto: '#ef4444' },
  media: { bg: '#fef3c7', color: '#b45309', borde: '#fde68a', punto: '#f59e0b' },
  baja: { bg: '#e0f2fe', color: '#0369a1', borde: '#bae6fd', punto: '#0284c7' },
};

const clave = computed(() => String(props.estado || '').toLowerCase().trim());

const estiloActual = computed(() => {
  return (
    ESTILOS_POR_ESTADO[clave.value] || {
      bg: '#f1f5f9',
      color: '#475569',
      borde: '#e2e8f0',
      punto: '#64748b',
    }
  );
});

const textoFormateado = computed(() => {
  const str = String(props.estado || '');
  if (!str) return '';
  return str.replace(/_/g, ' ');
});

const estilosBadge = computed(() => ({
  backgroundColor: estiloActual.value.bg,
  color: estiloActual.value.color,
  border: `1px solid ${estiloActual.value.borde}`,
}));
</script>

<style scoped>
.estado-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: capitalize;
  letter-spacing: 0.02em;
  line-height: 1.3;
  white-space: nowrap;
}

.estado-punto {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}
</style>
