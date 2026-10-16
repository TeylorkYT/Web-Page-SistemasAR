/**
 * ==============================================================================
 * SISTEMASAR - SERVICIO DE ADMINISTRADOR (adminService.js)
 * ==============================================================================
 * Desarrollado por: Teylork (Líder)
 *
 * Capa de servicios con datos falsos para el módulo de administración:
 * - Vista 14: Dashboard general del administrador (métricas, gráficos y técnicos)
 * - Vista 16: Asignación de técnico a tickets (tickets pendientes, técnicos y asignación)
 * - Vista 17: Gestión de categorías y servicios asociados
 * - Vista 20: Calificaciones y feedback recibidos (métricas de satisfacción, filtros y alertas)
 *
 * Cumple con la regla del Daily 2: funciones async que simulan llamadas al backend.
 * ==============================================================================
 */

import { cliente } from "../api/client";
import {
  categorias as categoriasIniciales,
  tickets as ticketsIniciales,
  usuarios as usuariosIniciales,
  calificaciones as calificacionesIniciales,
  tecnicos,
  clientes,
  ticketCategorias,
  historial
} from "../data/datosFalsos";

// ------------------------------------------------------------------------------
// ESTADO MUTABLE EN MEMORIA PARA LA SESIÓN ACTIVA
// ------------------------------------------------------------------------------
let categoriasMemoria = [...categoriasIniciales];

let serviciosMemoria = [
  {
    id_servicio: 1,
    id_categoria: 1, // Hardware
    nombre_servicio: "Mant. preventivo",
    descripcion: "Limpieza interna profunda, cambio de pasta térmica y revisión de ventiladores.",
    tiempo_estimado: "2h",
    costo: "50.000"
  },
  {
    id_servicio: 2,
    id_categoria: 1, // Hardware
    nombre_servicio: "Cambio de RAM",
    descripcion: "Diagnóstico de compatibilidad e instalación de módulos de memoria DDR4/DDR5.",
    tiempo_estimado: "30m",
    costo: "30.000"
  },
  {
    id_servicio: 3,
    id_categoria: 2, // Software
    nombre_servicio: "Instalación de Sistema Operativo",
    descripcion: "Formateo e instalación limpia con controladores certificados y utilidades base.",
    tiempo_estimado: "3h",
    costo: "70.000"
  },
  {
    id_servicio: 4,
    id_categoria: 2, // Software
    nombre_servicio: "Eliminación de Virus y Malware",
    descripcion: "Escaneo profundo, remoción de amenazas persistentes y optimización de inicio.",
    tiempo_estimado: "1h 30m",
    costo: "45.000"
  },
  {
    id_servicio: 5,
    id_categoria: 3, // Redes y Conectividad
    nombre_servicio: "Configuración de Router / Switch",
    descripcion: "Configuración de subredes, seguridad WPA3, DHCP y direccionamiento IP.",
    tiempo_estimado: "1h",
    costo: "40.000"
  },
  {
    id_servicio: 6,
    id_categoria: 3, // Redes y Conectividad
    nombre_servicio: "Ponchado y Cableado UTP",
    descripcion: "Armado de conectores RJ45, pruebas de continuidad y certificación básica.",
    tiempo_estimado: "45m",
    costo: "25.000"
  },
  {
    id_servicio: 7,
    id_categoria: 4, // Seguridad Informática
    nombre_servicio: "Respaldo y Copias de Seguridad",
    descripcion: "Configuración de políticas de copias automatizadas en almacenamiento externo/nube.",
    tiempo_estimado: "2h",
    costo: "60.000"
  },
  {
    id_servicio: 8,
    id_categoria: 5, // Periféricos e Impresoras
    nombre_servicio: "Mantenimiento de Rodillos y Cabezales",
    descripcion: "Limpieza correctiva de atascos de papel, alineación y purga de inyectores.",
    tiempo_estimado: "1h 15m",
    costo: "35.000"
  }
];

let ticketsMemoria = [...ticketsIniciales];

