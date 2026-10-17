import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../context/useAuth';
import { obtenerRutaPorRol } from './rutaPorRol';

// Generales
import Indice from '../pages/Indice.vue';
import Estado from '../pages/Estado.vue';

// Auth
import Login from '../pages/auth/Login.vue';
import RecuperarContrasena from '../pages/auth/RecuperarContrasena.vue';
import RestablecerContrasena from '../pages/auth/RestablecerContrasena.vue';

// Cliente
import DashboardCliente from '../pages/cliente/DashboardCliente.vue';
import CrearTicket from '../pages/cliente/CrearTicket.vue';
import MisTickets from '../pages/cliente/MisTickets.vue';
import DetalleTicketCliente from '../pages/cliente/DetalleTicketCliente.vue';
import CalificarTicket from '../pages/cliente/CalificarTicket.vue';
import PerfilCliente from '../pages/cliente/PerfilCliente.vue';

// Técnico
import DashboardTecnico from '../pages/tecnico/DashboardTecnico.vue';
import TicketsAsignados from '../pages/tecnico/TicketsAsignados.vue';
import DetalleTicketTecnico from '../pages/tecnico/DetalleTicketTecnico.vue';
import ActualizarAvance from '../pages/tecnico/ActualizarAvance.vue';

// Admin
import DashboardAdmin from '../pages/admin/DashboardAdmin.vue';
import AsignarTecnico from '../pages/admin/AsignarTecnico.vue';
import HistorialTickets from '../pages/admin/HistorialTickets.vue';
import GestionUsuarios from '../pages/admin/GestionUsuarios.vue';
import GestionCategorias from '../pages/admin/GestionCategorias.vue';
import Reportes from '../pages/admin/Reportes.vue';
import CalificacionesRecibidas from '../pages/admin/CalificacionesRecibidas.vue';

const routes = [
  { path: '/estado', component: Estado },
  { path: '/dev-indice', component: Indice },
  { path: '/login', component: Login },
  { path: '/recuperar', component: RecuperarContrasena },
  { path: '/restablecer', component: RestablecerContrasena },
  { path: '/registro', redirect: '/login' },

  // Rutas protegidas: Cliente
  { path: '/cliente', component: DashboardCliente, meta: { rol: 'cliente' } },
  { path: '/cliente/tickets/nuevo', component: CrearTicket, meta: { rol: 'cliente' } },
  { path: '/cliente/tickets', component: MisTickets, meta: { rol: 'cliente' } },
  { path: '/cliente/tickets/:id', component: DetalleTicketCliente, meta: { rol: 'cliente' } },
  { path: '/cliente/tickets/:id/calificar', component: CalificarTicket, meta: { rol: 'cliente' } },
  { path: '/cliente/perfil', component: PerfilCliente, meta: { rol: 'cliente' } },

  // Rutas protegidas: Técnico
  { path: '/tecnico', component: DashboardTecnico, meta: { rol: 'tecnico' } },
  { path: '/tecnico/tickets', component: TicketsAsignados, meta: { rol: 'tecnico' } },
  { path: '/tecnico/tickets/:id', component: DetalleTicketTecnico, meta: { rol: 'tecnico' } },
  { path: '/tecnico/tickets/:id/avance', component: ActualizarAvance, meta: { rol: 'tecnico' } },

  // Rutas protegidas: Administrador
  { path: '/admin', component: DashboardAdmin, meta: { rol: 'administrador' } },
  { path: '/admin/asignacion', component: AsignarTecnico, meta: { rol: 'administrador' } },
  { path: '/admin/tickets/asignar', component: AsignarTecnico, meta: { rol: 'administrador' } },
  { path: '/admin/tickets/:id/asignar', component: AsignarTecnico, meta: { rol: 'administrador' } },
  { path: '/admin/tickets', component: HistorialTickets, meta: { rol: 'administrador' } },
  { path: '/admin/usuarios', component: GestionUsuarios, meta: { rol: 'administrador' } },
  { path: '/admin/categorias', component: GestionCategorias, meta: { rol: 'administrador' } },
  { path: '/admin/reportes', component: Reportes, meta: { rol: 'administrador' } },
  { path: '/admin/calificaciones', component: CalificacionesRecibidas, meta: { rol: 'administrador' } },

  // Redirección inteligente de raíz y comodín
  {
    path: '/',
    name: 'Raiz',
    beforeEnter: (to, from, next) => {
      const { sesion } = useAuth();
      if (!sesion.value || !sesion.value.access_token) {
        next('/login');
      } else {
        next(obtenerRutaPorRol(sesion.value.rol));
      }
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.rol) {
    const { sesion } = useAuth();
    if (!sesion.value || !sesion.value.access_token) {
      return next('/login');
    }

    const rolSesion = (sesion.value.rol || '').toLowerCase();
    const rolRequerido = (to.meta.rol || '').toLowerCase();

    const esAdminSesion = rolSesion === 'administrador' || rolSesion === 'admin';
    const requiereAdmin = rolRequerido === 'administrador' || rolRequerido === 'admin';

    const coincideRol = rolSesion === rolRequerido || (esAdminSesion && requiereAdmin);

    if (!coincideRol) {
      const destino = obtenerRutaPorRol(sesion.value.rol);
      return next(destino);
    }
  }

  next();
});

export default router;
