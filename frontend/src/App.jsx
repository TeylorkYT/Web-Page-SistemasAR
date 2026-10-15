import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Indice from "./pages/Indice";
import Estado from "./pages/Estado";

// Auth
import Login from "./pages/auth/Login";
import RecuperarContrasena from "./pages/auth/RecuperarContrasena";
import Registro from "./pages/auth/Registro";

// Cliente
import DashboardCliente from "./pages/cliente/DashboardCliente";
import CrearTicket from "./pages/cliente/CrearTicket";
import MisTickets from "./pages/cliente/MisTickets";
import DetalleTicketCliente from "./pages/cliente/DetalleTicketCliente";
import CalificarTicket from "./pages/cliente/CalificarTicket";
import PerfilCliente from "./pages/cliente/PerfilCliente";

// Técnico
import DashboardTecnico from "./pages/tecnico/DashboardTecnico";
import DetalleTicketTecnico from "./pages/tecnico/DetalleTicketTecnico";
import ActualizarAvance from "./pages/tecnico/ActualizarAvance";
import InventarioTecnico from "./pages/tecnico/InventarioTecnico";

// Admin
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import GestionUsuarios from "./pages/admin/GestionUsuarios";
import AsignarTecnico from "./pages/admin/AsignarTecnico";
import GestionCategorias from "./pages/admin/GestionCategorias";
import GestionInventario from "./pages/admin/GestionInventario";
import Reportes from "./pages/admin/Reportes";
import CalificacionesRecibidas from "./pages/admin/CalificacionesRecibidas";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Índice y Estado */}
        <Route path="/" element={<Indice />} />
        <Route path="/estado" element={<Estado />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar" element={<RecuperarContrasena />} />
        <Route path="/registro" element={<Registro />} />

        {/* Cliente */}
        <Route path="/cliente" element={<DashboardCliente />} />
        <Route path="/cliente/tickets/nuevo" element={<CrearTicket />} />
        <Route path="/cliente/tickets" element={<MisTickets />} />
        <Route path="/cliente/tickets/:id" element={<DetalleTicketCliente />} />
        <Route path="/cliente/tickets/:id/calificar" element={<CalificarTicket />} />
        <Route path="/cliente/perfil" element={<PerfilCliente />} />

        {/* Técnico */}
        <Route path="/tecnico" element={<DashboardTecnico />} />
        <Route path="/tecnico/tickets/:id" element={<DetalleTicketTecnico />} />
        <Route path="/tecnico/tickets/:id/avance" element={<ActualizarAvance />} />
        <Route path="/tecnico/inventario" element={<InventarioTecnico />} />

        {/* Admin */}
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/admin/usuarios" element={<GestionUsuarios />} />
        <Route path="/admin/tickets/:id/asignar" element={<AsignarTecnico />} />
        <Route path="/admin/categorias" element={<GestionCategorias />} />
        <Route path="/admin/inventario" element={<GestionInventario />} />
        <Route path="/admin/reportes" element={<Reportes />} />
        <Route path="/admin/calificaciones" element={<CalificacionesRecibidas />} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}