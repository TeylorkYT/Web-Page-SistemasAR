/**
 * ==============================================================================
 * SISTEMASAR - COMPONENTE DE LAYOUT BASE (Layout.jsx)
 * ==============================================================================
 * Desarrollado por: Jaider (Responsable del Layout y componentes base)
 * 
 * Descripción:
 * Layout maestro que soporta los 3 roles del sistema según los Mockups:
 * 1. Administrador (Panel de Administrador: usuarios, inventario, reportes, etc.)
 * 2. Técnico (PANEL TÉCNICO: dashboard, tickets asignados, inventario, buscador)
 * 3. Cliente (Portal del Cliente: dashboard, crear ticket, mis tickets, equipos)
 * ==============================================================================
 */

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

/**
 * ==============================================================================
 * CONFIGURACIÓN DE NAVEGACIÓN Y ESTRUCTURA POR ROL
 * ==============================================================================
 * Define los títulos de panel, iconos y opciones del menú lateral para cada perfil.
 */
// ----------------------------------------------------------------------------
// KIT-2: Rutas de navegación por rol y por ítem del menú
// ----------------------------------------------------------------------------
const RUTAS_POR_ROL = {
  administrador: {
    dashboard:     '/admin',
    usuarios:      '/admin/usuarios',
    categorias:    '/admin/categorias',
    inventario:    '/admin/inventario',
    reportes:      '/admin/reportes',
    calificaciones:'/admin/calificaciones'
  },
  tecnico: {
    dashboard:             '/tecnico',
    'tickets-asignados':   '/tecnico/tickets/1',
    'inventario-repuestos':'/tecnico/inventario'
  },
  cliente: {
    dashboard:     '/cliente',
    'crear-ticket':'/cliente/tickets/nuevo',
    'mis-tickets': '/cliente/tickets',
    'perfil-equipos':'/cliente/perfil'
  }
};

// Detecta el rol a partir de la primera parte de la ruta actual
function detectarRol(pathname) {
  if (pathname.startsWith('/admin'))   return 'administrador';
  if (pathname.startsWith('/tecnico')) return 'tecnico';
  if (pathname.startsWith('/cliente')) return 'cliente';
  return 'administrador'; // fallback
}

// Detecta qué ítem del menú está activo según la ruta actual
function detectarItemActivo(pathname, rol) {
  const rutas = RUTAS_POR_ROL[rol] || {};
  // Ordenar por longitud descendente para que rutas más específicas ganen
  const entrada = Object.entries(rutas)
    .sort(([, a], [, b]) => b.length - a.length)
    .find(([, ruta]) => pathname === ruta || pathname.startsWith(ruta + '/'));
  return entrada ? entrada[0] : 'dashboard';
}

const CONFIG_POR_ROL = {
  // ----------------------------------------------------------------------------
  // 1. ROL ADMINISTRADOR (Mockups 14 - 20)
  // ----------------------------------------------------------------------------
  administrador: {
    tituloPanel: 'Panel de Administrador',
    mostrarBuscador: false,
    items: [
      {
        id: 'dashboard',
        etiqueta: 'Dashboard',
        icono: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        )
      },
      {
        id: 'usuarios',
        etiqueta: 'Gestión de usuarios',
        icono: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        )
      },
      {
        id: 'categorias',
        etiqueta: 'Categorías/servicios',
        icono: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        )
      },
      {
        id: 'inventario',
        etiqueta: 'Inventario',
        icono: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        )
      },
      {
        id: 'reportes',
        etiqueta: 'Reportes',
        icono: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        )
      },
      {
        id: 'calificaciones',
        etiqueta: 'Calificaciones',
        icono: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        )
      }
    ]
  },

  // ----------------------------------------------------------------------------
  // 2. ROL TÉCNICO (Mockups 10 - 13: "PANEL TÉCNICO")
  // ----------------------------------------------------------------------------
  tecnico: {
    tituloPanel: 'PANEL TÉCNICO',
    mostrarBuscador: true, // Campo "Buscar ticket..." en el header
    items: [
      {
        id: 'dashboard',
        etiqueta: 'Dashboard',
        icono: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        )
      },
      {
        id: 'tickets-asignados',
        etiqueta: 'Tickets asignados',
        icono: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
        )
      },
      {
        id: 'inventario-repuestos',
        etiqueta: 'Inventario / Repuestos',
        icono: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        )
      }
    ]
  },

  // ----------------------------------------------------------------------------
  // 3. ROL CLIENTE (Mockups 4 - 9: "Vistas del Cliente")
  // ----------------------------------------------------------------------------
  cliente: {
    tituloPanel: 'Portal del Cliente',
    mostrarBuscador: false,
    items: [
      {
        id: 'dashboard',
        etiqueta: 'Dashboard',
        icono: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        )
      },
      {
        id: 'crear-ticket',
        etiqueta: 'Crear ticket nuevo',
        icono: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        )
      },
      {
        id: 'mis-tickets',
        etiqueta: 'Listado de mis tickets',
        icono: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
        )
      },
      {
        id: 'perfil-equipos',
        etiqueta: 'Mis equipos registrados',
        icono: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        )
      }
    ]
  }
};

