/**
 * ==============================================================================
 * SISTEMASAR - MOTOR DE DATOS SIMULADOS AUTÓNOMO (mockDataStore.js)
 * ==============================================================================
 * Proporciona persistencia en localStorage y respuestas API idénticas al backend
 * FastAPI v2.0 para permitir que el frontend funcione de manera 100% autónoma.
 * ==============================================================================
 */

import datosIniciales from "../data/datosFalsos.js";

const STORAGE_KEY = "sistemasar_mock_db_v2";

// Inicializa o recupera la base de datos simulada en localStorage
export function obtenerBaseDeDatos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const db = JSON.parse(raw);
      let huboCambios = false;

      // Sincronizar Ticket 10 para demo de calificación si no existe
      if (!db.tickets.some((t) => t.id_ticket === 10)) {
        const t10 = datosIniciales.tickets.find((t) => t.id_ticket === 10);
        if (t10) {
          db.tickets.push(JSON.parse(JSON.stringify(t10)));
          huboCambios = true;
        }
      }

      // Asegurar que ticketCategorias incluya el ticket 10
      if (!db.ticketCategorias.some((tc) => tc.id_ticket === 10)) {
        const tc10 = datosIniciales.ticketCategorias.filter((tc) => tc.id_ticket === 10);
        db.ticketCategorias.push(...JSON.parse(JSON.stringify(tc10)));
        huboCambios = true;
      }

      // Asegurar que reportes incluya el reporte del ticket 10
      if (!db.reportes.some((r) => r.id_ticket === 10)) {
        const rep10 = datosIniciales.reportes.find((r) => r.id_ticket === 10);
        if (rep10) {
          db.reportes.push(JSON.parse(JSON.stringify(rep10)));
          huboCambios = true;
        }
      }

      // Asegurar comentarios del ticket 10 y 4
      [10, 4].forEach((tId) => {
        if (!db.comentarios.some((c) => c.id_ticket === tId)) {
          const coms = datosIniciales.comentarios.filter((c) => c.id_ticket === tId);
          if (coms.length > 0) {
            db.comentarios.push(...JSON.parse(JSON.stringify(coms)));
            huboCambios = true;
          }
        }
      });

      // Asegurar historial del ticket 10
      if (!db.historial.some((h) => h.id_ticket === 10)) {
        const hist10 = datosIniciales.historial.filter((h) => h.id_ticket === 10);
        db.historial.push(...JSON.parse(JSON.stringify(hist10)));
        huboCambios = true;
      }

      // Asegurar notificación de resolución del ticket 10
      if (!db.notificaciones.some((n) => n.id_ticket === 10)) {
        const notif10 = datosIniciales.notificaciones.find((n) => n.id_ticket === 10);
        if (notif10) {
          db.notificaciones.push(JSON.parse(JSON.stringify(notif10)));
          huboCambios = true;
        }
      }

      if (!db.calificaciones || db.calificaciones.length < 6) {
        db.calificaciones = JSON.parse(JSON.stringify(datosIniciales.calificaciones || []));
        huboCambios = true;
      }
      // Sanitizar calificaciones para que ningún ticket sin resolver o tickets en espera de calificación tengan calificación asociada
      if (db.calificaciones) {
        db.calificaciones.forEach((c) => {
          if (c.id_ticket === 5) {
            c.id_ticket = 3;
            huboCambios = true;
          }
          if (c.id_ticket === 4 || c.id_ticket === 10) {
            c.id_ticket = 6;
            huboCambios = true;
          }
        });
      }
      if (huboCambios) {
        guardarBaseDeDatos(db);
      }
      return db;
    }
  } catch (err) {
    console.warn("Error leyendo localStorage, reiniciando mock DB:", err);
  }

  // Estructura clonada profunda desde datosFalsos
  const db = {
    usuarios: JSON.parse(JSON.stringify(datosIniciales.usuarios || [])),
    clientes: JSON.parse(JSON.stringify(datosIniciales.clientes || [])),
    tecnicos: JSON.parse(JSON.stringify(datosIniciales.tecnicos || [])),
    administradores: JSON.parse(JSON.stringify(datosIniciales.administradores || [])),
    categorias: JSON.parse(JSON.stringify(datosIniciales.categorias || [])),
    equipos: JSON.parse(JSON.stringify(datosIniciales.equipos || [])),
    tickets: JSON.parse(JSON.stringify(datosIniciales.tickets || [])),
    ticketCategorias: JSON.parse(JSON.stringify(datosIniciales.ticketCategorias || [])),
    adjuntos: JSON.parse(JSON.stringify(datosIniciales.adjuntos || [])),
    historial: JSON.parse(JSON.stringify(datosIniciales.historial || [])),
    comentarios: JSON.parse(JSON.stringify(datosIniciales.comentarios || [])),
    reportes: JSON.parse(JSON.stringify(datosIniciales.reportes || [])),
    notificaciones: JSON.parse(JSON.stringify(datosIniciales.notificaciones || [])),
    calificaciones: JSON.parse(JSON.stringify(datosIniciales.calificaciones || []))
  };

  guardarBaseDeDatos(db);
  return db;
}

export function guardarBaseDeDatos(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error("No se pudo guardar la base de datos simulada:", err);
  }
}

export function reiniciarBaseDeDatos() {
  localStorage.removeItem(STORAGE_KEY);
  return obtenerBaseDeDatos();
}

