# Sistemas AR — Sistema de Gestión de Tickets de Soporte Técnico

Plataforma integral para la gestión, seguimiento y resolución de tickets de soporte técnico de hardware y software, desarrollada bajo arquitectura cliente-servidor con REST API.

---

## 📌 Descripción

**Sistemas AR** permite a los **clientes** reportar incidencias de sus equipos tecnológicos y consultar su avance en tiempo real; a los **técnicos** recibir asignaciones, registrar notas internas, interactuar mediante comentarios y formalizar informes técnicos de solución; y a los **administradores** gestionar el personal, catalogar servicios, supervisar métricas mediante dashboards analíticos y auditar la satisfacción del usuario a través de calificaciones y alertas.

El proyecto implementa el flujo de trabajo completo acordado en el **Documento Definitivo v2.0** con 14 tablas relacionales bajo el esquema `sistemas_ar` y una API bajo el prefijo `/api/v1`.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Características clave |
| :--- | :--- | :--- |
| **Base de Datos** | **MySQL 8.0** | 14 tablas relacionales, integridad referencial en cascada, índices y tipos ENUM nativos. |
| **Backend** | **Python 3.10+ · FastAPI** | Arquitectura modular (Routers, Services, Schemas Pydantic v2, Models SQLAlchemy). Hashing seguro con `bcrypt`, autenticación JWT Bearer (`PyJWT`), pruebas unitarias con `pytest`. |
| **Frontend** | **React 18 · Vite** | Single Page Application (SPA), React Router v6 con rutas protegidas por rol, gestión de estado y sesión con `AuthContext`, cliente HTTP centralizado con Axios, diseño responsivo y moderno con Vanilla CSS. |

---

## 📂 Estructura del Repositorio

```text
Web-Page-SistemasAR/
├── backend/
│   ├── app/
│   │   ├── core/           # Configuración, seguridad (JWT, bcrypt) y dependencias de roles
│   │   ├── db/             # Conexión SQLAlchemy y Base declarativa
│   │   ├── models/         # Modelos ORM de las 14 tablas de la base de datos
│   │   ├── routers/        # Controladores REST API bajo /api/v1 (auth, tickets, reportes, etc.)
│   │   ├── schemas/        # Esquemas DTO y validaciones con Pydantic v2
│   │   ├── services/       # Lógica de negocio transaccional y agregaciones
│   │   └── main.py         # Punto de entrada de la aplicación FastAPI y registro de routers
│   ├── tests/              # Suite completa de pruebas con pytest y SQLite en memoria
│   ├── .env.example        # Plantilla de variables de entorno seguras
│   ├── requirements.txt    # Dependencias fijadas del backend
│   └── pytest.ini          # Configuración del entorno de pruebas
├── frontend/
│   ├── src/
│   │   ├── api/            # Configuración de Axios con interceptor de tokens JWT
│   │   ├── components/     # Componentes reutilizables (Layout, Tabla, Modal, RutaProtegida)
│   │   ├── context/        # Proveedores de estado global (AuthContext)
│   │   ├── pages/          # Vistas divididas por rol (admin, tecnico, cliente, auth)
│   │   ├── routes/         # Definición de rutas y navegación protegida
│   │   ├── services/       # Conectores cliente hacia los endpoints de la API
│   │   ├── App.jsx         # Componente raíz con Router
│   │   └── main.jsx        # Montaje de React DOM
│   ├── package.json        # Dependencias y scripts de Vite
│   └── vite.config.js      # Configuración del bundler
├── database/
│   ├── mibasededatos.sql   # DDL estructural completo de la base de datos (14 tablas)
│   └── datos_prueba.sql    # Datos semilla y usuarios de prueba iniciales
├── docs/
│   ├── dailies/            # Bitácoras de seguimiento ágil del proyecto
│   └── PENDIENTES.md       # Matriz de requisitos RF-01 a RF-18 y tareas de cierre
└── README.md
```

---

## 🚀 Guía de Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/TeylorkYT/Web-Page-SistemasAR.git
cd Web-Page-SistemasAR
```

### 2. Configurar la Base de Datos

En tu motor MySQL 8.0 local o remoto:

```bash
# Crear base de datos e importar estructura y datos de prueba
mysql -u root -p -e "CREATE DATABASE sistemas_ar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p sistemas_ar < database/mibasededatos.sql
mysql -u root -p sistemas_ar < database/datos_prueba.sql
```

### 3. Configurar y Ejecutar el Backend

```bash
cd backend