/**
 * Componente Layout
 * 
 * @param {Object} props - Propiedades recibidas por el componente
 * @param {React.ReactNode} props.children - El contenido dinámico de cada vista
 * @param {('administrador'|'tecnico'|'cliente')} [props.rol='administrador'] - Rol para determinar el menú y header
 * @param {Function} [props.onCambiarRol] - Callback para alternar entre roles (pruebas)
 * @param {string} [props.itemActivo='dashboard'] - Identificador del ítem de navegación seleccionado
 * @param {Function} [props.onCambiarItem] - Callback cuando se hace clic en una opción del menú
 * @param {string} [props.nombreUsuario='Jaider Getial'] - Nombre del usuario activo
 * 
 * @returns {JSX.Element} Estructura completa del Layout
 */
export default function Layout({
  children,
  rol: rolProp,
  onCambiarRol,
  itemActivo: itemActivoProp,
  onCambiarItem,
  nombreUsuario = 'Jaider Joan Getial'
}) {
  // KIT-2: leer rol e ítem activo desde la URL con useLocation
  const location = useLocation();
  const navigate = useNavigate();

  // Integración AuthContext (Daily 3)
  const auth = useAuth();
  const sesion = auth?.sesion;
  const cerrarSesion = auth?.cerrarSesion;

  // Rol detectado por la URL o sesión; si se pasa prop explícita se respeta
  const rol = rolProp || sesion?.rol || detectarRol(location.pathname);
  const itemActivo = itemActivoProp || detectarItemActivo(location.pathname, rol);
  const nombreActivo = sesion?.nombre || nombreUsuario;

  // Estado local para abrir o cerrar el menú lateral en dispositivos móviles
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  // Obtener la configuración visual del rol actual (fallback a administrador)
  const configActual = CONFIG_POR_ROL[rol] || CONFIG_POR_ROL.administrador;

  // Cerrar sesión
  const handleCerrarSesion = () => {
    if (cerrarSesion) {
      cerrarSesion();
    } else {
      localStorage.removeItem('sesion');
    }
    navigate('/login');
  };

  // KIT-2: Manejar el clic en una opción del menú lateral: navega a la ruta correspondiente
  const seleccionarOpcion = (id) => {
    const rutas = RUTAS_POR_ROL[rol] || {};
    if (rutas[id]) {
      navigate(rutas[id]);
    }
    if (onCambiarItem) {
      onCambiarItem(id);
    }
    setMenuMovilAbierto(false);
  };

  // Extraer inicial del usuario para el avatar
  const inicialUsuario = nombreActivo ? nombreActivo.charAt(0).toUpperCase() : 'U';

  return (
    <div className="layout-contenedor">
      {/* Overlay oscuro para pantallas móviles */}
      <div 
        className={`layout-overlay ${menuMovilAbierto ? 'activo' : ''}`}
        onClick={() => setMenuMovilAbierto(false)}
        aria-hidden="true"
      />

      {/* --------------------------------------------------------------------
       * 1. BARRA LATERAL FIJA (Sidebar)
       * Fondo azul oscuro, título del panel correspondiente y lista de opciones
       * -------------------------------------------------------------------- */}
      <aside className={`layout-sidebar ${menuMovilAbierto ? 'abierto' : ''}`}>
        {/* Cabecera del Sidebar con el título del rol */}
        <div className="sidebar-header">
          <div className="sidebar-logo-icono">S</div>
          <h2 className="sidebar-titulo">{configActual.tituloPanel}</h2>
        </div>

        {/* Lista de navegación generada dinámicamente según el rol */}
        <nav className="sidebar-nav">
          <ul className="sidebar-lista">
            {configActual.items.map((item) => {
              const estaActivo = item.id === itemActivo;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`sidebar-item ${estaActivo ? 'activo' : ''}`}
                    onClick={() => seleccionarOpcion(item.id)}
                  >
                    <span className="sidebar-item-icono">{item.icono}</span>
                    <span>{item.etiqueta}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Pie del menú lateral */}
        <div className="sidebar-footer">
          <span>SistemasAR • {rol}</span>
          <span title="Conexión activa">🟢 Online</span>
        </div>
      </aside>

      {/* --------------------------------------------------------------------
       * 2. COLUMNA PRINCIPAL (Header superior + Contenido de la vista)
       * -------------------------------------------------------------------- */}
      <div className="layout-principal">
        {/* Encabezado superior fijo */}
        <header className="layout-header">
          {/* Lado izquierdo: Botón menú móvil y marca */}
          <div className="header-izquierda">
            <button 
              type="button" 
              className="header-boton-menu"
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
              aria-label="Menú"
            >
              ☰
            </button>
            <span className="header-marca">SistemasAR</span>
          </div>

          {/* Centro: Buscador de tickets (específico para el técnico según mockup) */}
          {configActual.mostrarBuscador && (
            <div className="header-centro">
              <div className="header-buscador-contenedor">
                <span className="header-buscador-icono">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <input 
                  type="text" 
                  className="header-buscador-input" 
                  placeholder="Buscar ticket..." 
                />
              </div>
            </div>
          )}

          {/* Lado derecho: Selector de vista/rol + Notificaciones + Avatar */}
          <div className="header-derecha">
            {/* Selector de rol para cambiar la vista entre Cliente, Técnico y Admin */}
            {onCambiarRol && (
              <div className="header-selector-roles" title="Cambiar rol para ver su Layout">
                <button
                  type="button"
                  className={`selector-rol-boton ${rol === 'cliente' ? 'activo' : ''}`}
                  onClick={() => onCambiarRol('cliente')}
                >
                  Cliente
                </button>
                <button
                  type="button"
                  className={`selector-rol-boton ${rol === 'tecnico' ? 'activo' : ''}`}
                  onClick={() => onCambiarRol('tecnico')}
                >
                  Técnico
                </button>
                <button
                  type="button"
                  className={`selector-rol-boton ${rol === 'administrador' ? 'activo' : ''}`}
                  onClick={() => onCambiarRol('administrador')}
                >
                  Admin
                </button>
              </div>
            )}

            {/* Campana de alertas con punto rojo */}
            <button 
              type="button" 
              className="header-icono-alerta"
              aria-label="Notificaciones"
              title="Notificaciones"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="header-badge-notificacion"></span>
            </button>

            {/* Avatar del usuario con inicial y rol */}
            <div className="header-avatar-perfil" title={`Sesión: ${nombreActivo} (${rol})`}>
              <div className="header-avatar-circulo">
                {inicialUsuario}
              </div>
              <div className="header-usuario-info">
                <span className="header-usuario-nombre">{nombreActivo}</span>
                <span className="header-usuario-rol">{rol}</span>
              </div>
            </div>

            {/* Botón cerrar sesión */}
            <button
              type="button"
              className="header-boton-cerrar-sesion"
              onClick={handleCerrarSesion}
              title="Cerrar sesión"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Salir</span>
            </button>
          </div>
        </header>

        {/* --------------------------------------------------------------------
         * 3. ESPACIO CENTRAL PARA EL CONTENIDO (Main)
         * -------------------------------------------------------------------- */}
        <main className="layout-contenido">
          {children}
        </main>
      </div>
    </div>
  );
}