// Función para construir objeto de ticket pendiente con datos relacionales v2.0
export function construirTicketPendiente(t) {
  const clienteUser = usuariosIniciales.find((u) => u.id_usuario === t.id_cliente);
  const catsRel = ticketCategorias.filter((tc) => tc.id_ticket === t.id_ticket);
  const nombresCats = catsRel.map((tc) => {
    const cat = categoriasMemoria.find((c) => c.id_categoria === tc.id_categoria);
    return cat ? cat.nombre_categoria : `Cat #${tc.id_categoria}`;
  });

  return {
    id_ticket: t.id_ticket,
    codigo: `TKT-${t.id_ticket}`,
    titulo: t.titulo,
    cliente: clienteUser ? `${clienteUser.nombre} ${clienteUser.apellido}` : `Cliente #${t.id_cliente}`,
    falla: t.titulo,
    descripcion: t.descripcion,
    prioridad: t.prioridad, // 'Baja', 'Media', 'Alta', 'Critica'
    modalidad: t.modalidad,
    fecha_creacion: t.fecha_creacion,
    fecha_creacion_texto: t.fecha_creacion,
    categorias: nombresCats.length > 0 ? nombresCats : ["General"],
    categoria: nombresCats.join(", ") || "General",
    estado: t.estado,
    id_tecnico: t.id_tecnico
  };
}

// Tickets pendientes de asignación fieles al esquema v2.0 (estado Abierto sin técnico)
let ticketsPendientesMemoria = ticketsMemoria
  .filter((t) => t.estado === "Abierto" && !t.id_tecnico)
  .map(construirTicketPendiente);

// Función para enriquecer objeto de calificación con datos relacionales v2.0
export function enriquecerCalificacion(c) {
  const ticket = ticketsMemoria.find((t) => t.id_ticket === c.id_ticket);
  const tecnico = usuariosIniciales.find((u) => u.id_usuario === c.id_tecnico);
  const cliente = usuariosIniciales.find((u) => u.id_usuario === c.id_cliente);
  const clienteSub = clientes.find((cl) => cl.id_usuario === c.id_cliente);

  return {
    id_calificacion: c.id_calificacion,
    id_ticket: c.id_ticket,
    codigo_ticket: `TKT-${c.id_ticket}`,
    id_tecnico: c.id_tecnico,
    tecnico: tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : `Técnico #${c.id_tecnico}`,
    id_cliente: c.id_cliente,
    cliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : `Cliente #${c.id_cliente}`,
    contacto: clienteSub ? clienteSub.telefono : (cliente ? cliente.correo_electronico : ""),
    correo_cliente: cliente ? cliente.correo_electronico : "",
    puntuacion: c.puntuacion,
    comentario: c.comentario,
    comentario_resumen: c.comentario && c.comentario.length > 28 ? c.comentario.substring(0, 25) + "..." : c.comentario,
    comentario_completo: c.comentario,
    fecha_calificacion: c.fecha_calificacion,
    fecha: c.fecha_calificacion ? c.fecha_calificacion.substring(0, 10) : "",
    rango: "este_mes",
    esAlerta: c.puntuacion <= 2,
    titulo_ticket: ticket ? ticket.titulo : `Ticket #${c.id_ticket}`
  };
}

let calificacionesMemoria = calificacionesIniciales.map(enriquecerCalificacion);

// ==============================================================================
// 1. DASHBOARD DEL ADMINISTRADOR (VISTA 14)
// ==============================================================================

/**
 * Obtiene las métricas generales del dashboard: totales, abiertos, técnicos activos,
 * series para el gráfico comparativo y el listado de técnicos activos en tiempo real.
 */