// Obtener usuario actualmente autenticado desde localStorage
function obtenerUsuarioActual() {
  try {
    const raw = localStorage.getItem("sesion");
    if (!raw) return null;
    const sesion = JSON.parse(raw);
    const db = obtenerBaseDeDatos();
    return db.usuarios.find(
      (u) =>
        u.correo_electronico === sesion.correo_electronico ||
        `${u.nombre} ${u.apellido}` === sesion.nombre ||
        u.rol === sesion.rol
    ) || db.usuarios[0];
  } catch {
    return null;
  }
}

// Formatear ticket para respuesta de API
function formatearTicket(t, db) {
  const clienteUser = db.usuarios.find((u) => u.id_usuario === t.id_cliente);
  const tecnicoUser = db.usuarios.find((u) => u.id_usuario === t.id_tecnico);
  const equipoObj = db.equipos.find((e) => e.id_equipo === t.id_equipo);

  // Categorías asociadas
  const relCats = db.ticketCategorias.filter((tc) => tc.id_ticket === t.id_ticket);
  const cats = relCats.map((tc) => {
    const cat = db.categorias.find((c) => c.id_categoria === tc.id_categoria);
    return {
      id_categoria: tc.id_categoria,
      nombre_categoria: cat ? cat.nombre_categoria : `Categoría #${tc.id_categoria}`
    };
  });

  // Reporte y calificación solo aplican a tickets que ya fueron resueltos o cerrados
  const esResueltoOCerrado = t.estado === "Resuelto" || t.estado === "Cerrado";
  const rep = esResueltoOCerrado ? (db.reportes.find((r) => r.id_ticket === t.id_ticket) || null) : null;
  const cal = esResueltoOCerrado ? (db.calificaciones.find((c) => c.id_ticket === t.id_ticket) || null) : null;

  return {
    ...t,
    codigo: `TKT-${t.id_ticket}`,
    cliente_nombre: clienteUser ? `${clienteUser.nombre} ${clienteUser.apellido}` : `Cliente #${t.id_cliente}`,
    tecnico_nombre: tecnicoUser ? `${tecnicoUser.nombre} ${tecnicoUser.apellido}` : null,
    equipo: equipoObj ? `${equipoObj.marca} ${equipoObj.modelo}` : "Sin equipo asociado",
    equipo_objeto: equipoObj ? { ...equipoObj } : null,
    categorias: cats,
    reporte: rep,
    calificacion: cal
  };
}

/**
 * Despachador principal que intercepta y responde como si fuera la API de FastAPI
 */
