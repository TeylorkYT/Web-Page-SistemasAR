<template>
  <div style="padding: 40px; font-family: var(--fuente-principal); color: var(--color-texto-principal);">
    <h2>Estado de los Servicios</h2>
    <p style="margin: 10px 0;"><strong>Backend:</strong> {{ backend }}</p>
    <p style="margin: 10px 0;"><strong>Base de datos:</strong> {{ baseDatos }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { API_URL } from '../services/api';

const backend = ref('Consultando...');
const baseDatos = ref('Consultando...');

onMounted(() => {
  fetch(`${API_URL}/health`)
    .then((res) => res.json())
    .then((data) => (backend.value = data.status))
    .catch(() => (backend.value = 'sin conexión'));

  fetch(`${API_URL}/db-check`)
    .then((res) => res.json())
    .then((data) => (baseDatos.value = data.database))
    .catch(() => (baseDatos.value = 'sin conexión'));
});
</script>
