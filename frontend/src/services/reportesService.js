import { cliente } from "../api/client";

const DIA = 86400000;

export async function listarTecnicos() {
    try {
        const { data } = await cliente.get("/tecnicos");
        return data.map((t) => ({
            id_usuario: t.id_usuario,
            nombre: t.nombre,
            apellido: t.apellido,
            especialidad: t.especialidad,
        }));
    } catch {
        return [];
    }
}

export async function obtenerReporte(tipoInforme, { desde, hasta } = {}) {
    const params = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    const { data } = await cliente.get(`/reportes/${tipoInforme}`, { params });
    return data;
}

export async function obtenerNotificaciones() {
    const { data } = await cliente.get("/notificaciones");
    return data;
}

export async function marcarNotificacionLeida(idNotificacion) {
    const { data } = await cliente.patch(`/notificaciones/${idNotificacion}/leida`);
    return data;
}

export async function generarReporte({ idTecnico, desde, hasta }) {
    // Consultamos los tickets reales mediante la API
    const params = {};
    if (idTecnico && idTecnico !== "todos") {
        params.id_tecnico = Number(idTecnico);
    }
    const { data: tickets } = await cliente.get("/tickets", { params });

    const cerrados = (tickets || []).filter((t) => {
        const esCerrado = t.estado === "Cerrado" || t.estado === "Resuelto";
        const fCreacion = (t.fecha_creacion || "").substring(0, 10);
        const cumpleDesde = !desde || fCreacion >= desde;
        const cumpleHasta = !hasta || fCreacion <= hasta;
        return esCerrado && cumpleDesde && cumpleHasta;
    });

    const porCategoria = {};
    cerrados.forEach((t) => {
        const cats = t.categorias || [];
        if (cats.length === 0) {
            porCategoria["General"] = (porCategoria["General"] || 0) + 1;
        } else {
            cats.forEach((c) => {
                const nombre = typeof c === "string" ? c : c.nombre_categoria || "General";
                porCategoria[nombre] = (porCategoria[nombre] || 0) + 1;
            });
        }
    });

    const detalle = cerrados.map((t) => {
        const catsNombres = (t.categorias || []).map((c) => (typeof c === "string" ? c : c.nombre_categoria)).join(", ") || "General";
        const dias = t.fecha_resolucion
            ? Math.max(0, Math.round((new Date(t.fecha_resolucion) - new Date(t.fecha_creacion)) / DIA))
            : 0;

        return {
            id: t.id_ticket,
            titulo: t.titulo,
            categorias: catsNombres,
            cliente: t.cliente_nombre || "-",
            tecnico: t.tecnico_nombre || "-",
            dias: dias,
        };
    });

    const sumaDias = detalle.reduce((s, d) => s + (d.dias || 0), 0);

    return {
        resueltos: detalle.length,
        tiempoPromedio: detalle.length ? (sumaDias / detalle.length).toFixed(1) : "0.0",
        porCategoria,
        detalle,
    };
}