export async function despacharPeticionMock(config) {
  const db = obtenerBaseDeDatos();
  const metodo = (config.method || "get").toLowerCase();
  let url = config.url || "";

  // Limpiar prefijo base
  url = url.replace(/^https?:\/\/[^/]+/, "");
  url = url.replace(/^\/?api\/v1\/?/, "/");
  if (!url.startsWith("/")) url = "/" + url;

  const urlObj = new URL("http://localhost" + url);
  const pathname = urlObj.pathname;
  const params = config.params || {};

  let body = {};
  if (config.data) {
    try {
      body = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
    } catch {
      body = config.data;
    }
  }

  // --------------------------------------------------------------------------
  // 1. AUTENTICACIÓN
  // --------------------------------------------------------------------------
  if (pathname === "/auth/login" && metodo === "post") {
    const { correo_electronico, contrasena } = body;
    const usuario = db.usuarios.find(
      (u) => u.correo_electronico?.toLowerCase() === (correo_electronico || "").toLowerCase().trim()
    );

    if (!usuario || usuario.contrasena !== contrasena) {
      const err = new Error("Correo o contraseña incorrectos");
      err.response = { status: 401, data: { detail: "Correo o contraseña incorrectos" } };
      throw err;
    }

    if (usuario.estado && usuario.estado !== "Activo") {
      const err = new Error("Tu cuenta está inactiva. Habla con el administrador");
      err.response = { status: 403, data: { detail: "Tu cuenta está inactiva. Habla con el administrador" } };
      throw err;
    }

    const respuesta = {
      access_token: `mock-token-${usuario.id_usuario}-${Date.now()}`,
      refresh_token: `mock-refresh-${usuario.id_usuario}-${Date.now()}`,
      token_type: "bearer",
      rol: usuario.rol,
      nombre: `${usuario.nombre} ${usuario.apellido}`,
      id_usuario: usuario.id_usuario,
      correo_electronico: usuario.correo_electronico
    };

    return { data: respuesta, status: 200 };
  }

  if (pathname === "/auth/me") {
    const usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) {
      const err = new Error("No autenticado");
      err.response = { status: 401, data: { detail: "No autenticado" } };
      throw err;
    }

    if (metodo === "get") {
      const clienteDetalle = db.clientes.find((c) => c.id_usuario === usuarioActual.id_usuario) || {};
      const respuesta = {
        id_usuario: usuarioActual.id_usuario,
        nombre: usuarioActual.nombre,
        apellido: usuarioActual.apellido,
        correo_electronico: usuarioActual.correo_electronico,
        rol: usuarioActual.rol,
        telefono: clienteDetalle.telefono || "3101234567",
        direccion: clienteDetalle.direccion || "Calle 10 # 5-20",
        area_departamento: clienteDetalle.area_departamento || "Administración"
      };
      return { data: respuesta, status: 200 };
    }

    if (metodo === "put") {
      if (body.nombre) usuarioActual.nombre = body.nombre;
      if (body.apellido) usuarioActual.apellido = body.apellido;

      let clienteDetalle = db.clientes.find((c) => c.id_usuario === usuarioActual.id_usuario);
      if (!clienteDetalle) {
        clienteDetalle = { id_usuario: usuarioActual.id_usuario };
        db.clientes.push(clienteDetalle);
      }
      if (body.telefono !== undefined) clienteDetalle.telefono = body.telefono;
      if (body.direccion !== undefined) clienteDetalle.direccion = body.direccion;
      if (body.area_departamento !== undefined) clienteDetalle.area_departamento = body.area_departamento;

      guardarBaseDeDatos(db);

      return {
        data: {
          id_usuario: usuarioActual.id_usuario,
          nombre: usuarioActual.nombre,
          apellido: usuarioActual.apellido,
          correo_electronico: usuarioActual.correo_electronico,
          rol: usuarioActual.rol,
          telefono: clienteDetalle.telefono,
          direccion: clienteDetalle.direccion,
          area_departamento: clienteDetalle.area_departamento
        },
        status: 200
      };
    }
  }

  if (pathname === "/auth/register" && metodo === "post") {
    const nuevoId = Math.max(...db.usuarios.map((u) => u.id_usuario), 0) + 1;
    const nuevoUsuario = {
      id_usuario: nuevoId,
      nombre: body.nombre,
      apellido: body.apellido,
      correo_electronico: body.correo_electronico,
      contrasena: body.contrasena || "Prueba123*",
      rol: "Cliente",
      fecha_registro: new Date().toISOString().substring(0, 10),
      estado: "Activo"
    };
    db.usuarios.push(nuevoUsuario);

    db.clientes.push({
      id_usuario: nuevoId,
      telefono: body.telefono || "3000000000",
      direccion: body.direccion || "Dirección registrada",
      area_departamento: body.area_departamento || "General"
    });

    guardarBaseDeDatos(db);

    return {
      data: {
        access_token: `mock-token-${nuevoId}`,
        refresh_token: `mock-refresh-${nuevoId}`,
        token_type: "bearer",
        rol: "Cliente",
        nombre: `${nuevoUsuario.nombre} ${nuevoUsuario.apellido}`
      },
      status: 201
    };
  }

  if (pathname === "/auth/recuperar" && metodo === "post") {
    return {
      data: { detail: `Instrucciones enviadas exitosamente a ${body.correo_electronico || "tu correo"}` },
      status: 200
    };
  }

  if (pathname === "/auth/restablecer" && metodo === "post") {
    return { data: { detail: "Contraseña actualizada exitosamente" }, status: 200 };
  }

  // --------------------------------------------------------------------------
  // 2. TICKETS
  // --------------------------------------------------------------------------
  if (pathname === "/tickets" && metodo === "get") {
    const usuarioActual = obtenerUsuarioActual();
    let lista = [...db.tickets];

    // Filtrado por rol según sesión
    if (usuarioActual?.rol === "Cliente") {
      lista = lista.filter((t) => t.id_cliente === usuarioActual.id_usuario);
    } else if (usuarioActual?.rol === "Tecnico" && !params.todos) {
      if (params.id_tecnico) {
        lista = lista.filter((t) => t.id_tecnico === Number(params.id_tecnico));
      } else {
        // En vista técnico por defecto se muestran los asignados a él
        lista = lista.filter((t) => t.id_tecnico === usuarioActual.id_usuario);
      }
    }

    if (params.estado) {
      lista = lista.filter((t) => t.estado?.toLowerCase() === params.estado.toLowerCase());
    }
    if (params.prioridad && params.prioridad !== "TODAS") {
      lista = lista.filter((t) => t.prioridad?.toLowerCase() === params.prioridad.toLowerCase());
    }
    if (params.id_tecnico && usuarioActual?.rol !== "Tecnico") {
      lista = lista.filter((t) => t.id_tecnico === Number(params.id_tecnico));
    }

    const resultado = lista.map((t) => formatearTicket(t, db));
    return { data: resultado, status: 200 };
  }

  // Crear ticket
  if (pathname === "/tickets" && metodo === "post") {
    const usuarioActual = obtenerUsuarioActual();
    const nuevoId = Math.max(...db.tickets.map((t) => t.id_ticket), 0) + 1;
    const nuevoTicket = {
      id_ticket: nuevoId,
      titulo: body.titulo,
      descripcion: body.descripcion,
      modalidad: body.modalidad || "Presencial",
      fecha_creacion: new Date().toISOString().replace("T", " ").substring(0, 19),
      fecha_resolucion: null,
      fecha_cierre: null,
      prioridad: body.prioridad || "Media",
      estado: "Abierto",
      id_cliente: usuarioActual?.id_usuario || 5,
      id_tecnico: null,
      id_asignado_por: null,
      id_equipo: body.id_equipo ? Number(body.id_equipo) : null
    };

    db.tickets.unshift(nuevoTicket);

    // Asociar categorías
    const cats = body.categorias || body.categorias_ids || [];
    cats.forEach((catId) => {
      db.ticketCategorias.push({
        id_ticket: nuevoId,
        id_categoria: Number(catId)
      });
    });

    // Registrar historial de creación
    db.historial.push({
      id_historial: db.historial.length + 1,
      id_ticket: nuevoId,
      tipo_accion: "Creacion",
      estado_anterior: null,
      estado_nuevo: "Abierto",
      fecha_accion: nuevoTicket.fecha_creacion,
      id_usuario: nuevoTicket.id_cliente,
      detalles: `Ticket creado por ${usuarioActual?.nombre || "Cliente"} desde el portal web`
    });

    guardarBaseDeDatos(db);
    return { data: formatearTicket(nuevoTicket, db), status: 201 };
  }

  // Detalle de ticket individual / Actualización de ticket
  const matchTicketId = pathname.match(/^\/tickets\/(\d+)$/);
  if (matchTicketId) {
    const ticketId = Number(matchTicketId[1]);
    const ticket = db.tickets.find((t) => t.id_ticket === ticketId);
    if (!ticket) {
      const err = new Error("Ticket no encontrado");
      err.response = { status: 404, data: { detail: "Ticket no encontrado" } };
      throw err;
    }
    if (metodo === "get") {
      return { data: formatearTicket(ticket, db), status: 200 };
    }
    if (metodo === "patch" || metodo === "put") {
      const usuarioActual = obtenerUsuarioActual();
      if (body.id_equipo !== undefined) {
        ticket.id_equipo = body.id_equipo ? Number(body.id_equipo) : null;
        const eq = db.equipos.find((e) => e.id_equipo === ticket.id_equipo);
        db.historial.push({
          id_historial: db.historial.length + 1,
          id_ticket: ticketId,
          tipo_accion: "Actualizacion",
          estado_anterior: ticket.estado,
          estado_nuevo: ticket.estado,
          fecha_accion: new Date().toISOString().replace("T", " ").substring(0, 19),
          id_usuario: usuarioActual?.id_usuario || 2,
          detalles: eq
            ? `Equipo vinculado al ticket: ${eq.tipo || "Equipo"} ${eq.marca} ${eq.modelo} (${eq.serial})`
            : "Equipo desvinculado del ticket"
        });
      }
      if (body.titulo) ticket.titulo = body.titulo;
      if (body.descripcion) ticket.descripcion = body.descripcion;
      if (body.prioridad) ticket.prioridad = body.prioridad;
      if (body.modalidad) ticket.modalidad = body.modalidad;
      guardarBaseDeDatos(db);
      return { data: formatearTicket(ticket, db), status: 200 };
    }
  }

  // Historial de un ticket
  const matchHistorial = pathname.match(/^\/tickets\/(\d+)\/historial$/);
  if (matchHistorial) {
    const ticketId = Number(matchHistorial[1]);
    if (metodo === "get") {
      const items = db.historial
        .filter((h) => h.id_ticket === ticketId)
        .map((h) => {
          const u = db.usuarios.find((user) => user.id_usuario === h.id_usuario);
          return {
            ...h,
            usuario_nombre: u ? `${u.nombre} ${u.apellido}` : `Usuario #${h.id_usuario}`
          };
        });
      return { data: items, status: 200 };
    }
    if (metodo === "post") {
      const usuarioActual = obtenerUsuarioActual();
      const nuevoHist = {
        id_historial: db.historial.length + 1,
        id_ticket: ticketId,
        tipo_accion: body.tipo_accion || "Actualizacion",
        estado_anterior: body.estado_anterior || null,
        estado_nuevo: body.estado_nuevo || "En_Proceso",
        fecha_accion: new Date().toISOString().replace("T", " ").substring(0, 19),
        id_usuario: usuarioActual?.id_usuario || 2,
        detalles: body.detalles || "Avance registrado por el técnico"
      };
      db.historial.push(nuevoHist);

      // Si cambia estado
      if (body.estado_nuevo) {
        const t = db.tickets.find((tick) => tick.id_ticket === ticketId);
        if (t) t.estado = body.estado_nuevo;
      }

      guardarBaseDeDatos(db);
      return { data: nuevoHist, status: 201 };
    }
  }

  // Comentarios de un ticket
  const matchComentarios = pathname.match(/^\/tickets\/(\d+)\/comentarios$/);
  if (matchComentarios) {
    const ticketId = Number(matchComentarios[1]);
    if (metodo === "get") {
      const usuarioActual = obtenerUsuarioActual();
      let coms = db.comentarios.filter((c) => c.id_ticket === ticketId);
      // Ocultar notas internas si el rol es Cliente
      if (usuarioActual?.rol === "Cliente") {
        coms = coms.filter((c) => !c.es_nota_interna);
      }
      const data = coms.map((c) => {
        const u = db.usuarios.find((user) => user.id_usuario === c.id_usuario);
        return {
          ...c,
          usuario_nombre: u ? `${u.nombre} ${u.apellido}` : `Usuario #${c.id_usuario}`,
          rol: u ? u.rol : "Usuario"
        };
      });
      return { data, status: 200 };
    }
    if (metodo === "post") {
      const usuarioActual = obtenerUsuarioActual();
      const nuevoCom = {
        id_comentario: db.comentarios.length + 1,
        id_ticket: ticketId,
        id_usuario: usuarioActual?.id_usuario || 5,
        contenido: body.contenido,
        es_nota_interna: Boolean(body.es_nota_interna),
        fecha_creacion: new Date().toISOString().replace("T", " ").substring(0, 19)
      };
      db.comentarios.push(nuevoCom);
      guardarBaseDeDatos(db);
      return {
        data: {
          ...nuevoCom,
          usuario_nombre: usuarioActual ? `${usuarioActual.nombre} ${usuarioActual.apellido}` : "Usuario",
          rol: usuarioActual ? usuarioActual.rol : "Cliente"
        },
        status: 201
      };
    }
  }

  // Cambio de estado
  const matchEstado = pathname.match(/^\/tickets\/(\d+)\/estado$/);
  if (matchEstado && (metodo === "patch" || metodo === "put")) {
    const ticketId = Number(matchEstado[1]);
    const t = db.tickets.find((tick) => tick.id_ticket === ticketId);
    if (t) {
      t.estado = body.estado_nuevo || body.estado;
      if (t.estado === "Resuelto") {
        t.fecha_resolucion = new Date().toISOString().replace("T", " ").substring(0, 19);
      }
      if (t.estado === "Cerrado") {
        t.fecha_cierre = new Date().toISOString().replace("T", " ").substring(0, 19);
      }
      guardarBaseDeDatos(db);
      return { data: { mensaje: `Estado actualizado a ${t.estado}` }, status: 200 };
    }
  }

  // Asignar técnico (Vista Admin)
  const matchAsignar = pathname.match(/^\/tickets\/(\d+)\/asignar$/);
  if (matchAsignar && (metodo === "patch" || metodo === "post")) {
    const ticketId = Number(matchAsignar[1]);
    const t = db.tickets.find((tick) => tick.id_ticket === ticketId);
    if (t) {
      t.id_tecnico = Number(body.id_tecnico);
      t.id_asignado_por = 1;
      if (body.prioridad) t.prioridad = body.prioridad;
      t.estado = "En_Proceso";

      const tec = db.usuarios.find((u) => u.id_usuario === t.id_tecnico);
      db.historial.push({
        id_historial: db.historial.length + 1,
        id_ticket: ticketId,
        tipo_accion: "Asignacion",
        estado_anterior: "Abierto",
        estado_nuevo: "En_Proceso",
        fecha_accion: new Date().toISOString().replace("T", " ").substring(0, 19),
        id_usuario: 1,
        detalles: `Asignado al técnico ${tec ? tec.nombre + " " + tec.apellido : "ID " + t.id_tecnico}`
      });

      guardarBaseDeDatos(db);
      return { data: formatearTicket(t, db), status: 200 };
    }
  }

  // Calificación de ticket
  const matchCalificacion = pathname.match(/^\/tickets\/(\d+)\/calificacion$/);
  if (matchCalificacion && metodo === "post") {
    const ticketId = Number(matchCalificacion[1]);
    const t = db.tickets.find((tick) => tick.id_ticket === ticketId);
    const usuarioActual = obtenerUsuarioActual();

    const nuevaCal = {
      id_calificacion: db.calificaciones.length + 1,
      id_ticket: ticketId,
      id_cliente: usuarioActual?.id_usuario || t?.id_cliente || 5,
      id_tecnico: t?.id_tecnico || 2,
      puntuacion: Number(body.puntuacion),
      comentario: body.comentario || null,
      fecha_calificacion: new Date().toISOString().replace("T", " ").substring(0, 19)
    };
    db.calificaciones.push(nuevaCal);

    if (t) {
      t.estado = "Cerrado";
      t.fecha_cierre = nuevaCal.fecha_calificacion;
    }

    guardarBaseDeDatos(db);
    return { data: nuevaCal, status: 201 };
  }

  // Reporte de solución técnica (Técnico resuelve ticket)
  const matchReporte = pathname.match(/^\/tickets\/(\d+)\/reporte$/);
  if (matchReporte && metodo === "post") {
    const ticketId = Number(matchReporte[1]);
    const t = db.tickets.find((tick) => tick.id_ticket === ticketId);
    const usuarioActual = obtenerUsuarioActual();

    const nuevoReporte = {
      id_reporte: db.reportes.length + 1,
      id_ticket: ticketId,
      id_tecnico: usuarioActual?.id_usuario || t?.id_tecnico || 2,
      solucion_aplicada: body.solucion_aplicada || "Solución técnica aplicada exitosamente.",
      fecha_reporte: new Date().toISOString().replace("T", " ").substring(0, 19),
      estado: "Aprobado"
    };

    // Actualizar o añadir reporte
    const idxRep = db.reportes.findIndex((r) => r.id_ticket === ticketId);
    if (idxRep >= 0) {
      db.reportes[idxRep] = nuevoReporte;
    } else {
      db.reportes.push(nuevoReporte);
    }

    if (t) {
      t.estado = "Resuelto";
      t.fecha_resolucion = nuevoReporte.fecha_reporte;

      db.historial.push({
        id_historial: db.historial.length + 1,
        id_ticket: ticketId,
        tipo_accion: "Resolucion",
        estado_anterior: "En_Proceso",
        estado_nuevo: "Resuelto",
        fecha_accion: nuevoReporte.fecha_reporte,
        id_usuario: nuevoReporte.id_tecnico,
        detalles: nuevoReporte.solucion_aplicada
      });
    }

    guardarBaseDeDatos(db);
    return { data: nuevoReporte, status: 201 };
  }

  // Archivos adjuntos de tickets
  const matchAdjuntos = pathname.match(/^\/tickets\/(\d+)\/adjuntos$/);
  if (matchAdjuntos) {
    const ticketId = Number(matchAdjuntos[1]);
    if (metodo === "get") {
      const items = db.adjuntos.filter((a) => a.id_ticket === ticketId);
      return { data: items, status: 200 };
    }
    if (metodo === "post") {
      const usuarioActual = obtenerUsuarioActual();
      let nombreArch = "evidencia_adjunta.png";
      let tipoMime = "image/png";
      let tamano = 102400;

      if (body instanceof FormData) {
        const file = body.get("archivo");
        if (file) {
          nombreArch = file.name || nombreArch;
          tipoMime = file.type || tipoMime;
          tamano = file.size || tamano;
        }
      }

      const nuevoAdj = {
        id_adjunto: db.adjuntos.length + 1,
        id_ticket: ticketId,
        id_usuario: usuarioActual?.id_usuario || 5,
        nombre_archivo: nombreArch,
        ruta_url: `/uploads/evidencias/${nombreArch}`,
        tipo_mime: tipoMime,
        tamano_bytes: tamano,
        fecha_subida: new Date().toISOString().replace("T", " ").substring(0, 19)
      };

      db.adjuntos.push(nuevoAdj);
      guardarBaseDeDatos(db);
      return { data: nuevoAdj, status: 201 };
    }
  }

  // Descargar archivo adjunto
  const matchDescargarAdj = pathname.match(/^\/tickets\/(\d+)\/adjuntos\/(\d+)\/descargar$/);
  if (matchDescargarAdj && metodo === "get") {
    const adjId = Number(matchDescargarAdj[2]);
    const adj = db.adjuntos.find((a) => a.id_adjunto === adjId);
    const contenido = `Evidencia simulada de Sistemas AR\nArchivo: ${adj ? adj.nombre_archivo : "adjunto.txt"}\nFecha: ${new Date().toISOString()}`;
    const blob = new Blob([contenido], { type: "text/plain" });
    return { data: blob, status: 200 };
  }

  // --------------------------------------------------------------------------
  // 3. EQUIPOS
  // --------------------------------------------------------------------------
  if (pathname === "/equipos") {
    if (metodo === "get") {
      const usuarioActual = obtenerUsuarioActual();
      let lista = [...db.equipos];
      if (params.id_cliente) {
        lista = lista.filter((e) => e.id_cliente === Number(params.id_cliente));
      } else if (usuarioActual?.rol === "Cliente") {
        lista = lista.filter((e) => e.id_cliente === usuarioActual.id_usuario);
      }
      return { data: lista, status: 200 };
    }
    if (metodo === "post") {
      const usuarioActual = obtenerUsuarioActual();
      const nuevoId = Math.max(...db.equipos.map((e) => e.id_equipo), 0) + 1;
      const nuevoEquipo = {
        id_equipo: nuevoId,
        tipo: body.tipo || "Computador",
        marca: body.marca,
        modelo: body.modelo,
        serial: body.serial,
        sistema_operativo: body.sistema_operativo || null,
        area_departamento: body.area_departamento || "General",
        id_cliente: body.id_cliente ? Number(body.id_cliente) : (usuarioActual?.id_usuario || 5),
        estado_equipo: body.estado_equipo || "Operativo"
      };
      db.equipos.push(nuevoEquipo);

      // Si se especificó vincular inmediatamente a un ticket
      if (body.id_ticket) {
        const ticketId = Number(body.id_ticket);
        const t = db.tickets.find((tick) => tick.id_ticket === ticketId);
        if (t) {
          t.id_equipo = nuevoId;
          db.historial.push({
            id_historial: db.historial.length + 1,
            id_ticket: ticketId,
            tipo_accion: "Actualizacion",
            estado_anterior: t.estado,
            estado_nuevo: t.estado,
            fecha_accion: new Date().toISOString().replace("T", " ").substring(0, 19),
            id_usuario: usuarioActual?.id_usuario || 2,
            detalles: `Equipo registrado y vinculado al ticket: ${nuevoEquipo.tipo} ${nuevoEquipo.marca} ${nuevoEquipo.modelo} (${nuevoEquipo.serial})`
          });
        }
      }

      guardarBaseDeDatos(db);
      return { data: nuevoEquipo, status: 201 };
    }
  }

  const matchEquipoId = pathname.match(/^\/equipos\/(\d+)$/);
  if (matchEquipoId && metodo === "put") {
    const eqId = Number(matchEquipoId[1]);
    const eq = db.equipos.find((e) => e.id_equipo === eqId);
    if (eq) {
      Object.assign(eq, body);
      guardarBaseDeDatos(db);
      return { data: eq, status: 200 };
    }
  }

  // --------------------------------------------------------------------------
  // 4. CATEGORÍAS
  // --------------------------------------------------------------------------
  if (pathname === "/categorias") {
    if (metodo === "get") {
      const catsConConteo = db.categorias.map((c) => {
        const total = db.ticketCategorias.filter((tc) => tc.id_categoria === c.id_categoria).length;
        return {
          ...c,
          total_tickets: total
        };
      });
      return { data: catsConConteo, status: 200 };
    }
    if (metodo === "post") {
      const nuevoId = Math.max(...db.categorias.map((c) => c.id_categoria), 0) + 1;
      const nuevaCat = {
        id_categoria: nuevoId,
        nombre_categoria: body.nombre_categoria,
        descripcion: body.descripcion || ""
      };
      db.categorias.push(nuevaCat);
      guardarBaseDeDatos(db);
      return { data: nuevaCat, status: 201 };
    }
  }

  const matchCategoriaId = pathname.match(/^\/categorias\/(\d+)$/);
  if (matchCategoriaId && metodo === "put") {
    const catId = Number(matchCategoriaId[1]);
    const c = db.categorias.find((item) => item.id_categoria === catId);
    if (c) {
      Object.assign(c, body);
      guardarBaseDeDatos(db);
      return { data: c, status: 200 };
    }
  }

  if (matchCategoriaId && metodo === "delete") {
    const catId = Number(matchCategoriaId[1]);
    const idx = db.categorias.findIndex((item) => item.id_categoria === catId);
    if (idx !== -1) {
      const eliminada = db.categorias.splice(idx, 1)[0];
      db.ticketCategorias = db.ticketCategorias.filter((tc) => tc.id_categoria !== catId);
      guardarBaseDeDatos(db);
      return { data: { mensaje: "Categoría eliminada correctamente", categoria: eliminada }, status: 200 };
    }
    return { data: { detail: "Categoría no encontrada" }, status: 404 };
  }

  // --------------------------------------------------------------------------
  // 5. TÉCNICOS
  // --------------------------------------------------------------------------
  if (pathname === "/tecnicos" && metodo === "get") {
    const tecnicosData = db.tecnicos.map((t) => {
      const u = db.usuarios.find((user) => user.id_usuario === t.id_usuario) || {};
      const ticketsEnProceso = db.tickets.filter(
        (tick) => tick.id_tecnico === t.id_usuario && tick.estado === "En_Proceso"
      ).length;

      return {
        id_usuario: t.id_usuario,
        nombre: u.nombre || "Técnico",
        apellido: u.apellido || "",
        correo_electronico: u.correo_electronico || "",
        especialidad: t.especialidad,
        disponibilidad: t.disponibilidad,
        tickets_en_proceso: ticketsEnProceso
      };
    });
    return { data: tecnicosData, status: 200 };
  }

  // --------------------------------------------------------------------------
  // 6. USUARIOS
  // --------------------------------------------------------------------------
  if (pathname === "/usuarios") {
    if (metodo === "get") {
      return { data: db.usuarios, status: 200 };
    }
    if (metodo === "post") {
      const nuevoId = Math.max(...db.usuarios.map((u) => u.id_usuario), 0) + 1;
      const nuevoUsuario = {
        id_usuario: nuevoId,
        nombre: body.nombre,
        apellido: body.apellido,
        correo_electronico: body.correo_electronico,
        contrasena: body.contrasena || "Prueba123*",
        rol: body.rol || "Cliente",
        fecha_registro: new Date().toISOString().substring(0, 10),
        estado: body.estado || "Activo"
      };
      db.usuarios.push(nuevoUsuario);

      if (nuevoUsuario.rol === "Cliente" && !db.clientes.some((c) => c.id_usuario === nuevoId)) {
        db.clientes.push({
          id_usuario: nuevoId,
          telefono: "3000000000",
          direccion: "Dirección principal",
          area_departamento: "General"
        });
      }
      if (nuevoUsuario.rol === "Tecnico" && !db.tecnicos.some((t) => t.id_usuario === nuevoId)) {
        db.tecnicos.push({
          id_usuario: nuevoId,
          especialidad: "Soporte General",
          disponibilidad: "Disponible"
        });
      }

      guardarBaseDeDatos(db);
      return { data: nuevoUsuario, status: 201 };
    }
  }

  const matchUsuarioId = pathname.match(/^\/usuarios\/(\d+)$/);
  if (matchUsuarioId && metodo === "put") {
    const uId = Number(matchUsuarioId[1]);
    const u = db.usuarios.find((user) => user.id_usuario === uId);
    if (u) {
      Object.assign(u, body);
      if (body.rol === "Tecnico" && !db.tecnicos.some((t) => t.id_usuario === uId)) {
        db.tecnicos.push({
          id_usuario: uId,
          especialidad: "Soporte General",
          disponibilidad: "Disponible"
        });
      }
      guardarBaseDeDatos(db);
      return { data: u, status: 200 };
    }
  }

  if (matchUsuarioId && metodo === "delete") {
    const uId = Number(matchUsuarioId[1]);
    const idx = db.usuarios.findIndex((user) => user.id_usuario === uId);
    if (idx !== -1) {
      const eliminado = db.usuarios.splice(idx, 1)[0];
      // Desvincular de roles específicos
      db.clientes = db.clientes.filter((c) => c.id_usuario !== uId);
      db.tecnicos = db.tecnicos.filter((t) => t.id_usuario !== uId);
      db.administradores = db.administradores.filter((a) => a.id_usuario !== uId);
      guardarBaseDeDatos(db);
      return { data: { mensaje: "Usuario eliminado correctamente", usuario: eliminado }, status: 200 };
    }
    return { data: { detail: "Usuario no encontrado" }, status: 404 };
  }

  // --------------------------------------------------------------------------
  // 7. REPORTES Y ESTADÍSTICAS
  // --------------------------------------------------------------------------
  if (pathname === "/reportes/estado_general" && metodo === "get") {
    const total = db.tickets.length;
    const abiertos = db.tickets.filter((t) => t.estado === "Abierto").length;
    const enProceso = db.tickets.filter((t) => t.estado === "En_Proceso").length;
    const resueltos = db.tickets.filter((t) => t.estado === "Resuelto").length;
    const cerrados = db.tickets.filter((t) => t.estado === "Cerrado").length;
    const tecnicosActivos = db.tecnicos.filter((t) => t.disponibilidad !== "Fuera_de_Servicio").length;

    return {
      data: {
        tickets_totales: total,
        abiertos,
        en_proceso: enProceso,
        resueltos,
        cerrados,
        tecnicos_activos: tecnicosActivos,
        serie_semanal: [
          { semana: "Semana 1", abiertos: 3, cerrados: 2 },
          { semana: "Semana 2", abiertos: 4, cerrados: 3 },
          { semana: "Semana 3", abiertos: 2, cerrados: 4 },
          { semana: "Semana 4", abiertos: abiertos, cerrados: cerrados }
        ]
      },
      status: 200
    };
  }

  // Exportación de reportes (Excel / PDF)
  const matchExportar = pathname.match(/^\/reportes\/([^/]+)\/exportar$/);
  if (matchExportar && metodo === "get") {
    const tipoInforme = matchExportar[1];
    const formato = (params.formato || "excel").toLowerCase();
    const esExcel = formato === "excel" || formato === "xlsx";

    // Generar contenido CSV / Texto estructurado para la descarga
    const lineas = [
      `REPORTE DE SISTEMAS AR - ${tipoInforme.toUpperCase()}`,
      `Generado el: ${new Date().toLocaleString()}`,
      "",
      "ID Ticket,Titulo,Cliente,Tecnico,Estado,Prioridad,Fecha Creacion,Fecha Resolucion"
    ];

    db.tickets.forEach((t) => {
      const cli = db.usuarios.find((u) => u.id_usuario === t.id_cliente);
      const tec = db.usuarios.find((u) => u.id_usuario === t.id_tecnico);
      lineas.push(
        `#${t.id_ticket},"${t.titulo.replace(/"/g, '""')}","${cli ? cli.nombre + " " + cli.apellido : "Cliente"}","${tec ? tec.nombre + " " + tec.apellido : "Sin asignar"}",${t.estado},${t.prioridad},"${t.fecha_creacion}","${t.fecha_resolucion || "-"}"`
      );
    });

    const contenido = lineas.join("\n");
    const tipoMime = esExcel
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : "application/pdf";
    const blob = new Blob([contenido], { type: tipoMime });

    return { data: blob, status: 200 };
  }

  // Reportes por tipo (por_agente, incidencias_area_categoria, etc.)
  const matchTipoReporte = pathname.match(/^\/reportes\/([^/]+)$/);
  if (matchTipoReporte && metodo === "get") {
    return {
      data: {
        tipo: matchTipoReporte[1],
        total_tickets: db.tickets.length,
        resueltos: db.tickets.filter((t) => t.estado === "Resuelto" || t.estado === "Cerrado").length,
        pendientes: db.tickets.filter((t) => t.estado === "Abierto" || t.estado === "En_Proceso").length
      },
      status: 200
    };
  }

  // Calificaciones
  if (pathname === "/calificaciones" && metodo === "get") {
    let lista = db.calificaciones.map((cal) => {
      const cli = db.usuarios.find((u) => u.id_usuario === cal.id_cliente);
      const tec = db.usuarios.find((u) => u.id_usuario === cal.id_tecnico);
      const tick = db.tickets.find((t) => t.id_ticket === cal.id_ticket);

      return {
        id_calificacion: cal.id_calificacion,
        id_ticket: cal.id_ticket,
        puntuacion: cal.puntuacion,
        comentario: cal.comentario,
        fecha_calificacion: cal.fecha_calificacion,
        id_tecnico: cal.id_tecnico,
        id_cliente: cal.id_cliente,
        cliente_nombre: cli ? `${cli.nombre} ${cli.apellido}` : `Cliente #${cal.id_cliente}`,
        tecnico_nombre: tec ? `${tec.nombre} ${tec.apellido}` : `Técnico #${cal.id_tecnico}`,
        titulo_ticket: tick ? tick.titulo : `Ticket #${cal.id_ticket}`
      };
    });

    if (params.id_tecnico && params.id_tecnico !== "todos" && !isNaN(Number(params.id_tecnico))) {
      lista = lista.filter((c) => c.id_tecnico === Number(params.id_tecnico));
    }
    if (params.tecnico && params.tecnico !== "todos") {
      const valor = String(params.tecnico).trim().toLowerCase();
      lista = lista.filter((c) => {
        const coincideId = String(c.id_tecnico) === valor;
        const coincideNombre = c.tecnico_nombre && c.tecnico_nombre.toLowerCase().includes(valor);
        return coincideId || coincideNombre;
      });
    }
    if (params.tecnico_nombre && params.tecnico_nombre !== "todos") {
      const valor = String(params.tecnico_nombre).trim().toLowerCase();
      lista = lista.filter((c) => c.tecnico_nombre && c.tecnico_nombre.toLowerCase().includes(valor));
    }
    if (params.puntuacion && params.puntuacion !== "todos") {
      lista = lista.filter((c) => c.puntuacion === Number(params.puntuacion));
    }
    if (params.desde) {
      lista = lista.filter((c) => c.fecha_calificacion >= params.desde);
    }
    if (params.hasta) {
      lista = lista.filter((c) => c.fecha_calificacion <= params.hasta);
    }

    return { data: lista, status: 200 };
  }

  // Notificaciones
  if (pathname === "/notificaciones" && metodo === "get") {
    return { data: db.notificaciones, status: 200 };
  }

  if (pathname === "/notificaciones" && metodo === "delete") {
    db.notificaciones = [];
    guardarBaseDeDatos(db);
    return { data: { mensaje: "Todas las notificaciones han sido eliminadas" }, status: 200 };
  }

  if (pathname === "/notificaciones/todas-leidas" && metodo === "patch") {
    db.notificaciones.forEach((n) => {
      n.leida = true;
    });
    guardarBaseDeDatos(db);
    return { data: { mensaje: "Todas las notificaciones marcadas como leídas" }, status: 200 };
  }

  const matchNotifLeida = pathname.match(/^\/notificaciones\/(\d+)\/leida$/);
  if (matchNotifLeida && metodo === "patch") {
    const notifId = Number(matchNotifLeida[1]);
    const notif = db.notificaciones.find((n) => n.id_notificacion === notifId);
    if (notif) notif.leida = true;
    guardarBaseDeDatos(db);
    return { data: { mensaje: "Notificación leída" }, status: 200 };
  }

  const matchNotifDelete = pathname.match(/^\/notificaciones\/(\d+)$/);
  if (matchNotifDelete && metodo === "delete") {
    const notifId = Number(matchNotifDelete[1]);
    const idx = db.notificaciones.findIndex((n) => n.id_notificacion === notifId);
    if (idx !== -1) {
      const eliminada = db.notificaciones.splice(idx, 1)[0];
      guardarBaseDeDatos(db);
      return { data: { mensaje: "Notificación eliminada correctamente", notificacion: eliminada }, status: 200 };
    }
    return { data: { detail: "Notificación no encontrada" }, status: 404 };
  }

  // Fallback genérico para cualquier otro endpoint
  return { data: [], status: 200 };
}
