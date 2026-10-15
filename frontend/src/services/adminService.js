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

import {
  categorias as categoriasIniciales,
  tickets as ticketsIniciales,
  usuarios as usuariosIniciales,
  calificaciones as calificacionesIniciales
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

// Tickets pendientes de asignación fieles al Mockup 16 y conectados con DDL
let ticketsPendientesMemoria = [
  {
    id_ticket: 1035,
    codigo: "TKT-1035",
    titulo: "Sin red local",
    cliente: "Empresa S.A.",
    falla: "Sin red local",
    categoria: "Redes",
    fecha_creacion_texto: "Hace 2 horas",
    prioridad: "ALTA",
    descripcion: "El router de la oficina principal no da señal, luz roja parpadeando constantemente. Toda la planta de ventas se encuentra incomunicada.",
    estado: "Abierto",
    id_tecnico: null
  },
  {
    id_ticket: 1036,
    codigo: "TKT-1036",
    titulo: "PC no enciende",
    cliente: "Juan Pérez",
    falla: "PC no enciende",
    categoria: "Hardware",
    fecha_creacion_texto: "Hace 4 horas",
    prioridad: "MEDIA",
    descripcion: "El equipo de escritorio no responde al presionar el botón de encendido. No enciende ningún LED ni ventilador tras corte de energía.",
    estado: "Abierto",
    id_tecnico: null
  },
  {
    id_ticket: 1037,
    codigo: "TKT-1037",
    titulo: "Act. de software",
    cliente: "Ana Gómez",
    falla: "Act. de software",
    categoria: "Software",
    fecha_creacion_texto: "Hace 1 día",
    prioridad: "BAJA",
    descripcion: "Se requiere actualización a Windows 11 e instalación de paquetería ofimática corporativa y certificado digital.",
    estado: "Abierto",
    id_tecnico: null
  },
  {
    id_ticket: 1038,
    codigo: "TKT-1038",
    titulo: "Falla de impresión en red",
    cliente: "Carlos Ordóñez",
    falla: "Impresora bloqueada",
    categoria: "Periféricos",
    fecha_creacion_texto: "Hace 3 horas",
    prioridad: "MEDIA",
    descripcion: "La impresora térmica de facturación se queda en cola de impresión y marca error de comunicación intermitente.",
    estado: "Abierto",
    id_tecnico: null
  }
];

// Técnicos disponibles con carga de trabajo para asignación (Mockup 16)
let tecnicosCargaMemoria = [
  { id_tecnico: 2, nombre: "Diana M.", estado: "Libre", cargaTickets: 0, especialidad: "Redes y Servidores" },
  { id_tecnico: 1, nombre: "Carlos T.", estado: "1 Tkt", cargaTickets: 1, especialidad: "Hardware y Ensamblaje" },
  { id_tecnico: 3, nombre: "Luis F.", estado: "2 Tkts", cargaTickets: 2, especialidad: "Soporte General" },
  { id_tecnico: 5, nombre: "Andrés R.", estado: "1 Tkt", cargaTickets: 1, especialidad: "Software y Sistemas" },
  { id_tecnico: 6, nombre: "Sofía C.", estado: "Libre", cargaTickets: 0, especialidad: "Seguridad y Redes" }
];

// Calificaciones fieles al Mockup 20 y al modelo de datos
let calificacionesMemoria = [
  {
    id_calificacion: 1,
    codigo_ticket: "TKT-1024",
    id_ticket: 1024,
    tecnico: "Diana M.",
    id_tecnico: 2,
    puntuacion: 5,
    comentario_resumen: "Excelente soporte, muy...",
    comentario_completo: "Excelente soporte, muy rápida la solución y el equipo quedó funcionando al 100%. Totalmente recomendada.",
    cliente: "Tecnología Global",
    contacto: "Carlos Gómez",
    fecha: "2026-10-14",
    rango: "este_mes"
  },
  {
    id_calificacion: 2,
    codigo_ticket: "TKT-1021",
    id_ticket: 1021,
    tecnico: "Carlos T.",
    id_tecnico: 1,
    puntuacion: 4,
    comentario_resumen: "Resolvió el problema...",
    comentario_completo: "Resolvió el problema del servidor a tiempo, aunque tardó un poco en responder las dudas iniciales.",
    cliente: "Distribuidora del Norte",
    contacto: "Jorge Martínez",
    fecha: "2026-10-12",
    rango: "este_mes"
  },
  {
    id_calificacion: 3,
    codigo_ticket: "TKT-1015",
    id_ticket: 1015,
    tecnico: "Diana M.",
    id_tecnico: 2,
    puntuacion: 5,
    comentario_resumen: "Muy amable y...",
    comentario_completo: "Muy amable y capacitó al personal sobre el uso correcto y mantenimiento de la red.",
    cliente: "Colegio San José",
    contacto: "Patricia Vélez",
    fecha: "2026-10-08",
    rango: "este_mes"
  },
  {
    id_calificacion: 4,
    codigo_ticket: "TKT-1010",
    id_ticket: 1010,
    tecnico: "Carlos T.",
    id_tecnico: 1,
    puntuacion: 1,
    comentario_resumen: "No resolvió el...",
    comentario_completo: "El técnico llegó 2 horas tarde, no trajo la herramienta adecuada y el router sigue presentando cortes de red.",
    cliente: "Empresa S.A.",
    contacto: "Ana Gómez",
    fecha: "2026-10-05",
    rango: "este_mes",
    esAlerta: true
  },
  {
    id_calificacion: 5,
    codigo_ticket: "TKT-1008",
    id_ticket: 1008,
    tecnico: "Andrés R.",
    id_tecnico: 5,
    puntuacion: 4,
    comentario_resumen: "Buena atención general...",
    comentario_completo: "Buena atención y disposición, aunque faltó un informe más detallado por escrito.",
    cliente: "Logística Express",
    contacto: "Laura Restrepo",
    fecha: "2026-10-02",
    rango: "este_mes"
  },
  {
    id_calificacion: 6,
    codigo_ticket: "TKT-1002",
    id_ticket: 1002,
    tecnico: "Diana M.",
    id_tecnico: 2,
    puntuacion: 5,
    comentario_resumen: "Impecable servicio...",
    comentario_completo: "Impecable diagnóstico y recuperación de datos en tiempo récord.",
    cliente: "Consultoría Contable",
    contacto: "Esteban Rico",
    fecha: "2026-09-28",
    rango: "mes_anterior"
  },
  {
    id_calificacion: 7,
    codigo_ticket: "TKT-995",
    id_ticket: 995,
    tecnico: "Luis F.",
    id_tecnico: 3,
    puntuacion: 2,
    comentario_resumen: "Faltó seguimiento...",
    comentario_completo: "La falla se solucionó temporalmente pero volvió a presentarse a los dos días sin respuesta inmediata.",
    cliente: "Comercializadora Andina",
    contacto: "Rosa Caicedo",
    fecha: "2026-09-20",
    rango: "mes_anterior",
    esAlerta: true
  }
];

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
      resolve({
        ticketsTotales: 120,
        ticketsAbiertos: 25,
        tecnicosActivos: 12,
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
 * Obtiene la lista de tickets pendientes de asignación con opción de filtro por prioridad.
 */
export async function obtenerTicketsPendientes(filtroPrioridad = "TODAS") {
  return new Promise((resolve) => {
    setTimeout(() => {
      let resultado = [...ticketsPendientesMemoria];
      if (filtroPrioridad && filtroPrioridad !== "TODAS") {
        resultado = resultado.filter(
          (t) => t.prioridad.toUpperCase() === filtroPrioridad.toUpperCase()
        );
      }
      resolve(resultado);
    }, 100);
  });
}

/**
 * Obtiene el detalle de un ticket específico para asignación.
 */
export async function obtenerDetalleTicketAsignar(idTicket) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const idStr = String(idTicket).replace(/^(TKT-|#)/i, "");
      const ticket = ticketsPendientesMemoria.find(
        (t) => String(t.id_ticket) === idStr || t.codigo.toLowerCase().includes(idStr.toLowerCase())
      );
      resolve(ticket || ticketsPendientesMemoria[0] || null);
    }, 80);
  });
}