# Crear y activar entorno virtual
python -m venv venv
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Ajustar DATABASE_URL y JWT_SECRET en el archivo .env

# Ejecutar el servidor FastAPI
uvicorn app.main:app --reload
```

- Servidor API: `http://localhost:8000`
- Documentación Swagger interactiva: `http://localhost:8000/docs`
- Documentación ReDoc: `http://localhost:8000/redoc`

#### Ejecutar Pruebas Automatizadas

**Pruebas herméticas por defecto (SQLite en memoria):**
```bash
pytest
```

**Pruebas contra base de datos real (MySQL 8.0):**
```bash
# Linux / macOS / Bash
TEST_DB_HOST=127.0.0.1 TEST_DB_USER=root TEST_DB_PASSWORD=tu_clave TEST_DB_NAME=sistemas_ar_test pytest

# Windows (PowerShell)
$env:TEST_DB_HOST="127.0.0.1"; $env:TEST_DB_USER="root"; $env:TEST_DB_PASSWORD="tu_clave"; $env:TEST_DB_NAME="sistemas_ar_test"; pytest
```

### 4. Configurar y Ejecutar el Frontend

En una nueva terminal:

```bash
cd frontend

# Instalar paquetes
npm install

# Iniciar servidor de desarrollo Vite
npm run dev
```

- Aplicación Web: `http://localhost:5173`

Para validar la compilación de producción:
```bash
npm run build
```

---

## 👥 Cuentas de Prueba

Para pruebas locales y demostraciones, el sistema cuenta con cuentas preconfiguradas en `database/datos_prueba.sql`.

> **Contraseña de prueba universal:** `Prueba123*`

| Rol | Correo electrónico | Acceso |
| :--- | :--- | :--- |
| **Administrador** | `admin@prueba.com` | Dashboard analítico, gestión de usuarios, categorías, asignación, reportes y calificaciones. |
| **Técnico** | `tecnico@prueba.com` | Bandeja de tickets asignados, notas internas, comentarios y registro de soluciones. |
| **Cliente** | `cliente@prueba.com` | Creación de tickets, registro de equipos propios, seguimiento y calificación de servicio. |
| **Inactivo** | `inactivo@prueba.com` | Usuario inactivo para validación de bloqueo de autenticación (HTTP 401). |

---

## 📋 Estado del Proyecto y Requisitos

Para consultar el inventario detallado de los 18 requisitos funcionales (RF-01 a RF-18), las tareas diferidas a Prioridad 3 (P3) y las especificaciones de despliegue en servidor VPS, consulta el documento técnico de pendientes:

👉 **[Ver Documento de Pendientes y Cierre (docs/PENDIENTES.md)](docs/PENDIENTES.md)**

---

## 🔄 Integración Continua (CI / CD)

El repositorio implementa un pipeline automatizado en **GitHub Actions** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) activado en cada Pull Request y push hacia las ramas `develop` y `main`:

* **`backend-sqlite`:** Ejecuta la suite completa de pruebas herméticas con Python 3.12 y SQLite en memoria sin requerir dependencias externas.
* **`backend-mysql`:** Inicializa un contenedor de servicio con **MySQL 8.0**, importa el esquema relacional oficial desde [`database/mibasededatos.sql`](database/mibasededatos.sql) y ejecuta las pruebas de integración contra la base de datos MySQL real.
* **`frontend`:** Valida sintaxis y buenas prácticas con `oxlint` (`npm run lint`) y compila los bundles de producción con Vite (`npm run build`).

---

## 🌿 Convenciones de Trabajo

- **Ramas:** Todo desarrollo se realiza en ramas de funcionalidad `feature/*` que se integran a `develop` mediante Pull Requests pequeños y verificados. La rama `main` contiene exclusivamente versiones estables.
- **Seguridad:** Ninguna credencial real, archivo `.env` ni token privado se versiona en el repositorio.
- **Control de dependencias:** `backend/requirements.txt` es gestionado centralizadamente por Cristian y `frontend/package.json` por Jaider.

---

## 📄 Licencia

Proyecto desarrollado con fines formativos y académicos dentro del programa de formación ADSO.
