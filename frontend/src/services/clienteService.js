import { cliente } from "../api/client";

// === VISTA 4: DASHBOARD ===
export async function obtenerDashboardCliente() {
  const { data: misTickets } = await cliente.get("/tickets");

  const resumen = {
    total: misTickets.length,
    abiertos: misTickets.filter((t) => t.estado === "Abierto").length,
    enProceso: misTickets.filter((t) => t.estado === "En_Proceso").length,
    resueltos: misTickets.filter((t) => t.estado === "Resuelto").length,
    cerrados: misTickets.filter((t) => t.estado === "Cerrado").length,
  };

  const ticketsRecientes = misTickets.slice(0, 5).map((t) => ({
    ...t,
    nombre_equipo: t.equipo || "Sin equipo asignado",
  }));

  return { resumen, ticketsRecientes };
}

// === VISTA 9: PERFIL DEL CLIENTE ===
export async function obtenerPerfilCliente() {
  const { data } = await cliente.get("/auth/me");
  return data;
}

export async function actualizarPerfilCliente(datos) {
  const { data } = await cliente.put("/auth/me", datos);
  return data;
}

export async function obtenerEquiposCliente() {
  const { data } = await cliente.get("/equipos");
  return data;
}

export async function crearEquipoCliente(datos) {
  const { data } = await cliente.post("/equipos", datos);
  return data;
}

export async function actualizarEquipoCliente(idEquipo, datos) {
  const { data } = await cliente.put(`/equipos/${idEquipo}`, datos);
  return data;
}
