/**
 * ==============================================================================
 * SISTEMASAR - SERVICIO DE ADMINISTRADOR (adminService.js)
 * ==============================================================================
 * Desarrollado por: Teylork (Líder)
 *
 * Capa de servicios con datos falsos para el módulo de administración:
 * - Vista 14: Dashboard general del administrador (métricas, gráficos y técnicos)
 * - Vista 17: Gestión de categorías y servicios asociados
 * - Vista 16: Asignación de técnico a tickets
 * - Vista 20: Calificaciones recibidas
 *
 * Cumple con la regla del Daily 2: funciones async que simulan llamadas al backend.
 * ==============================================================================
 */

import {
  categorias as categoriasIniciales,
  tickets as ticketsIniciales,
  usuarios as usuariosIniciales,
  calificaciones as calificacionesIniciales
} from "../data/datosFalsos";

// Copias mutables en memoria para la sesión activa del frontend
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
      // Datos correspondientes a los mockups de la Vista 14
      resolve({
        ticketsTotales: 120,
        ticketsAbiertos: 25,
        tecnicosActivos: 12,
        // Datos para el gráfico comparativo
        graficoSemanal: [
          { etiqueta: "Sem 1", abiertos: 60, cerrados: 40, porcentaje: 85 },
          { etiqueta: "Sem 2", abiertos: 45, cerrados: 35, porcentaje: 58 },
          { etiqueta: "Sem 3", abiertos: 25, cerrados: 20, porcentaje: 30 },
          { etiqueta: "Sem 4", abiertos: 15, cerrados: 12, porcentaje: 20 }
        ],
        graficoMensual: [
          { etiqueta: "Mayo", abiertos: 80, cerrados: 75, porcentaje: 70 },
          { etiqueta: "Junio", abiertos: 95, cerrados: 88, porcentaje: 82 },
          { etiqueta: "Julio", abiertos: 110, cerrados: 100, porcentaje: 95 },
          { etiqueta: "Agosto", abiertos: 120, cerrados: 95, porcentaje: 100 }
        ],
        // Técnicos activos en este momento (según mockup)
        tecnicosMonitoreo: [
          { id: 1, nombre: "Carlos T.", estado: "Ocupado", ticketActual: "TKT-1029" },
          { id: 2, nombre: "Diana M.", estado: "Libre", ticketActual: "-" },
          { id: 3, nombre: "Luis F.", estado: "Ocupado", ticketActual: "TKT-1030" },
          { id: 4, nombre: "Andrés R.", estado: "Ocupado", ticketActual: "TKT-1031" },
          { id: 5, nombre: "Sofía C.", estado: "Libre", ticketActual: "-" }
        ]
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
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...categoriasMemoria]);
    }, 100);
  });
}

/**
 * Registra una nueva categoría en la colección en memoria.
 */
export async function crearCategoria(datos) {
  const nombreLimpio = (datos.nombre_categoria || "").trim();
  if (!nombreLimpio) {
    throw new Error("El nombre de la categoría es obligatorio");
  }

  const nueva = {
    id_categoria: Date.now(),
    nombre_categoria: nombreLimpio,
    descripcion: (datos.descripcion || "").trim()
  };

  categoriasMemoria = [...categoriasMemoria, nueva];
  return nueva;
}

/**
 * Actualiza los datos de una categoría existente.
 */
export async function actualizarCategoria(idCategoria, datos) {
  const nombreLimpio = (datos.nombre_categoria || "").trim();
  if (!nombreLimpio) {
    throw new Error("El nombre de la categoría es obligatorio");
  }

  const idNum = Number(idCategoria);
  const index = categoriasMemoria.findIndex((c) => c.id_categoria === idNum);
  if (index === -1) {
    throw new Error("Categoría no encontrada");
  }

  const categoriaActualizada = {
    ...categoriasMemoria[index],
    nombre_categoria: nombreLimpio,
    descripcion: (datos.descripcion || "").trim()
  };

  categoriasMemoria[index] = categoriaActualizada;
  return categoriaActualizada;
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
 * Obtiene el listado de técnicos disponibles para asignar.
 */
export async function obtenerTecnicosDisponibles() {
  return usuariosIniciales.filter((u) => u.rol === "Tecnico" && u.estado === "Activo");
}

/**
 * Asigna un técnico responsable a un ticket.
 */
export async function asignarTecnicoATicket(idTicket, idTecnico) {
  const idTicketNum = Number(idTicket);
  const ticket = ticketsMemoria.find((t) => t.id_ticket === idTicketNum);
  if (!ticket) {
    throw new Error("Ticket no encontrado");
  }

  ticket.id_tecnico = Number(idTecnico);
  ticket.estado = "En_Proceso";
  ticket.id_asignado_por = 3; // ID Administrador Marlon

  return {
    exito: true,
    mensaje: `Técnico asignado exitosamente al ticket #${idTicketNum}`,
    ticket
  };
}

// ==============================================================================
// 5. CALIFICACIONES RECIBIDAS (VISTA 20)
// ==============================================================================

/**
 * Obtiene las calificaciones con datos expandidos de cliente, técnico y ticket.
 */
export async function obtenerCalificacionesAdmin() {
  return calificacionesIniciales.map((c) => {
    const ticket = ticketsIniciales.find((t) => t.id_ticket === c.id_ticket);
    const tecnico = usuariosIniciales.find((u) => u.id_usuario === c.id_tecnico);
    const cliente = usuariosIniciales.find((u) => u.id_usuario === c.id_cliente);

    return {
      ...c,
      titulo_ticket: ticket ? ticket.titulo : `Ticket #${c.id_ticket}`,
      nombre_tecnico: tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : "Técnico",
      nombre_cliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : "Cliente"
    };
  });
}