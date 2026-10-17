import { cliente } from "../api/client";

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

export async function marcarTodasNotificacionesLeidas() {
    const { data } = await cliente.patch("/notificaciones/todas-leidas");
    return data;
}

export async function eliminarNotificacion(idNotificacion) {
    const { data } = await cliente.delete(`/notificaciones/${idNotificacion}`);
    return data;
}

export async function eliminarTodasNotificaciones() {
    const { data } = await cliente.delete("/notificaciones");
    return data;
}

export async function exportarReporte(tipoInforme, formato = "excel", { desde, hasta } = {}) {
    const params = { formato };
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;

    try {
        const respuesta = await cliente.get(`/reportes/${tipoInforme}/exportar`, {
            params,
            responseType: "blob",
        });

        const esExcel = formato === "excel" || formato === "xlsx";
        const tipoMime = esExcel
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/pdf";
        const extension = esExcel ? "xlsx" : "pdf";

        const blob = new Blob([respuesta.data], { type: tipoMime });
        const blobUrl = window.URL.createObjectURL(blob);

        const enlace = document.createElement("a");
        enlace.href = blobUrl;
        enlace.setAttribute("download", `reporte_${tipoInforme}_${new Date().toISOString().slice(0, 10)}.${extension}`);
        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();

        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Error al exportar el reporte");
    }
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
        const horas = t.fecha_resolucion
            ? Math.max(0, Math.round(((new Date(t.fecha_resolucion) - new Date(t.fecha_creacion)) / 3600000) * 10) / 10)
            : 0;

        return {
            id: t.id_ticket,
            titulo: t.titulo,
            categorias: catsNombres,
            cliente: t.cliente_nombre || "-",
            tecnico: t.tecnico_nombre || "-",
            horas: horas,
        };
    });

    const sumaHoras = detalle.reduce((s, d) => s + (d.horas || 0), 0);

    return {
        resueltos: detalle.length,
        tiempoPromedio: detalle.length ? (sumaHoras / detalle.length).toFixed(1) : "0.0",
        porCategoria,
        detalle,
    };
}