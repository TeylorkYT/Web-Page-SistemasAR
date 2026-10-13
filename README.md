# Sistemas AR — Sistema de Gestión de Tickets de Soporte Técnico

Plataforma web para la gestión de tickets de soporte técnico, desarrollada como proyecto formativo del programa ADSO.

## Descripción

Sistemas AR permite a los clientes crear tickets de soporte, a los técnicos gestionar las reparaciones y a los administradores supervisar todo el proceso. Incluye seguimiento de equipos, historial de acciones, reportes técnicos y calificación del servicio.

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| **Base de datos** | MySQL 8.0 (servidor compartido en la nube) |
| **Backend** | Python · FastAPI · Uvicorn · PyMySQL |
| **Frontend** | React · Vite · React Router DOM |

## Estructura del proyecto

```
sistemasar/
├── backend/          # API REST con FastAPI
│   ├── main.py
│   ├── database.py
│   ├── .env          # Variables de entorno (NO se sube)
│   ├── .env.example  # Plantilla de variables
│   └── requirements.txt
├── frontend/         # Aplicación React con Vite
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
├── database/         # Scripts SQL
│   ├── ddl.sql           # Estructura de la base de datos
│   └── datos_prueba.sql  # Datos de prueba
├── .gitignore
└── README.md
```

## Requisitos previos

- **Git** — control de versiones
- **Python 3.10+** — para el backend
- **Node.js LTS** — para el frontend
- **MySQL Workbench** o **phpMyAdmin** — para administrar la base de datos

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/<usuario>/sistemasar.git
cd sistemasar
```

### 2. Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

El backend corre en `http://127.0.0.1:8000`. Documentación interactiva en `/docs`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend corre en `http://localhost:5173`.

### 4. Variables de entorno

Copiar `backend/.env.example` a `backend/.env` y completar con los datos de conexión a la base de datos compartida.

## Ramas

| Rama | Uso |
| --- | --- |
| `main` | Código estable y revisado |
| `develop` | Integración de features en desarrollo |
| `feature/*` | Ramas individuales por tarea |

> **Regla:** Nadie sube directo a `main`. Todo pasa por pull request a `develop`.

## Equipo

| Integrante | Rol en el proyecto |
| --- | --- |
| Teylork | Base de datos y repositorio |
| Magleony | Backend base (FastAPI) |
| Cristian | Conexión a base de datos |
| Vidal | Frontend base (React) |
| Jaider | Layout y diseño visual |

## Licencia

Proyecto formativo — uso educativo.
