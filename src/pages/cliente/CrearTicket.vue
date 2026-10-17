<template>
  <Layout rol="cliente" item-activo="crear-ticket" :nombre-usuario="sesion?.nombre">
    <h1 class="crear-ticket-titulo">Crear nuevo ticket</h1>

    <div class="crear-ticket-tarjeta">
      <form id="form-crear-ticket" @submit.prevent="handleSubmit" no-validate>
        <!-- Título -->
        <div class="crear-ticket-campo">
          <label for="campo-titulo" class="crear-ticket-label">
            Título <span class="crear-ticket-requerido">*</span>
          </label>
          <input
            id="campo-titulo"
            type="text"
            class="crear-ticket-input"
            placeholder="Describe brevemente el problema"
            v-model="titulo"
            maxlength="100"
          />
        </div>

        <!-- Modalidad y Equipo -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 22px;">
          <div class="crear-ticket-campo" style="margin-bottom: 0;">
            <label for="campo-modalidad" class="crear-ticket-label">
              Modalidad de atención
            </label>
            <select
              id="campo-modalidad"
              class="crear-ticket-input"
              v-model="modalidad"
            >
              <option value="Presencial">Presencial (en oficina)</option>
              <option value="Remoto">Remoto (asistencia remota)</option>
            </select>
          </div>

          <div class="crear-ticket-campo" style="margin-bottom: 0;">
            <label for="campo-equipo" class="crear-ticket-label">
              Equipo asociado <span class="crear-ticket-ayuda">(opcional)</span>
            </label>
            <select
              id="campo-equipo"
              class="crear-ticket-input"
              v-model="idEquipo"
            >
              <option value="">-- Sin equipo específico --</option>
              <option v-for="eq in equipos" :key="eq.id_equipo" :value="eq.id_equipo">
                {{ eq.tipo }} - {{ eq.marca }} {{ eq.modelo }} ({{ eq.serial }})
              </option>
            </select>
          </div>
        </div>

        <!-- Descripción -->
        <div class="crear-ticket-campo">
          <label for="campo-descripcion" class="crear-ticket-label">
            Descripción <span class="crear-ticket-requerido">*</span>
          </label>
          <textarea
            id="campo-descripcion"
            class="crear-ticket-textarea"
            placeholder="Explica el problema con el mayor detalle posible"
            rows="5"
            v-model="descripcion"
          ></textarea>
        </div>

        <!-- Categorías — selección múltiple -->
        <div class="crear-ticket-campo">
          <label class="crear-ticket-label">
            Categorías <span class="crear-ticket-requerido">*</span>
            <span class="crear-ticket-ayuda"> (puedes elegir varias)</span>
          </label>
          <div class="crear-ticket-categorias">
            <label
              v-for="cat in categorias"
              :key="cat.id_categoria"
              class="crear-ticket-cat-chip"
              :class="{ seleccionada: categoriasSeleccionadas.includes(cat.id_categoria) }"
            >
              <input
                :id="`cat-${cat.id_categoria}`"
                type="checkbox"
                :checked="categoriasSeleccionadas.includes(cat.id_categoria)"
                @change="toggleCategoria(cat.id_categoria)"
                class="crear-ticket-cat-checkbox"
              />
              {{ cat.nombre_categoria }}
            </label>
          </div>
        </div>

        <!-- Evidencias / Adjuntos -->
        <div class="crear-ticket-campo">
          <div class="crear-ticket-adjuntos-header">
            <label class="crear-ticket-label">
              Archivos adjuntos de evidencia <span class="crear-ticket-ayuda">(opcional, máx. 3 archivos)</span>
            </label>
            <span class="crear-ticket-contador-adjuntos">
              {{ archivos.length }} / {{ MAX_ADJUNTOS }}
            </span>
          </div>

          <input
            ref="inputArchivoRef"
            type="file"
            id="input-archivos-crear"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            multiple
            style="display: none;"
            @change="manejarSeleccionArchivos"
            :disabled="enviando || archivos.length >= MAX_ADJUNTOS"
          />

          <div v-if="archivos.length < MAX_ADJUNTOS">
            <button
              type="button"
              id="btn-agregar-adjuntos"
              class="crear-ticket-btn-adjuntar"
              @click="abrirSelector"
              :disabled="enviando"
            >
              📎 Seleccionar imágenes o PDFs (máx. 5 MB c/u)
            </button>
          </div>

          <ul v-if="archivos.length > 0" class="crear-ticket-lista-adjuntos">
            <li v-for="(arch, idx) in archivos" :key="`${arch.name}-${idx}`" class="crear-ticket-item-adjunto">
              <span class="crear-ticket-nombre-adjunto">
                {{ arch.type.includes('pdf') ? '📄' : '🖼️' }} {{ arch.name }} ({{ formatearTamano(arch.size) }})
              </span>
              <button
                type="button"
                class="crear-ticket-btn-quitar-adjunto"
                @click="quitarArchivo(idx)"
                :disabled="enviando"
                title="Quitar archivo"
              >
                ✕
              </button>
            </li>
          </ul>
        </div>

        <!-- Mensajes -->
        <p v-if="progresoTexto" class="crear-ticket-progreso">{{ progresoTexto }}</p>
        <p v-if="error" id="msg-error-crear" class="crear-ticket-error">{{ error }}</p>
        <p v-if="exito" id="msg-exito-crear" class="crear-ticket-exito">{{ exito }}</p>

        <!-- Botones -->
        <div class="crear-ticket-acciones">
          <button
            type="button"
            id="btn-cancelar-ticket"
            class="crear-ticket-btn-secundario"
            @click="router.push('/cliente/tickets')"
          >
            Cancelar
          </button>
          <button
            type="submit"
            id="btn-enviar-ticket"
            class="crear-ticket-btn-primario"
            :disabled="enviando"
          >
            {{ enviando ? 'Enviando…' : 'Crear ticket' }}
          </button>
        </div>
      </form>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Layout from '../../components/Layout.vue';
