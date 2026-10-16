import { tickets, equipos, usuarios } from "../data/datosFalsos";

// === VISTA 4: DASHBOARD ===
export async function obtenerDashboardCliente(idCliente = 1) {
  const misTickets = tickets.filter(t => t.id_cliente === idCliente);
  
  const resumen = {
    total: misTickets.length,
    abiertos: misTickets.filter(t => t.estado === 'Abierto').length,
    enProceso: misTickets.filter(t => t.estado === 'En_Proceso').length,
    resueltos: misTickets.filter(t => t.estado === 'Resuelto').length,
    cerrados: misTickets.filter(t => t.estado === 'Cerrado').length,
  };

  const ticketsRecientes = misTickets.slice(0, 5).map(t => {
    const equipo = equipos.find(e => e.id_equipo === t.id_equipo);
    return {
      ...t,
      nombre_equipo: equipo ? `${equipo.marca} ${equipo.modelo}` : 'Equipo Desconocido'
    };
  });

  return { resumen, ticketsRecientes };
}

// === VISTA 9: PERFIL DEL CLIENTE ===
export async function obtenerPerfilCliente(idCliente = 1) {
  const usuario = usuarios.find(u => u.id_usuario === idCliente);
  if (!usuario) throw new Error("Cliente no encontrado");
  
  // En la versión real, Cliente tendrá telefono y direccion (RF-03).
  // Aquí los simulamos si no existen en datosFalsos
  return {
    ...usuario,
    telefono: "300 123 4567",
    direccion: "Calle Falsa 123, Puerto Asís",
    area_departamento: "Ventas"
  };
}

export async function obtenerEquiposCliente(idCliente = 1) {
  return equipos.filter(e => e.id_cliente === idCliente);
}