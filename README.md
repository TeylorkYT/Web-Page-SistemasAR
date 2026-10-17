# Sistemas AR — Frontend (SPA React + Vite)

Frontend web para el Sistema de Gestión de Tickets de Soporte Técnico **Sistemas AR**, desarrollado con React 19, Vite y Vanilla CSS responsivo.

> [!NOTE]
> **Respaldo del Proyecto Full-Stack Completo:**
> La versión integral del repositorio que incluye el backend en FastAPI (Python), el esquema y scripts de base de datos MySQL 8.0, despliegues y documentación general, se encuentra preservada en la rama:
> **[`backup/proyecto-completo`](https://github.com/TeylorkYT/Web-Page-SistemasAR/tree/backup/proyecto-completo)**.

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
   Crea un archivo `.env` en la raíz si deseas configurar la URL del backend u otros parámetros:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación se ejecutará por defecto en `http://localhost:5173`.

4. **Validar sintaxis y buenas prácticas con Oxlint:**
   ```bash
   npm run lint
   ```

5. **Generar compilación optimizada para producción:**
   ```bash
   npm run build
   ```

6. **Previsualizar la compilación de producción:**
   ```bash
   npm run preview
   ```

---

## 🔑 Credenciales de Acceso Rápido (Modo Demostración)

La pantalla de inicio de sesión (`/login`) incluye tarjetas interactivas de **1-clic** para ingresar de inmediato con cualquiera de los tres roles oficiales:

| Rol | Usuario de Prueba | Contraseña | Capacidades Principales |
| :--- | :--- | :--- | :--- |
| 👑 **Administrador** | `admin@prueba.com` | `Prueba123*` | Gestión de usuarios, categorías/servicios, monitoreo de técnicos y reportes. |
| 🛠️ **Técnico** | `tecnico@prueba.com` | `Prueba123*` | Tickets asignados, registro de notas internas, solución y actualización de avance. |
| 👤 **Cliente** | `cliente@prueba.com` | `Prueba123*` | Creación de tickets con modalidad y equipo, portal de mis tickets y calificaciones. |

> [!TIP]
> **Modo Autónomo con Datos Simulados v2.0:**
> El frontend cuenta con un motor autónomo (`mockDataStore.js`) con soporte de persistencia en `localStorage`. Todas las vistas, listados, filtros, creación de tickets, comentarios y perfiles funcionan fluidamente con datos realistas basados en el diseño relacional oficial, sin necesidad de dependencias externas.

---

## 📂 Estructura del Proyecto

```text
Web-Page-SistemasAR/
├── .github/
│   └── workflows/
│       └── ci.yml             # Integración continua (Lint & Build)
├── public/                    # Activos estáticos públicos (favicons, svgs)
├── src/
│   ├── api/                   # Configuración de Axios e interceptores JWT
│   ├── assets/                # Imágenes y recursos estáticos empaquetados
│   ├── components/            # Componentes reutilizables (Layout, Botón, Modal, etc.)
│   ├── context/               # Contextos globales de React (AuthContext)
│   ├── data/                  # Datos semilla y mocks para pruebas
│   ├── pages/                 # Páginas y vistas por rol (admin, cliente, tecnico, auth)
│   │   ├── admin/             # Paneles y gestión del administrador
│   │   ├── auth/              # Inicio de sesión, registro y recuperación de contraseña
│   │   ├── cliente/           # Portal del cliente (tickets, equipos, perfil)
│   │   └── tecnico/           # Panel del técnico (atención y avance de tickets)
│   ├── routes/                # Rutas protegidas y enrutamiento por roles (React Router)
│   ├── services/              # Capa de consumo de APIs y servicios
│   ├── styles/                # Variables CSS y estilos base compartidos
│   ├── App.jsx                # Componente raíz con árbol de rutas
│   ├── index.css              # Reset y estilos globales
│   └── main.jsx               # Punto de entrada de la aplicación React
├── .gitignore                 # Exclusiones de Git
├── .oxlintrc.json             # Configuración del linter Oxlint
├── index.html                 # Plantilla HTML base
├── package.json               # Dependencias y scripts
└── vite.config.js             # Configuración del empaquetador Vite
```

---

## 👥 Roles y Flujos Soportados

- **Administrador:** Dashboard analítico, gestión de personal técnico y usuarios, catálogo de categorías y auditoría de reportes.
- **Técnico:** Dashboard operativo, gestión de asignaciones, seguimiento y cambio de estados, registro de soluciones y comentarios.
- **Cliente:** Reporte de tickets con modalidad (presencial/remoto) y equipo asociado, historial de servicios, gestión de perfil y equipos, y calificación de atenciones recibidas.
