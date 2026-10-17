<template>
  <Layout rol="administrador" item-activo="reportes">
    <div style="max-width: 1200px; margin: 0 auto; padding: 8px 16px 40px 16px;">
      <h1 style="color: var(--color-sidebar-fondo, #071e33); font-weight: 700; margin-bottom: 24px;">
        Generación de reportes
      </h1>

      <div class="reportes-card">
        <h3 style="color: var(--color-sidebar-fondo, #071e33); font-weight: 700; margin-top: 0; margin-bottom: 16px;">
          1. Parámetros del reporte
        </h3>

        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <label style="flex: 1; min-width: 200px; font-weight: 600; color: #334155; font-size: 0.9rem;">
            Tipo de reporte
            <select
              v-model="tipo"
              class="reportes-input"
              style="margin-top: 6px;"
            >
              <option value="tecnico">Rendimiento por técnico</option>
              <option value="categoria">Por categoría</option>
              <option value="periodo">Por periodo</option>
            </select>
          </label>

          <label style="flex: 1; min-width: 200px; font-weight: 600; color: #334155; font-size: 0.9rem;">
            Seleccionar técnico
            <select
              v-model="idTecnico"
              class="reportes-input"
              style="margin-top: 6px;"
            >
              <option value="todos">Todos</option>
              <option v-for="t in tecnicos" :key="t.id_usuario" :value="String(t.id_usuario)">
                {{ t.nombre }} {{ t.apellido }}
              </option>
            </select>
          </label>
        </div>

        <div style="display: flex; gap: 12px; align-items: center; margin-top: 16px; flex-wrap: wrap;">
          <span style="font-weight: 600; color: #334155; font-size: 0.9rem;">Rango de fechas:</span>
          <input v-model="desde" type="date" class="reportes-input" style="width: auto;" />
          <span style="color: #64748b;">a</span>
          <input v-model="hasta" type="date" class="reportes-input" style="width: auto;" />
        </div>

        <div style="margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap;">
          <button
            type="button"
            class="boton-reporte-generar"
            @click="generar"
          >
            Generar reporte
          </button>
          <button
            type="button"
            style="padding: 10px 18px; border-radius: 20px; border: 1px solid #cbd5e1; background: #fff; font-weight: 600; cursor: pointer; color: #475569;"
            @click="limpiar"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <div v-if="resultado" style="margin-top: 28px;">
        <h3 style="color: var(--color-sidebar-fondo, #071e33); font-weight: 700; margin-bottom: 8px;">
          2. Resultados del reporte
        </h3>
        <p style="color: #64748b; margin-top: 0; margin-bottom: 20px;">
          Resumen: rendimiento de {{ nombreElegido }}
          {{ desde || hasta ? ` (${desde || "inicio"} a ${hasta || "hoy"})` : "" }}
        </p>

        <div style="display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;">
          <div class="reportes-card" style="flex: 1; min-width: 200px;">
            <p style="color: #64748b; font-weight: 600; margin: 0 0 6px 0;">Tickets resueltos</p>
            <h2 style="color: #059669; margin: 0; font-size: 2.2rem; font-weight: 800;">
              {{ resultado.resueltos }}
            </h2>
          </div>
          <div class="reportes-card" style="flex: 1; min-width: 200px;">
            <p style="color: #64748b; font-weight: 600; margin: 0 0 6px 0;">Tiempo promedio (horas)</p>
            <h2 style="color: var(--color-primario, #00bba6); margin: 0; font-size: 2.2rem; font-weight: 800;">
              {{ resultado.tiempoPromedio }}
            </h2>
          </div>
        </div>

        <div class="reportes-card" style="margin-bottom: 20px;">
          <p style="color: var(--color-sidebar-fondo, #071e33); font-weight: 700; font-size: 1.05rem; margin-top: 0; margin-bottom: 16px;">
            Tickets por categoría
          </p>

          <p v-if="total === 0" style="color: #64748b;">
            No hay tickets cerrados en ese rango
          </p>
          <div v-else style="display: flex; gap: 28px; align-items: center; flex-wrap: wrap;">
            <div
              :style="{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: `conic-gradient(${trozos.join(', ')})`
              }"
            />
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
              <li v-for="([categoria, n], i) in cats" :key="categoria" style="font-size: 0.95rem; font-weight: 500;">
                <span :style="{ color: colores[i % colores.length], fontSize: '1.2rem', marginRight: '6px' }">■</span>
                <strong>{{ categoria }}</strong>: {{ n }}
              </li>
            </ul>
          </div>
        </div>

        <h3 style="color: var(--color-sidebar-fondo, #071e33); font-weight: 700; margin-bottom: 12px;">
          Detalle de tickets cerrados
        </h3>

        <div style="background-color: #ffffff; border: 1px solid var(--color-borde, #e2e8f0); border-radius: 14px; overflow: hidden; box-shadow: 0 4px 14px rgba(7, 30, 51, 0.04);">
          <Tabla :columnas="columnas" :filas="resultado.detalle" mensaje-vacio="No hay tickets cerrados en ese rango">
            <template #col-id="{ fila }">
              <span style="font-weight: 700; color: var(--color-primario, #00bba6);">#{{ fila.id }}</span>
            </template>
            <template #col-horas="{ fila }">
              {{ fila.horas ?? "-" }}
            </template>
          </Tabla>
        </div>

        <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 10px;">
          <div
            v-if="errorExportar"
            style="color: #b91c1c; background: #fef2f2; padding: 8px 14px; border-radius: 8px; font-size: 0.88rem; border: 1px solid #fecaca;"
          >
            {{ errorExportar }}
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <button
              id="btn-exportar-pdf"
              type="button"
              :disabled="exportando"
              style="padding: 10px 22px; background: #dc2626; color: white; border: none; border-radius: 20px; font-weight: 700; cursor: pointer; opacity: 1; transition: all 0.2s;"
              @click="manejarExportar('pdf')"
            >
              {{ exportando ? "Exportando…" : "📄 Exportar a PDF" }}
            </button>
            <button
              id="btn-exportar-excel"
              type="button"
              :disabled="exportando"
              style="padding: 10px 22px; background: #16a34a; color: white; border: none; border-radius: 20px; font-weight: 700; cursor: pointer; opacity: 1; transition: all 0.2s;"
              @click="manejarExportar('excel')"
            >
              {{ exportando ? "Exportando…" : "📊 Exportar a Excel" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Layout from '../../components/Layout.vue';
import Tabla from '../../components/Tabla.vue';
import { exportarReporte, generarReporte, listarTecnicos } from '../../services/reportesService';

const colores = ['#00bba6', '#0284c7', '#071e33', '#eab308', '#dc2626', '#16a34a'];

const tecnicos = ref([]);
const tipo = ref('tecnico');
const idTecnico = ref('todos');
const desde = ref('');
const hasta = ref('');
const resultado = ref(null);
const exportando = ref(false);
const errorExportar = ref('');

onMounted(async () => {
  const lista = await listarTecnicos();
  tecnicos.value = lista;
});

const generar = async () => {
  const res = await generarReporte({
    idTecnico: idTecnico.value,
    desde: desde.value,
    hasta: hasta.value
  });
  resultado.value = res;
};

const manejarExportar = async (formato) => {
  errorExportar.value = '';
  exportando.value = true;
  try {
    const mapaReporte = {
      tecnico: 'por_agente',
      categoria: 'incidencias_area_categoria',
      periodo: 'tiempos_resolucion'
    };
    const tipoInforme = mapaReporte[tipo.value] || 'por_agente';
    await exportarReporte(tipoInforme, formato, { desde: desde.value, hasta: hasta.value });
  } catch (err) {
    errorExportar.value = err.message || 'Error al exportar el reporte.';
  } finally {
    exportando.value = false;
  }
};

const limpiar = () => {
  tipo.value = 'tecnico';
  idTecnico.value = 'todos';
  desde.value = '';
  hasta.value = '';
  resultado.value = null;
  errorExportar.value = '';
};

const tecnicoElegido = computed(() => {
  return tecnicos.value.find((t) => String(t.id_usuario) === idTecnico.value);
});

const nombreElegido = computed(() => {
  return tecnicoElegido.value
    ? `${tecnicoElegido.value.nombre} ${tecnicoElegido.value.apellido}`
    : 'todos los técnicos';
});

const cats = computed(() => {
  return resultado.value ? Object.entries(resultado.value.porCategoria) : [];
});

const total = computed(() => {
  return cats.value.reduce((s, [, n]) => s + n, 0);
});

const trozos = computed(() => {
  if (total.value === 0) return [];
  let acumulado = 0;
  return cats.value.map(([, n], i) => {
    const inicio = (acumulado / total.value) * 100;
    acumulado += n;
    return `${colores[i % colores.length]} ${inicio}% ${(acumulado / total.value) * 100}%`;
  });
});

const columnas = [
  { titulo: 'Ticket', campo: 'id' },
  { titulo: 'Título', campo: 'titulo' },
  { titulo: 'Categoría', campo: 'categorias' },
  { titulo: 'Cliente', campo: 'cliente' },
  { titulo: 'Técnico', campo: 'tecnico' },
  { titulo: 'Horas', campo: 'horas' }
];
</script>

<style scoped>
.reportes-card {
  border: 1px solid var(--color-borde, #e2e8f0);
  border-radius: 14px;
  padding: 22px;
  background: white;
  box-shadow: 0 4px 14px rgba(7, 30, 51, 0.04);
}

.reportes-input {
  display: block;
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1.5px solid #cbd5e1;
  font-size: 0.95rem;
  box-sizing: border-box;
  outline: none;
  background: #fff;
}

.reportes-input:focus {
  border-color: var(--color-primario, #00bba6);
}

.boton-reporte-generar {
  padding: 10px 22px;
  background: linear-gradient(135deg, var(--color-primario, #00bba6) 0%, var(--color-primario-oscuro, #008f7e) 100%);
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 187, 166, 0.25);
  transition: transform 0.2s;
}

.boton-reporte-generar:hover {
  transform: translateY(-2px);
}
</style>