/**
 * Obtiene el listado de técnicos disponibles con su estado y carga actual.
 */
export async function obtenerTecnicosParaAsignar() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...tecnicosCargaMemoria]);
    }, 80);
  });
}

/**
 * Asigna un técnico responsable a un ticket pendiente.
 */
export async function asignarTecnicoATicket(idTicket, idTecnico) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const idNum = Number(idTicket);
      const ticket = ticketsPendientesMemoria.find((t) => t.id_ticket === idNum);
      if (!ticket) {
        return reject(new Error("Ticket no encontrado en la lista de pendientes"));
      }

      const tecnico = tecnicosCargaMemoria.find((tec) => tec.id_tecnico === Number(idTecnico));
      if (!tecnico) {
        return reject(new Error("Debe seleccionar un técnico válido"));
      }

      // Actualizar carga del técnico
      tecnico.cargaTickets += 1;
      tecnico.estado = `${tecnico.cargaTickets} Tkt${tecnico.cargaTickets > 1 ? "s" : ""}`;

      // Remover o marcar como asignado
      ticketsPendientesMemoria = ticketsPendientesMemoria.filter((t) => t.id_ticket !== idNum);

      resolve({
        exito: true,
        mensaje: `Ticket ${ticket.codigo} asignado exitosamente a ${tecnico.nombre}.`,
        ticketActualizado: { ...ticket, estado: "En_Proceso", id_tecnico: tecnico.id_tecnico }
      });
    }, 120);
  });
}

// ==============================================================================
// 5. CALIFICACIONES Y FEEDBACK (VISTA 20)
// ==============================================================================

/**
 * Obtiene las métricas de satisfacción general para las tarjetas superiores de la Vista 20.
 */
export async function obtenerMetricasSatisfaccion() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        promedioGeneral: "4.5",
        mejorValorado: {
          nombre: "Diana M.",
          promedio: "4.9"
        },
        alertasBajaCalif: 2
      });
    }, 80);
  });
}

/**
 * Obtiene la lista de calificaciones con filtros aplicados (Técnico, Rango de tiempo, Puntaje).
 */
export async function obtenerCalificacionesSupervision(filtros = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let resultado = [...calificacionesMemoria];

      // Filtro por técnico
      if (filtros.tecnico && filtros.tecnico !== "todos") {
        resultado = resultado.filter((c) =>
          c.tecnico.toLowerCase().includes(filtros.tecnico.toLowerCase())
        );
      }

      // Filtro por rango
      if (filtros.rango && filtros.rango !== "todos") {
        if (filtros.rango === "este_mes") {
          resultado = resultado.filter((c) => c.rango === "este_mes");
        }
      }

      // Filtro por puntaje
      if (filtros.puntaje && filtros.puntaje !== "todos") {
        const numPuntaje = Number(filtros.puntaje);
        resultado = resultado.filter((c) => c.puntuacion === numPuntaje);
      }

      resolve(resultado);
    }, 100);
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