import { useAuth } from '../../context/useAuth';
import { obtenerEquiposCliente } from '../../services/clienteService';
import { crearTicket, listarCategorias, subirAdjunto } from '../../services/ticketsService';
import './CrearTicket.css';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_ADJUNTOS = 3;

function formatearTamano(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const router = useRouter();
const { sesion } = useAuth();
const inputArchivoRef = ref(null);

const categorias = ref([]);
const equipos = ref([]);
const titulo = ref('');
const descripcion = ref('');
const modalidad = ref('Presencial');
const idEquipo = ref('');
const categoriasSeleccionadas = ref([]);
const archivos = ref([]);
const enviando = ref(false);
const progresoTexto = ref('');
const error = ref('');
const exito = ref('');

onMounted(() => {
  listarCategorias().then((data) => (categorias.value = data || []));
  obtenerEquiposCliente().then((data) => (equipos.value = data || [])).catch(() => {});
});

const toggleCategoria = (id) => {
  if (categoriasSeleccionadas.value.includes(id)) {
    categoriasSeleccionadas.value = categoriasSeleccionadas.value.filter((c) => c !== id);
  } else {
    categoriasSeleccionadas.value.push(id);
  }
};

const abrirSelector = () => {
  if (inputArchivoRef.value) {
    inputArchivoRef.value.click();
  }
};

const manejarSeleccionArchivos = (e) => {
  const seleccionados = Array.from(e.target.files || []);
  e.target.value = '';
  error.value = '';

  if (archivos.value.length + seleccionados.length > MAX_ADJUNTOS) {
    error.value = `Solo puedes adjuntar un máximo de ${MAX_ADJUNTOS} archivos por ticket.`;
    return;
  }

  const validos = [];
  for (const archivo of seleccionados) {
    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      error.value = `El archivo "${archivo.name}" tiene un formato no permitido. Usa JPG, PNG o PDF.`;
      return;
    }
    if (archivo.size > MAX_BYTES) {
      error.value = `El archivo "${archivo.name}" supera el límite de 5 MB (${formatearTamano(archivo.size)}).`;
      return;
    }
    validos.push(archivo);
  }

  archivos.value = [...archivos.value, ...validos];
};

const quitarArchivo = (indice) => {
  archivos.value = archivos.value.filter((_, idx) => idx !== indice);
};

const handleSubmit = async () => {
  error.value = '';
  exito.value = '';
  progresoTexto.value = '';

  if (!titulo.value.trim()) {
    error.value = 'El título es obligatorio.';
    return;
  }
  if (titulo.value.trim().length > 100) {
    error.value = 'El título no puede superar los 100 caracteres.';
    return;
  }
  if (!descripcion.value.trim()) {
    error.value = 'La descripción es obligatoria.';
    return;
  }
  if (categoriasSeleccionadas.value.length === 0) {
    error.value = 'Selecciona al menos una categoría.';
    return;
  }

  enviando.value = true;
  try {
    progresoTexto.value = 'Registrando ticket…';
    const ticketCreado = await crearTicket({
      titulo: titulo.value.trim(),
      descripcion: descripcion.value.trim(),
      modalidad: modalidad.value,
      categorias_ids: categoriasSeleccionadas.value,
      id_equipo: idEquipo.value ? Number(idEquipo.value) : null,
    });

    if (archivos.value.length > 0) {
      let subidos = 0;
      const erroresSubida = [];

      for (let i = 0; i < archivos.value.length; i++) {
        const arch = archivos.value[i];
        progresoTexto.value = `Subiendo evidencia ${i + 1} de ${archivos.value.length}: ${arch.name}…`;
        try {
          await subirAdjunto(ticketCreado.id_ticket, arch);
          subidos++;
        } catch (err) {
          erroresSubida.push(`${arch.name} (${err.message})`);
        }
      }

      if (erroresSubida.length > 0) {
        exito.value = `Ticket creado (#${ticketCreado.id_ticket}) con ${subidos} evidencia(s). Advertencia: algunos archivos no se pudieron subir: ${erroresSubida.join(', ')}.`;
      } else {
        exito.value = `Ticket #${ticketCreado.id_ticket} creado exitosamente con todas sus evidencias. Redirigiendo…`;
      }
    } else {
      exito.value = `Ticket #${ticketCreado.id_ticket} creado con éxito. Redirigiendo…`;
    }

    setTimeout(() => router.push('/cliente/tickets'), 1800);
  } catch (err) {
    error.value = err.message || 'No se pudo crear el ticket. Intenta de nuevo.';
  } finally {
    enviando.value = false;
    progresoTexto.value = '';
  }
};
</script>
