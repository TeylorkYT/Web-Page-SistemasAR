<template>
  <div class="seccion-adjuntos-card">
    <div class="seccion-adjuntos-header">
      <div>
        <h2 class="seccion-adjuntos-titulo">{{ tituloSeccion }}</h2>
        <p class="seccion-adjuntos-subtitulo">
          {{ adjuntos.length }} de {{ MAX_ADJUNTOS }} evidencias adjuntas (JPG, PNG, PDF · máx 5 MB)
        </p>
      </div>

      <div v-if="puedeSubir">
        <input
          ref="inputRef"
          type="file"
          id="input-adjunto"
          accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          style="display: none"
          @change="manejarSeleccionArchivo"
          :disabled="subiendo"
        />
        <button
          type="button"
          id="btn-subir-adjunto"
          class="seccion-adjuntos-btn-subir"
          @click="abrirSelector"
          :disabled="subiendo"
        >
          {{ subiendo ? 'Subiendo…' : '+ Adjuntar evidencia' }}
        </button>
      </div>
    </div>

    <div v-if="esTicketCerrado" class="seccion-adjuntos-aviso-cerrado">
      🔒 El ticket está cerrado. No se permite adjuntar nuevos archivos.
    </div>

    <div v-if="error" id="msg-error-adjuntos" class="seccion-adjuntos-alerta seccion-adjuntos-error">
      <span>{{ error }}</span>
      <button type="button" @click="error = ''" class="seccion-adjuntos-cerrar-alerta">×</button>
    </div>

    <div v-if="exito" id="msg-exito-adjuntos" class="seccion-adjuntos-alerta seccion-adjuntos-exito">
      <span>{{ exito }}</span>
      <button type="button" @click="exito = ''" class="seccion-adjuntos-cerrar-alerta">×</button>
    </div>

    <div v-if="cargando" class="seccion-adjuntos-cargando">Cargando evidencias…</div>

    <div v-else-if="adjuntos.length === 0" class="seccion-adjuntos-vacio">
      <p class="seccion-adjuntos-vacio-texto">Sin evidencias adjuntas en este ticket.</p>
      <button
        v-if="puedeSubir"
        type="button"
        class="seccion-adjuntos-btn-enlace"
        @click="abrirSelector"
      >
        Subir la primera evidencia
      </button>
    </div>

    <ul v-else class="seccion-adjuntos-lista">
      <li v-for="adj in adjuntos" :key="adj.id_adjunto" class="seccion-adjuntos-item">
        <div class="seccion-adjuntos-item-icono">
          {{ obtenerIcono(adj) }}
        </div>
        <div class="seccion-adjuntos-item-info">
          <span class="seccion-adjuntos-item-nombre" :title="adj.nombre_archivo">
            {{ adj.nombre_archivo }}
          </span>
          <span class="seccion-adjuntos-item-meta">
            {{ formatearTamano(adj.tamano_bytes) }}
            {{ adj.fecha_subida ? ` · ${adj.fecha_subida}` : '' }}
          </span>
        </div>
        <button
          type="button"
          :id="`btn-descargar-adjunto-${adj.id_adjunto}`"
          class="seccion-adjuntos-btn-descargar"
          @click="manejarDescargar(adj)"
          :disabled="descargandoId === adj.id_adjunto"
          title="Descargar archivo"
        >
          {{ descargandoId === adj.id_adjunto ? 'Descargando…' : '⬇ Descargar' }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import {
  listarAdjuntos,
  subirAdjunto,
  descargarAdjunto,
} from '../services/ticketsService';
import './SeccionAdjuntos.css';

const props = defineProps({
  idTicket: {
    type: [String, Number],
    required: true,
  },
  estadoTicket: {
    type: String,
    default: '',
  },
  tituloSeccion: {
    type: String,
    default: '📎 Evidencias y archivos adjuntos',
  },
});

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_ADJUNTOS = 3;

const adjuntos = ref([]);
const cargando = ref(true);
const subiendo = ref(false);
const descargandoId = ref(null);
const error = ref('');
const exito = ref('');
const inputRef = ref(null);

function formatearTamano(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const esTicketCerrado = computed(() => props.estadoTicket === 'Cerrado');
const limiteAlcanzado = computed(() => adjuntos.value.length >= MAX_ADJUNTOS);
const puedeSubir = computed(() => !esTicketCerrado.value && !limiteAlcanzado.value);

const abrirSelector = () => {
  if (inputRef.value) {
    inputRef.value.click();
  }
};

const obtenerIcono = (adj) => {
  const esPdf = adj.tipo_mime === 'application/pdf' || adj.nombre_archivo?.toLowerCase().endsWith('.pdf');
  const esImagen = adj.tipo_mime?.startsWith('image/') || /\.(jpe?g|png)$/i.test(adj.nombre_archivo || '');
  return esPdf ? '📄' : esImagen ? '🖼️' : '📎';
};

const recargar = async () => {
  if (!props.idTicket) return;
  try {
    const datos = await listarAdjuntos(props.idTicket);
    adjuntos.value = Array.isArray(datos) ? datos : [];
  } catch (err) {
    error.value = err.message || 'No se pudieron cargar los archivos adjuntos';
  } finally {
    cargando.value = false;
  }
};

const manejarSeleccionArchivo = async (e) => {
  const archivo = e.target.files?.[0];
  e.target.value = '';
  if (!archivo) return;

  error.value = '';
  exito.value = '';

  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    error.value = 'Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG o documentos PDF.';
    return;
  }

  if (archivo.size > MAX_BYTES) {
    error.value = `El archivo supera el tamaño máximo permitido de 5 MB (${formatearTamano(archivo.size)}).`;
    return;
  }

  if (adjuntos.value.length >= MAX_ADJUNTOS) {
    error.value = `Se ha alcanzado el límite máximo de ${MAX_ADJUNTOS} adjuntos para este ticket.`;
    return;
  }

  subiendo.value = true;
  try {
    await subirAdjunto(props.idTicket, archivo);
    exito.value = `Archivo "${archivo.name}" subido con éxito.`;
    await recargar();
  } catch (err) {
    error.value = err.message || 'Error al subir el archivo adjunto.';
  } finally {
    subiendo.value = false;
  }
};

const manejarDescargar = async (adjunto) => {
  descargandoId.value = adjunto.id_adjunto;
  error.value = '';
  try {
    await descargarAdjunto(props.idTicket, adjunto.id_adjunto, adjunto.nombre_archivo);
  } catch (err) {
    error.value = err.message || 'Error al descargar el archivo.';
  } finally {
    descargandoId.value = null;
  }
};

watch(() => props.idTicket, () => {
  recargar();
});

onMounted(() => {
  recargar();
});
</script>
