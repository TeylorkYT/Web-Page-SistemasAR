<template>
  <Teleport to="body">
    <div v-if="abierto" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-tarjeta" :style="{ maxWidth: maxWidth || '560px' }">
        <div class="modal-cabecera">
          <h3 class="modal-titulo">{{ titulo }}</h3>
          <button type="button" class="modal-boton-cerrar" @click="cerrarModal" aria-label="Cerrar modal">
            ✕
          </button>
        </div>
        <div class="modal-cuerpo">
          <slot></slot>
        </div>
        <div v-if="$slots.pie" class="modal-pie">
          <slot name="pie"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  abierto: {
    type: Boolean,
    default: false,
  },
  titulo: {
    type: String,
    default: '',
  },
  maxWidth: {
    type: String,
    default: '560px',
  },
});

const emit = defineEmits(['cerrar']);

const cerrarModal = () => {
  emit('cerrar');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(7, 30, 51, 0.65);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
  animation: fadeIn 0.2s ease-out;
}

.modal-tarjeta {
  background-color: var(--color-superficie, #ffffff);
  border-radius: var(--radio-tarjeta, 14px);
  box-shadow: 0 20px 40px rgba(7, 30, 51, 0.22);
  border: 1px solid var(--color-borde, #e2ebf1);
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.22s ease-out;
  overflow: hidden;
}

.modal-cabecera {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-borde, #e2ebf1);
}

.modal-titulo {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-texto-principal, #072137);
  letter-spacing: -0.02em;
}

.modal-boton-cerrar {
  background: none;
  border: none;
  color: var(--color-texto-secundario, #556980);
  font-size: 1.1rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.modal-boton-cerrar:hover {
  background-color: #f1f5f9;
  color: var(--color-peligro, #ef4444);
}

.modal-cuerpo {
  padding: 24px;
  overflow-y: auto;
}

.modal-pie {
  padding: 16px 24px;
  border-top: 1px solid var(--color-borde, #e2ebf1);
  background-color: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
