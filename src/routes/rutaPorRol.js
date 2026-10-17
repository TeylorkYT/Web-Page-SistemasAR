export const rutaPorRol = {
  cliente: "/cliente",
  tecnico: "/tecnico",
  administrador: "/admin",
  admin: "/admin",
  Cliente: "/cliente",
  Tecnico: "/tecnico",
  Administrador: "/admin",
  Admin: "/admin",
};

export function obtenerRutaPorRol(rol) {
  if (!rol) return "/login";
  const rolLimpio = String(rol).trim().toLowerCase();
  return rutaPorRol[rolLimpio] || "/login";
}