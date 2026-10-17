import { Link } from "react-router-dom";

const vistas = [
  { numero: 1, nombre: "Login", ruta: "/login" },
  { numero: 2, nombre: "Recuperación de contraseña", ruta: "/recuperar" },
  { numero: 3, nombre: "Registro de nuevo cliente", ruta: "/registro" },
  { numero: 4, nombre: "Dashboard del cliente", ruta: "/cliente" },
  { numero: 5, nombre: "Crear ticket", ruta: "/cliente/tickets/nuevo" },
  { numero: 6, nombre: "Mis tickets", ruta: "/cliente/tickets" },
  { numero: 7, nombre: "Detalle del ticket", ruta: "/cliente/tickets/1" },
  { numero: 8, nombre: "Calificar ticket", ruta: "/cliente/tickets/1/calificar" },
  { numero: 9, nombre: "Perfil del cliente", ruta: "/cliente/perfil" },
  { numero: 10, nombre: "Dashboard del técnico", ruta: "/tecnico" },
  { numero: 11, nombre: "Detalle de ticket asignado", ruta: "/tecnico/tickets/1" },
  { numero: 12, nombre: "Actualizar avance", ruta: "/tecnico/tickets/1/avance" },
  { numero: 14, nombre: "Dashboard del administrador", ruta: "/admin" },
  { numero: 15, nombre: "Gestión de usuarios", ruta: "/admin/usuarios" },
  { numero: 16, nombre: "Asignación de técnico", ruta: "/admin/tickets/1/asignar" },
  { numero: 17, nombre: "Gestión de categorías", ruta: "/admin/categorias" },
  { numero: 19, nombre: "Reportes", ruta: "/admin/reportes" },
  { numero: 20, nombre: "Calificaciones recibidas", ruta: "/admin/calificaciones" },
];

export default function Indice() {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Índice de Vistas - KIT-1</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {vistas.map((vista) => (
          <li key={vista.numero} style={{ margin: "10px 0" }}>
            <Link to={vista.ruta} style={{ color: "#646cff", fontSize: "1.05rem" }}>
              {vista.numero}. {vista.nombre}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}