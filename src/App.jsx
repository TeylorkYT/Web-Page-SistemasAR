import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RutaProtegida from "./routes/RutaProtegida";
import RedireccionRaiz from "./routes/RedireccionRaiz";

import Indice from "./pages/Indice";
import Estado from "./pages/Estado";

// Auth
import Login from "./pages/auth/Login";
import RecuperarContrasena from "./pages/auth/RecuperarContrasena";
import RestablecerContrasena from "./pages/auth/RestablecerContrasena";

// Cliente
import DashboardCliente from "./pages/cliente/DashboardCliente";
import CrearTicket from "./pages/cliente/CrearTicket";
import MisTickets from "./pages/cliente/MisTickets";
import DetalleTicketCliente from "./pages/cliente/DetalleTicketCliente";
import CalificarTicket from "./pages/cliente/CalificarTicket";
import PerfilCliente from "./pages/cliente/PerfilCliente";

// Técnico
import DashboardTecnico from "./pages/tecnico/DashboardTecnico";
import TicketsAsignados from "./pages/tecnico/TicketsAsignados";
import DetalleTicketTecnico from "./pages/tecnico/DetalleTicketTecnico";
import ActualizarAvance from "./pages/tecnico/ActualizarAvance";

// Admin
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import GestionUsuarios from "./pages/admin/GestionUsuarios";
import AsignarTecnico from "./pages/admin/AsignarTecnico";
import HistorialTickets from "./pages/admin/HistorialTickets";
import GestionCategorias from "./pages/admin/GestionCategorias";
import Reportes from "./pages/admin/Reportes";
import CalificacionesRecibidas from "./pages/admin/CalificacionesRecibidas";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas y de redirección inteligente */}
          <Route path="/" element={<RedireccionRaiz />} />
          <Route path="/estado" element={<Estado />} />
          <Route path="/dev-indice" element={<Indice />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar" element={<RecuperarContrasena />} />
          <Route path="/restablecer" element={<RestablecerContrasena />} />
          <Route path="/registro" element={<Navigate to="/login" replace />} />

          {/* Rutas protegidas: Cliente */}
          <Route element={<RutaProtegida rol="cliente" />}>
            <Route path="/cliente" element={<DashboardCliente />} />
            <Route path="/cliente/tickets/nuevo" element={<CrearTicket />} />
            <Route path="/cliente/tickets" element={<MisTickets />} />
            <Route path="/cliente/tickets/:id" element={<DetalleTicketCliente />} />
            <Route path="/cliente/tickets/:id/calificar" element={<CalificarTicket />} />
            <Route path="/cliente/perfil" element={<PerfilCliente />} />
          </Route>

          {/* Rutas protegidas: Técnico */}
          <Route element={<RutaProtegida rol="tecnico" />}>
            <Route path="/tecnico" element={<DashboardTecnico />} />
            <Route path="/tecnico/tickets" element={<TicketsAsignados />} />
            <Route path="/tecnico/tickets/:id" element={<DetalleTicketTecnico />} />
            <Route path="/tecnico/tickets/:id/avance" element={<ActualizarAvance />} />
          </Route>

          {/* Rutas protegidas: Administrador */}
          <Route element={<RutaProtegida rol="administrador" />}>
            <Route path="/admin" element={<DashboardAdmin />} />
            <Route path="/admin/asignacion" element={<AsignarTecnico />} />
            <Route path="/admin/tickets/asignar" element={<AsignarTecnico />} />
            <Route path="/admin/tickets/:id/asignar" element={<AsignarTecnico />} />
            <Route path="/admin/tickets" element={<HistorialTickets />} />
            <Route path="/admin/usuarios" element={<GestionUsuarios />} />
            <Route path="/admin/categorias" element={<GestionCategorias />} />
            <Route path="/admin/reportes" element={<Reportes />} />
            <Route path="/admin/calificaciones" element={<CalificacionesRecibidas />} />
          </Route>

          {/* Redirección por defecto inteligente */}
          <Route path="*" element={<RedireccionRaiz />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}