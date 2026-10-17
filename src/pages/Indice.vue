<template>
  <div style="padding: 40px; text-align: center; font-family: var(--fuente-principal);">
    <h1 style="color: var(--color-texto-principal); margin-bottom: 24px;">Índice de Vistas - SistemasAR</h1>
    <ul style="list-style: none; padding: 0; max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 8px;">
      <li v-for="vista in vistas" :key="vista.numero">
        <router-link
          :to="vista.ruta"
          style="display: block; padding: 12px 18px; background: #ffffff; border-radius: 10px; border: 1px solid var(--color-borde); color: var(--color-primario); font-weight: 600; text-decoration: none; transition: all 0.2s ease; box-shadow: 0 2px 6px rgba(7,30,51,0.04);"
        >
          {{ vista.numero }}. {{ vista.nombre }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
const vistas = [
  { numero: 1, nombre: 'Login', ruta: '/login' },
  { numero: 2, nombre: 'Recuperación de contraseña', ruta: '/recuperar' },
  { numero: 4, nombre: 'Dashboard del cliente', ruta: '/cliente' },
  { numero: 5, nombre: 'Crear ticket', ruta: '/cliente/tickets/nuevo' },
  { numero: 6, nombre: 'Mis tickets', ruta: '/cliente/tickets' },
  { numero: 7, nombre: 'Detalle del ticket', ruta: '/cliente/tickets/1' },
  { numero: 8, nombre: 'Calificar ticket', ruta: '/cliente/tickets/1/calificar' },
  { numero: 9, nombre: 'Perfil del cliente', ruta: '/cliente/perfil' },
  { numero: 10, nombre: 'Dashboard del técnico', ruta: '/tecnico' },
  { numero: 11, nombre: 'Detalle de ticket asignado', ruta: '/tecnico/tickets/1' },
  { numero: 12, nombre: 'Actualizar avance', ruta: '/tecnico/tickets/1/avance' },
  { numero: 14, nombre: 'Dashboard del administrador', ruta: '/admin' },
  { numero: 15, nombre: 'Asignación de técnico a tickets', ruta: '/admin/asignacion' },
  { numero: 16, nombre: 'Historial de todos los tickets', ruta: '/admin/tickets' },
  { numero: 17, nombre: 'Gestión de usuarios', ruta: '/admin/usuarios' },
  { numero: 18, nombre: 'Gestión de categorías', ruta: '/admin/categorias' },
  { numero: 19, nombre: 'Reportes', ruta: '/admin/reportes' },
  { numero: 20, nombre: 'Calificaciones recibidas', ruta: '/admin/calificaciones' },
];
</script>