export async function obtenerMetricasDashboard() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const ticketsTotales = ticketsMemoria.length;
      const ticketsAbiertos = ticketsMemoria.filter((t) => t.estado !== "Cerrado").length;
      const ticketsCerrados = ticketsMemoria.filter((t) => t.estado === "Cerrado").length;

      // Técnicos activos: disponibilidad distinta de 'Fuera_de_Servicio'
      const tecnicosActivosLista = tecnicos.filter(
        (tec) => tec.disponibilidad !== "Fuera_de_Servicio"
      );
      const tecnicosActivos = tecnicosActivosLista.length;

      // Tabla de monitoreo en tiempo real con datos de v2.0
      const tecnicosMonitoreo = tecnicosActivosLista.map((tec) => {
        const usuario = usuariosIniciales.find((u) => u.id_usuario === tec.id_usuario);
        const ticketEnProceso = ticketsMemoria.find(
          (t) => t.id_tecnico === tec.id_usuario && t.estado === "En_Proceso"
        );
        return {
          id: tec.id_usuario,
          nombre: usuario ? `${usuario.nombre} ${usuario.apellido}` : `Técnico #${tec.id_usuario}`,
          estado: tec.disponibilidad, // 'Disponible', 'Ocupado', 'En_Almuerzo'
          ticketActual: ticketEnProceso ? `TKT-${ticketEnProceso.id_ticket}` : "-"
        };
      });

      resolve({
        ticketsTotales,
        ticketsAbiertos,
        ticketsCerrados,
        tecnicosActivos,
        graficoSemanal: [
          { etiqueta: "Sem 1", abiertos: 4, cerrados: 2, porcentaje: 60 },
          { etiqueta: "Sem 2", abiertos: 6, cerrados: 3, porcentaje: 75 },
          { etiqueta: "Sem 3", abiertos: 5, cerrados: 3, porcentaje: 65 },
          { etiqueta: "Sem 4", abiertos: ticketsAbiertos, cerrados: ticketsCerrados, porcentaje: Math.round(((ticketsCerrados || 1) / (ticketsTotales || 1)) * 100) }
        ],
        graficoMensual: [
          { etiqueta: "Mayo", abiertos: 12, cerrados: 10, porcentaje: 70 },
          { etiqueta: "Junio", abiertos: 15, cerrados: 12, porcentaje: 80 },
          { etiqueta: "Julio", abiertos: 18, cerrados: 16, porcentaje: 88 },
          { etiqueta: "Agosto", abiertos: ticketsAbiertos, cerrados: ticketsCerrados, porcentaje: 95 }
        ],
        tecnicosMonitoreo
      });
    }, 100);
  });
}

// ==============================================================================
// 2. GESTIÓN DE CATEGORÍAS (VISTA 17)
// ==============================================================================

/**
 * Obtiene el listado completo de categorías registradas.
 */
export async function obtenerCategorias() {
  const { data } = await cliente.get("/categorias");
  return data;
}

export async function crearCategoria(datos) {
  try {
    const { data } = await cliente.post("/categorias", datos);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al crear la categoría");
  }
}

export async function actualizarCategoria(idCategoria, datos) {
  try {
    const { data } = await cliente.put(`/categorias/${idCategoria}`, datos);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al actualizar la categoría");
  }
}

/**
 * Elimina una categoría y sus servicios asociados en memoria.
 */
export async function eliminarCategoria(idCategoria) {
  const idNum = Number(idCategoria);
  categoriasMemoria = categoriasMemoria.filter((c) => c.id_categoria !== idNum);
  serviciosMemoria = serviciosMemoria.filter((s) => s.id_categoria !== idNum);
  return { exito: true, mensaje: "Categoría eliminada con éxito" };
}

// ==============================================================================
// 3. GESTIÓN DE SERVICIOS ASOCIADOS (VISTA 17)
// ==============================================================================

/**
 * Obtiene los servicios asociados a una categoría específica o todos los servicios.
 */
export async function obtenerServicios(idCategoria = null) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (idCategoria !== null && idCategoria !== undefined) {
        const idNum = Number(idCategoria);
        resolve(serviciosMemoria.filter((s) => s.id_categoria === idNum));
      } else {
        resolve([...serviciosMemoria]);
      }
    }, 100);
  });
}

/**
 * Registra un nuevo servicio asociado a una categoría.
 */
export async function crearServicio(datos) {
  const nombreLimpio = (datos.nombre_servicio || "").trim();
  if (!nombreLimpio) {
    throw new Error("El nombre del servicio es obligatorio");
  }
  if (!datos.id_categoria) {
    throw new Error("Debe seleccionar una categoría padre");
  }

  const nuevo = {
    id_servicio: Date.now(),
    id_categoria: Number(datos.id_categoria),
    nombre_servicio: nombreLimpio,
    descripcion: (datos.descripcion || "").trim(),
    tiempo_estimado: (datos.tiempo_estimado || "").trim() || "1h",
    costo: (datos.costo || "").trim() || "0"
  };

  serviciosMemoria = [...serviciosMemoria, nuevo];
  return nuevo;
}

/**
 * Actualiza los datos de un servicio existente.
 */
