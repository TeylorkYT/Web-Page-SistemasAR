# Sistemas AR — Frontend (SPA Vue 3 + Vite)

Frontend web para el Sistema de Gestión de Tickets de Soporte Técnico **Sistemas AR**, desarrollado con **Vue 3** (Composition API, `<script setup>`), **Vue Router**, **Vite** y **Vanilla CSS** responsivo con diseño corporativo moderno.

> [!NOTE]
> **Respaldo del Proyecto Full-Stack Completo:**
> La versión integral del repositorio que incluye el backend en FastAPI (Python), el esquema y scripts de base de datos MySQL 8.0, despliegues y documentación general, se encuentra preservada en la rama:
> **[`backup/proyecto-completo`](https://github.com/TeylorkYT/Web-Page-SistemasAR/tree/backup/proyecto-completo)**.

---

## 🛠️ Tecnologías Principales

- **Framework:** [Vue 3](https://vuejs.org/) (Composition API y sintaxis `<script setup>`)
- **Enrutamiento:** [Vue Router](https://router.vuejs.org/) con navegación basada en roles y guardias de seguridad
- **Empaquetador & Dev Server:** [Vite](https://vite.dev/)
- **Linter & Análisis Estático:** [Oxlint](https://oxc.rs/docs/guide/usage/linter) con reglas optimizadas para Vue
- **Cliente HTTP:** [Axios](https://axios-http.com/) con interceptores para JWT y fallback a simulación
- **Estilos:** Vanilla CSS modular con variables de diseño corporativo (paleta Teal `#00bba6`, Azul Marino `#071e33`, estados semánticos y tipografía moderna)
- **CI/CD:** GitHub Actions para validación automática de linting y compilación

---

## 🚀 Requisitos Previos

- **Node.js** 20.x o superior (recomendado 22.x LTS)
- **npm** 10.x o superior

---

## 📦 Instalación y Ejecución Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno (opcional):**
   Crea un archivo `.env` o `.env.local` en la raíz si deseas conectar un backend real u otros parámetros:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación se ejecutará por defecto en `http://localhost:5173`.

4. **Validar código y reglas de calidad con Oxlint:**
   ```bash
   npm run lint
   ```

5. **Generar compilación optimizada para producción:**
   ```bash
   npm run build
   ```

6. **Previsualizar la compilación de producción localmente:**
   ```bash
   npm run preview
   ```

---

## 🔑 Credenciales de Acceso Rápido (Modo Demostración)

La pantalla de inicio de sesión (`/login`) cuenta con botones interactivos de acceso rápido de **1-clic** para ingresar de inmediato con cualquiera de los tres roles oficiales:

| Rol | Usuario de Prueba | Contraseña | Capacidades Principales |
| :--- | :--- | :--- | :--- |
| 👑 **Administrador** | `admin@prueba.com` | `Prueba123*` | Métricas y KPIs ejecutivos, triaje y asignación de tickets, gestión de usuarios y categorías, auditoría y reportes. |
| 🛠️ **Técnico** | `tecnico@prueba.com` | `Prueba123*` | Tickets asignados, chat directo con clientes, registro de notas internas/soluciones, avance y vinculación de equipos. |
| 👤 **Cliente** | `cliente@prueba.com` | `Prueba123*` | Creación de tickets con modalidad y equipo, portal de mis tickets, chat con técnico y calificación de servicios. |

> [!TIP]
> **Motor Autónomo con Persistencia en LocalStorage:**
> La aplicación incorpora un motor de datos simulados (`mockDataStore.js`) con persistencia en `localStorage`. Todas las operaciones (creación de tickets, chat, registro de notas, vinculación de equipos, filtros y actualización de perfiles) funcionan de manera autónoma sin requerir un backend activo.

---

## 📂 Estructura del Proyecto

```text
Web-Page-SistemasAR/
├── .github/
│   └── workflows/
│       └── ci.yml             # Integración continua (Lint & Build en Node 22)
├── public/                    # Activos estáticos públicos y favicons
├── src/
│   ├── api/                   # Cliente Axios e interceptores JWT
│   │   ├── client.js          # Configuración del cliente HTTP
│   │   └── mockDataStore.js   # Motor autónomo de datos relacionales y persistencia
│   ├── assets/                # Imágenes y logos corporativos
│   ├── components/            # Componentes reutilizables Vue
│   │   ├── Boton.vue          # Botón estilizado con variantes
│   │   ├── Campo.vue          # Campos de formulario con validación
│   │   ├── EstadoBadge.vue    # Indicadores visuales de estado del ticket
│   │   ├── Layout.vue         # Contenedor global con Sidebar, Navbar y perfil
│   │   ├── Modal.vue          # Ventanas modales accesibles
│   │   ├── SeccionAdjuntos.vue# Gestión visual de archivos adjuntos
│   │   └── Tabla.vue          # Tablas con estados y paginación
│   ├── context/               # Estado reactivo global
│   │   └── useAuth.js         # Composable de autenticación y sesión reactiva
│   ├── data/                  # Datos semilla para pruebas
│   ├── pages/                 # Vistas agrupadas por dominio y rol
│   │   ├── admin/             # Panel del Administrador (Dashboard, Asignar, Categorías, Usuarios, Reportes, Calificaciones)
│   │   ├── auth/              # Vistas de autenticación (Login, Registro, Recuperación y Restablecimiento)
│   │   ├── cliente/           # Portal del Cliente (Dashboard, Crear Ticket, Mis Tickets, Detalle y Calificar)
│   │   └── tecnico/           # Panel del Técnico (Dashboard, Tickets Asignados, Detalle, Avance)
│   ├── routes/                # Enrutador Vue Router y control de acceso
│   │   ├── router.js          # Definición de rutas, lazy-loading y guardias de rol
│   │   └── rutaPorRol.js      # Redirección dinámica según rol de usuario
│   ├── services/              # Capa de servicios para comunicación de datos y APIs
│   ├── styles/                # Variables CSS corporativas y diseño del sistema
│   ├── App.vue                # Componente raíz con RouterView
│   ├── index.css              # Reset y estilos tipográficos base
│   └── main.js                # Punto de entrada de la aplicación Vue 3
├── .gitignore                 # Exclusiones de Git
├── .oxlintrc.json             # Configuración del linter Oxlint para Vue
├── index.html                 # Plantilla HTML base
├── package.json               # Dependencias, scripts y metadatos
└── vite.config.js             # Configuración del plugin Vue y Vite
```

---

## 👥 Módulos y Flujos Soportados

### 👑 Módulo Administrador
- **Dashboard Ejecutivo:** 5 KPIs de alto nivel, gráfico comparativo de tickets, cola de triaje para tickets sin asignar y monitoreo de técnicos.
- **Asignación de Tickets:** Reasignación y asignación de técnicos en servicio con validación de disponibilidad.
- **Gestión de Usuarios y Roles:** Control de altas, bajas y actualización de perfiles (Administradores, Técnicos y Clientes).
- **Catálogo de Categorías y Servicios:** Configuración de áreas técnicas y tipos de soporte.
- **Auditoría e Historial:** Trazabilidad completa de incidencias y cambios de estado.
- **Reportes y Calificaciones:** Métricas de rendimiento y retroalimentación de clientes.

### 🛠️ Módulo Técnico
- **Bandeja de Trabajo:** Filtrado de tickets asignados por prioridad y estado (Abierto, En Proceso, Resuelto).
- **Detalle de Ticket Integral:** Visualización de información del equipo, historial de cambios y chat en tiempo real con el cliente.
- **Gestión de Equipos:** Capacidad de registrar y asociar equipos al cliente directamente desde la vista del ticket.
- **Bitácora y Avances:** Registro de notas internas, solución aplicada y cambios de estado formal.

### 👤 Módulo Cliente
- **Portal del Cliente:** Resumen de incidencias activas y resueltas.
- **Levantamiento de Tickets:** Creación guiada con selección de modalidad (Presencial/Remoto), categoría, prioridad y equipo.
- **Seguimiento Interactivo:** Chat bidireccional con el técnico asignado y revisión de notas de avance.
- **Gestión de Equipos y Perfil:** Registro de hardware propio para agilizar futuras solicitudes.
- **Evaluación del Servicio:** Sistema de calificación por estrellas y comentarios una vez resuelto el ticket.
