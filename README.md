# 🌐 SistemasAR - Web Page & Sistema de Gestión (sistemasar.net)

Repositorio oficial del proyecto **sistemasar.net**.

---

## 📁 Estructura del Proyecto

```text
├── database/            # Scripts SQL (Esquema y datos de prueba)
│   ├── schema.sql       # Creación de base de datos y las 8 tablas
│   └── datos_prueba.sql # Datos iniciales con un usuario por rol
├── backend/             # API REST con FastAPI (Python)
├── frontend/            # Interfaz de usuario con React + Vite
├── .gitignore           # Exclusiones de Git
└── README.md            # Documentación del proyecto
```

---

## 🗄️ Configuración de la Base de Datos (MySQL)

Cada integrante del equipo debe ejecutar los scripts en su servidor MySQL local:

1. **Crear la base de datos y tablas:**
   ```bash
   mysql -u root -p < database/schema.sql
   ```

2. **Cargar datos de prueba:**
   ```bash
   mysql -u root -p < database/datos_prueba.sql
   ```

3. **Verificar la instalación:**
   ```sql
   USE sistemasar_db;
   SHOW TABLES;
   SELECT * FROM usuarios;
   ```

---

## 👥 Equipo y Roles

| Integrante | Rol / Capa | Responsabilidad Principal |
|---|---|---|
| **Teylork** | DevOps & Base de Datos | Repositorio base, diseño de BD y scripts iniciales |
| **Magleony** | Backend Core | Estructura FastAPI, CORS, ruta `/health` |
| **Cristian** | Backend BD | Conexión PyMySQL, `.env`, ruta `/db-check` |
| **Vidal** | Frontend Core | Proyecto React + Vite, rutas, página `Estado.jsx` |
| **Jaider** | Frontend UI/UX | Variables de diseño, Layout base y componentes |

---

## 🌿 Flujo de Trabajo con Git

* **`main`**: Rama protegida de producción. Solo recibe código probado y aprobado desde `develop`.
* **`develop`**: Rama principal de desarrollo donde se integran las funcionalidades.
* **`feature/<capa>-<tarea>`**: Ramas de trabajo individuales (ej: `feature/backend-base`, `feature/frontend-base`).
* **Regla de oro:** El archivo `.env` **NUNCA** se sube al repositorio. Usar `.env.example`.