export async function actualizarServicio(idServicio, datos) {
  const nombreLimpio = (datos.nombre_servicio || "").trim();
  if (!nombreLimpio) {
    throw new Error("El nombre del servicio es obligatorio");
  }

  const idNum = Number(idServicio);
  const index = serviciosMemoria.findIndex((s) => s.id_servicio === idNum);
  if (index === -1) {
    throw new Error("Servicio no encontrado");
  }

  const servicioActualizado = {
    ...serviciosMemoria[index],
    id_categoria: Number(datos.id_categoria) || serviciosMemoria[index].id_categoria,
    nombre_servicio: nombreLimpio,
    descripcion: (datos.descripcion || "").trim(),
    tiempo_estimado: (datos.tiempo_estimado || "").trim() || serviciosMemoria[index].tiempo_estimado,
    costo: (datos.costo || "").trim() || serviciosMemoria[index].costo
  };

  serviciosMemoria[index] = servicioActualizado;
  return servicioActualizado;
}

/**
 * Elimina un servicio en memoria.
 */
export async function eliminarServicio(idServicio) {
  const idNum = Number(idServicio);
  serviciosMemoria = serviciosMemoria.filter((s) => s.id_servicio !== idNum);
  return { exito: true, mensaje: "Servicio eliminado con éxito" };
}

// ==============================================================================
// 4. ASIGNACIÓN DE TÉCNICOS (VISTA 16)
// ==============================================================================

/**
 * Obtiene la lista de tickets pendientes de asignación con opción de filtro por prioridad.
 */
export async function obtenerTicketsPendientes(filtroPrioridad = "TODAS") {
  const params = { estado: "Abierto" };
  if (filtroPrioridad && filtroPrioridad !== "TODAS") {
    params.prioridad = filtroPrioridad;
  }
  const { data } = await cliente.get("/tickets", { params });
  return data.map((t) => ({
    id_ticket: t.id_ticket,
    codigo: `TKT-${t.id_ticket}`,
    titulo: t.titulo,
    cliente: t.cliente_nombre || `Cliente #${t.id_cliente}`,
    falla: t.titulo,
    descripcion: t.descripcion,
    prioridad: t.prioridad,
    modalidad: t.modalidad,
    fecha_creacion: t.fecha_creacion,
    fecha_creacion_texto: t.fecha_creacion ? t.fecha_creacion.substring(0, 10) : "",
    categorias: (t.categorias || []).map((c) => c.nombre_categoria || c),
    categoria: (t.categorias || []).map((c) => c.nombre_categoria || c).join(", ") || "General",
    estado: t.estado,
    id_tecnico: t.id_tecnico,
  }));
}

export async function obtenerDetalleTicketAsignar(idTicket) {
  const idStr = String(idTicket).replace(/^(TKT-|#)/i, "");
  const { data } = await cliente.get(`/tickets/${idStr}`);
  return {
    id_ticket: data.id_ticket,
    codigo: `TKT-${data.id_ticket}`,
    titulo: data.titulo,
    cliente: data.cliente_nombre || `Cliente #${data.id_cliente}`,
    falla: data.titulo,
    descripcion: data.descripcion,
    prioridad: data.prioridad,
    modalidad: data.modalidad,
    fecha_creacion: data.fecha_creacion,
    fecha_creacion_texto: data.fecha_creacion ? data.fecha_creacion.substring(0, 10) : "",
    categorias: (data.categorias || []).map((c) => c.nombre_categoria || c),
    categoria: (data.categorias || []).map((c) => c.nombre_categoria || c).join(", ") || "General",
    estado: data.estado,
    id_tecnico: data.id_tecnico,
  };
}

export async function obtenerTecnicosParaAsignar() {
  const { data } = await cliente.get("/tecnicos");
  return data.map((tec) => ({
    id_tecnico: tec.id_usuario,
    nombre: `${tec.nombre} ${tec.apellido}`,
    especialidad: tec.especialidad,
    disponibilidad: tec.disponibilidad,
    ticketsEnProceso: tec.tickets_en_proceso,
    alertaCarga: tec.tickets_en_proceso >= 5,
    deshabilitado: tec.disponibilidad === "Fuera_de_Servicio",
    estado: tec.disponibilidad.replace(/_/g, " "),
  }));
}

export async function asignarTecnicoATicket(idTicket, idTecnico, prioridadAjustada = null) {
  try {
    const payload = {
      id_tecnico: Number(idTecnico),
    };
    if (prioridadAjustada && prioridadAjustada !== "TODAS") {
      payload.prioridad = prioridadAjustada;
    }
    const { data } = await cliente.patch(`/tickets/${idTicket}/asignar`, payload);
    return data;
  } catch (error) {
    const detalle = error.response?.data?.detail;
    throw new Error(typeof detalle === "string" ? detalle : "Error al asignar el técnico");
  }
}

// ==============================================================================
// 5. CALIFICACIONES Y FEEDBACK (VISTA 20)
// ==============================================================================

/**
 * Obtiene las métricas de satisfacción general para las tarjetas superiores de la Vista 20.
 */
/**
 * Obtiene las métricas de satisfacción general para las tarjetas superiores de la Vista 20 (v2.0).
 */
export async function obtenerMetricasSatisfaccion() {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (calificacionesMemoria.length === 0) {
        return resolve({
          promedioGeneral: "0.0",
          mejorValorado: { nombre: "Sin registros", promedio: "0.0" },
          alertasBajaCalif: 0
        });
      }

      const totalPuntos = calificacionesMemoria.reduce((acc, c) => acc + c.puntuacion, 0);
      const promedioGeneral = (totalPuntos / calificacionesMemoria.length).toFixed(1);

      // Calcular técnico mejor valorado
      const promediosPorTecnico = {};
      calificacionesMemoria.forEach((c) => {
        if (!promediosPorTecnico[c.id_tecnico]) {
          promediosPorTecnico[c.id_tecnico] = { nombre: c.tecnico, suma: 0, count: 0 };
        }
        promediosPorTecnico[c.id_tecnico].suma += c.puntuacion;
        promediosPorTecnico[c.id_tecnico].count += 1;
      });

      let mejor = { nombre: "Diana Paz", promedio: "5.0" };
      let maxProm = -1;
      Object.values(promediosPorTecnico).forEach((t) => {
        const prom = t.suma / t.count;
        if (prom > maxProm) {
          maxProm = prom;
          mejor = { nombre: t.nombre, promedio: prom.toFixed(1) };
        }
      });

      const alertasBajaCalif = calificacionesMemoria.filter((c) => c.puntuacion <= 2).length;

      resolve({
        promedioGeneral,
        mejorValorado: mejor,
        alertasBajaCalif
      });
    }, 80);
  });
}

