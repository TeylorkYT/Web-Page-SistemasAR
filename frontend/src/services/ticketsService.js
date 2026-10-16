// Funciones con datos falsos de este módulo
import { tickets, categorias, historialTickets, usuarios } from '../data/datosFalsos';

// ------------------------------------------------------------------
// Tickets
// ------------------------------------------------------------------

/** Devuelve todos los tickets del cliente con id_cliente = 1 (usuario de prueba) */
export async function listarTickets() {
  // Enriquecer cada ticket con los nombres de sus categorías
  return tickets
    .filter((t) => t.id_cliente === 1)
    .map((t) => ({
      ...t,
      categorias: (t.categorias_ids || []).map(
        (cid) => categorias.find((c) => c.id_categoria === cid)?.nombre_categoria ?? ''
      )
    }));
}

/** Devuelve un ticket por id con su historial enriquecido */
export async function obtenerTicket(id) {
  const ticket = tickets.find((t) => String(t.id_ticket) === String(id));
  if (!ticket) return null;

  const historial = historialTickets
    .filter((h) => h.id_ticket === ticket.id_ticket)
    .map((h) => ({
      ...h,
      nombre_usuario:
        usuarios.find((u) => u.id_usuario === h.id_usuario)?.nombre ?? 'Sistema'
    }));

  return {
    ...ticket,
    categorias: (ticket.categorias_ids || []).map(
      (cid) => categorias.find((c) => c.id_categoria === cid)?.nombre_categoria ?? ''
    ),
    historial
  };
}

/**
 * Simula la creación de un ticket.
 * @param {{ titulo: string, descripcion: string, categorias_ids: number[], id_equipo: number|null }} datos
 */
export async function crearTicket(datos) {
  const nuevoId = tickets.length + 1;
  const nuevo = {
    id_ticket: nuevoId,
    titulo: datos.titulo,
    descripcion: datos.descripcion,
    fecha_creacion: new Date().toISOString().slice(0, 10),
    fecha_resolucion: null,
    fecha_cierre: null,
    prioridad: 'Media',
    estado: 'Abierto',
    id_cliente: 1,
    id_tecnico: null,
    id_asignado_por: null,
    id_equipo: datos.id_equipo ?? null,
    categorias_ids: datos.categorias_ids ?? []
  };
  tickets.push(nuevo);
  return nuevo;
}

// ------------------------------------------------------------------
// Categorías
// ------------------------------------------------------------------

/** Devuelve todas las categorías disponibles */
export async function listarCategorias() {
  return categorias;
}

// ------------------------------------------------------------------
// Calificación
// ------------------------------------------------------------------

/**
 * Simula enviar una calificación para un ticket.
 * @param {{ id_ticket: number, puntuacion: number, comentario: string }} datos
 */
export async function calificarTicket(datos) {
  // Solo actualización local del estado; el backend real lo persistiría
  return { ...datos, id_calificacion: Date.now() };
}
