<template>
  <div class="seccion-adjuntos-card">
    <div class="seccion-adjuntos-header">
      <div>
        <h2 class="seccion-adjuntos-titulo" style="display: flex; align-items: center; gap: 8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
          <span>{{ tituloLimpio }}</span>
        </h2>
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
          style="display: inline-flex; align-items: center; gap: 6px;"
        >
          <svg v-if="!subiendo" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>{{ subiendo ? 'Subiendo…' : 'Adjuntar evidencia' }}</span>
        </button>
      </div>
    </div>

    <div v-if="esTicketCerrado" class="seccion-adjuntos-aviso-cerrado" style="display: flex; align-items: center; gap: 8px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      <span>El ticket está cerrado. No se permite adjuntar nuevos archivos.</span>
    </div>

    <div v-if="error" id="msg-error-adjuntos" class="seccion-adjuntos-alerta seccion-adjuntos-error">
      <span>{{ error }}</span>
      <button type="button" @click="error = ''" class="seccion-adjuntos-cerrar-alerta" aria-label="Cerrar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div v-if="exito" id="msg-exito-adjuntos" class="seccion-adjuntos-alerta seccion-adjuntos-exito">
      <span>{{ exito }}</span>
      <button type="button" @click="exito = ''" class="seccion-adjuntos-cerrar-alerta" aria-label="Cerrar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
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
        <div class="seccion-adjuntos-item-icono" style="display: flex; align-items: center; justify-content: center;">
          <svg v-if="esPdfAdjunto(adj)" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          <svg v-else-if="esImagenAdjunto(adj)" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
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
          style="display: inline-flex; align-items: center; gap: 6px;"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>{{ descargandoId === adj.id_adjunto ? 'Descargando…' : 'Descargar' }}</span>
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
    default: 'Evidencias y archivos adjuntos',
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

const tituloLimpio = computed(() => {
  return (props.tituloSeccion || 'Evidencias y archivos adjuntos').replace(/^[\s\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+/u, '').trim();
});

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

const esPdfAdjunto = (adj) => {
  return adj.tipo_mime === 'application/pdf' || adj.nombre_archivo?.toLowerCase().endsWith('.pdf');
};

const esImagenAdjunto = (adj) => {
  return adj.tipo_mime?.startsWith('image/') || /\.(jpe?g|png)$/i.test(adj.nombre_archivo || '');
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
