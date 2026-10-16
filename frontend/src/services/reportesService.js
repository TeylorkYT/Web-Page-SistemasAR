import { tickets, usuarios, categorias } from "../data/datosFalsos";

const DIA = 86400000;

function nombreUsuario(id) {
    const u = usuarios.find((x) => x.id_usuario === id);
    return u ? `${u.nombre} ${u.apellido}` : "-";
}

function nombreCategoria(id) {
    const c = categorias.find((x) => x.id_categoria === id);
    return c ? c.nombre_categoria : "Otra";
}

export async function listarTecnicos() {
    return usuarios.filter((u) => u.rol === "Tecnico");
}

export async function generarReporte({ idTecnico, desde, hasta }) {
    const cerrados = tickets.filter(
        (t) =>
            t.estado === "Cerrado" &&
            (idTecnico === "todos" || t.id_tecnico === Number(idTecnico)) &&
            (!desde || t.fecha_creacion >= desde) &&
            (!hasta || t.fecha_creacion <= hasta)
    );

    const porCategoria = {};
    cerrados.forEach((t) =>
        t.categorias_ids.forEach((id) => {
            const nombre = nombreCategoria(id);
            porCategoria[nombre] = (porCategoria[nombre] || 0) + 1;
        })
    );

    const detalle = cerrados.map((t) => ({
        id: t.id_ticket,
        titulo: t.titulo,
        categorias: t.categorias_ids.map((id) => nombreCategoria(id)).join(", "),
        cliente: nombreUsuario(t.id_cliente),
        tecnico: nombreUsuario(t.id_tecnico),
        dias: t.fecha_resolucion
            ? Math.round((new Date(t.fecha_resolucion) - new Date(t.fecha_creacion)) / DIA)
            : null,
    }));

    const conTiempo = detalle.filter((d) => d.dias !== null);
    const sumaDias = conTiempo.reduce((s, d) => s + d.dias, 0);

    return {
        resueltos: detalle.length,
        tiempoPromedio: conTiempo.length ? (sumaDias / conTiempo.length).toFixed(1) : "0.0",
        porCategoria,
        detalle,
    };
}