/**
 * Obtiene la lista de calificaciones con filtros aplicados (Técnico, Rango de fechas sobre fecha_calificacion, Puntaje 1-5).
 */
export async function obtenerCalificacionesSupervision(filtros = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let resultado = [...calificacionesMemoria];

      // Filtro por técnico
      if (filtros.tecnico && filtros.tecnico !== "todos") {
        resultado = resultado.filter((c) =>
          c.tecnico.toLowerCase().includes(filtros.tecnico.toLowerCase()) ||
          String(c.id_tecnico) === String(filtros.tecnico)
        );
      }

      // Filtro por rango de fechas (sobre fecha_calificacion)
      if (filtros.fechaInicio) {
        resultado = resultado.filter((c) => c.fecha_calificacion >= filtros.fechaInicio);
      }
      if (filtros.fechaFin) {
        resultado = resultado.filter((c) => c.fecha_calificacion <= filtros.fechaFin + " 23:59:59");
      }
      if (filtros.rango && filtros.rango !== "todos" && !filtros.fechaInicio && !filtros.fechaFin) {
        if (filtros.rango === "este_mes") {
          resultado = resultado.filter((c) => (c.fecha_calificacion || "").startsWith("2026-08"));
        }
      }

      // Filtro por puntaje (1 a 5)
      if (filtros.puntaje && filtros.puntaje !== "todos") {
        const numPuntaje = Number(filtros.puntaje);
        resultado = resultado.filter((c) => c.puntuacion === numPuntaje);
      }

      resolve(resultado);
    }, 100);
  });
}

/**
 * Obtiene las filas de Historial_Ticket correspondientes al ticket de una calificación (Requisito D4).
 */
export async function obtenerHistorialTicketCalificacion(idTicket) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const idNum = Number(idTicket);
      const rows = historial.filter((h) => h.id_ticket === idNum);
      resolve(rows);
    }, 80);
  });
}

/**
 * Simula el envío de un correo de seguimiento al cliente que emitió feedback.
 */
export async function enviarCorreoSeguimientoCliente(codigoTicket, _datosContacto) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        exito: true,
        mensaje: `Correo de seguimiento enviado exitosamente al cliente del ticket #${codigoTicket}.`
      });
    }, 120);
  });
}

/**
 * Obtiene las calificaciones con datos expandidos de cliente, técnico y ticket (base).
 */
export async function obtenerCalificacionesAdmin() {
  return calificacionesMemoria;
}