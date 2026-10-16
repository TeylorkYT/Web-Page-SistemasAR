import { tickets, equipos } from "../data/datosFalsos";

// Simularemos que el cliente logueado es Laura Ramírez (id_cliente = 1)
export async function obtenerDashboardCliente(idCliente = 1) {
  // Filtramos solo los tickets de este cliente
  const misTickets = tickets.filter(t => t.id_cliente === idCliente);
  
  const resumen = {
    total: misTickets.length,
    abiertos: misTickets.filter(t => t.estado === 'Abierto').length,
    enProceso: misTickets.filter(t => t.estado === 'En_Proceso').length,
    resueltos: misTickets.filter(t => t.estado === 'Resuelto').length,
    cerrados: misTickets.filter(t => t.estado === 'Cerrado').length,
  };

  // Preparamos los últimos 5 tickets con el nombre del equipo cruzado
  const ticketsRecientes = misTickets.slice(0, 5).map(t => {
    const equipo = equipos.find(e => e.id_equipo === t.id_equipo);
    return {
      ...t,
      nombre_equipo: equipo ? `${equipo.marca} ${equipo.modelo}` : 'Equipo Desconocido'
    };
  });

  return { resumen, ticketsRecientes };
}