<template>
  <div class="tabla-contenedor-responsive">
    <div v-if="!filas || filas.length === 0" class="tabla-vacia">
      <p class="tabla-mensaje-vacio">{{ mensajeVacio }}</p>
    </div>
    <table v-else class="tabla-reutilizable">
      <thead>
        <tr>
          <th v-for="col in columnas" :key="col.campo" class="tabla-th" :style="{ textAlign: col.alineacion || 'left' }">
            {{ col.titulo }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(fila, index) in filas" :key="fila.id || index" class="tabla-tr">
          <td v-for="col in columnas" :key="col.campo" class="tabla-td" :style="{ textAlign: col.alineacion || 'left' }">
            <template v-if="col.render">
              <component :is="resolverRender(col.render, fila, index)" />
            </template>
            <template v-else>
              {{ fila[col.campo] }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { h } from 'vue';

const props = defineProps({
  columnas: {
    type: Array,
    required: true,
  },
  filas: {
    type: Array,
    default: () => [],
  },
  mensajeVacio: {
    type: String,
    default: 'No hay registros para mostrar',
  },
});

const resolverRender = (renderFn, fila, index) => {
  return {
    render() {
      const res = renderFn(fila, index);
      if (typeof res === 'object' && res !== null) {
        return res;
      }
      return h('span', String(res ?? ''));
    },
  };
};
</script>

<style scoped>
.tabla-contenedor-responsive {
  width: 100%;
  overflow-x: auto;
  background-color: var(--color-superficie, #ffffff);
  border-radius: var(--radio-tarjeta, 14px);
  border: 1px solid var(--color-borde, #e2ebf1);
  box-shadow: 0 2px 8px rgba(7, 30, 51, 0.04);
}

.tabla-reutilizable {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--fuente-principal);
  font-size: 0.875rem;
  color: var(--color-texto-principal, #072137);
}

.tabla-th {
  background-color: #f8fafc;
  color: var(--color-texto-secundario, #556980);
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-borde, #e2ebf1);
}

.tabla-tr {
  transition: background-color 0.15s ease;
}

.tabla-tr:hover {
  background-color: #f4f9fc;
}

.tabla-td {
  padding: 14px 18px;
  border-bottom: 1px solid #edf2f7;
  vertical-align: middle;
}

.tabla-tr:last-child .tabla-td {
  border-bottom: none;
}

.tabla-vacia {
  padding: 36px 20px;
  text-align: center;
}

.tabla-mensaje-vacio {
  color: var(--color-texto-secundario, #556980);
  font-size: 0.95rem;
  margin: 0;
}
</style>
