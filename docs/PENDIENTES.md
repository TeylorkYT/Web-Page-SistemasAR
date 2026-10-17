# Pendientes y Estado de Cierre del Proyecto SistemasAR

**Fecha de corte:** Cierre de Sprint - Daily 4  
**Equipo de desarrollo:** Teylork (Líder técnico & BD), Cristian (Backend Tickets & Pruebas), Magleony (Backend Cuentas & Flujos), Vidal (Frontend Cuentas & Catálogos), Jaider (Frontend Tickets & Layout).  
**Esquema de Base de Datos:** `sistemas_ar` (14 tablas relacionales en MySQL 8.0).  
**Prefijo API:** `/api/v1` con autenticación JWT Bearer.

---

## 1. Matriz de Requisitos Funcionales (RF-01 a RF-18)

Evaluación exhaustiva de los 18 requisitos funcionales del Documento Definitivo v2.0 frente al código implementado en Backend y Frontend:

| Requisito | Descripción | Estado | Detalle y Observaciones |
| :--- | :--- | :---: | :--- |
| **RF-01** | **Autenticación e inicio de sesión** | **Hecho** | Login con JWT (`POST /api/v1/auth/login`), emisión de access token y refresh token, rotación de tokens (`/refresh`) y consulta de identidad (`/me`). |
| **RF-02** | **Cierre de sesión y control de acceso** | **Hecho** | Protección en frontend con `AuthContext` y rutas protegidas por rol (`RutaProtegida.jsx`). En backend, middleware de roles con `requiere_roles(...)`. |
| **RF-03** | **Registro de clientes y recuperación** | **Hecho** | Registro completo de clientes (`POST /api/v1/auth/register`) con validación de contraseña (8 a 72 chars) y duplicidad de correo (409). Recuperación de contraseña real con correo SMTP (`POST /api/v1/auth/recuperar`), token JWT firmado de un solo uso con huella criptográfica de contraseña (`POST /api/v1/auth/restablecer`), prevención de enumeración y cooldown en frontend. |
| **RF-04** | **Gestión de usuarios por Administrador** | **Hecho** | CRUD completo (`GET`, `POST`, `PUT /api/v1/usuarios`), filtrado por rol y estado, actualización de contraseñas con hash bcrypt y validación que impide al admin inactivarse a sí mismo (400). Vista 15 conectada. |
| **RF-05** | **Gestión de categorías de servicio** | **Hecho** | Endpoints `GET`, `POST`, `PUT /api/v1/categorias`. Validación de unicidad de nombre (409). Vista 17 conectada. |
| **RF-06** | **Asignación de categorías a tickets** | **Hecho** | Tabla relacional `Ticket_Categoria` que soporta múltiples categorías por ticket en la creación y visualización. Nota: no existe inactivación de categorías debido al diseño del DDL. |
| **RF-07** | **Registro y gestión de equipos** | **Hecho** | Endpoints `GET`, `POST`, `PUT /api/v1/equipos`. Filtrado por cliente dueño, unicidad de serial (409) y soporte para administración. Vista 9 conectada. |
| **RF-08** | **Adjuntos de evidencia en tickets** | **Hecho** | Subida y almacenamiento seguro de archivos `.jpg`, `.png` y `.pdf` de hasta 5 MB (máx. 3 por ticket) en `POST /api/v1/tickets/{id}/adjuntos`, listado y descarga con validación estricta de pertenencia (anti-IDOR). Componente `SeccionAdjuntos.jsx` integrado en vistas de Cliente y Técnico. |
| **RF-09** | **Creación de tickets de soporte** | **Hecho** | Endpoint `POST /api/v1/tickets`. Requiere al menos una categoría válida y valida que el equipo pertenezca al cliente. Estado inicial `Abierto`, prioridad por defecto `Media`, evento inicial en historial. |
| **RF-10** | **Listado y filtrado de tickets por rol** | **Hecho** | `GET /api/v1/tickets` con filtrado estricto: cliente solo ve los suyos, técnico solo los asignados, administrador ve todos con filtros por estado, prioridad y técnico. |
| **RF-11** | **Detalle integral, historial y comentarios** | **Hecho** | `GET /api/v1/tickets/{id}`, historial ordenado cronológicamente y comentarios con regla de privacidad: los clientes nunca ven notas internas ni pueden crearlas. |
| **RF-12** | **Asignación de técnico y prioridad** | **Hecho** | `PATCH /api/v1/tickets/{id}/asignar` por Administrador. Valida técnico activo y disponible (rechaza `Fuera_de_Servicio` con 400). Transición a `En_Proceso`. |
| **RF-13** | **Informe técnico de solución** | **Hecho** | `POST /api/v1/tickets/{id}/reporte` ejecutado por el técnico asignado. Valida solución no vacía, crea registro en `Reporte` y pasa ticket a `Resuelto`. |
| **RF-14** | **Calificación y cierre de tickets** | **Hecho** | `POST /api/v1/tickets/{id}/calificacion` por el cliente (puntuación 1 a 5) o cierre directo sin calificar con `PATCH /api/v1/tickets/{id}/estado`. Transición a `Cerrado`. |
| **RF-15** | **Notificaciones por correo electrónico (SMTP)** | **Hecho** | Envío de correos automáticos ante eventos del ticket (apertura, asignación, comentarios, solución) y recuperación de contraseñas mediante servidor SMTP configurable con `BackgroundTasks` y 3 plantillas HTML responsivas. Tolerante a fallos si el SMTP no está configurado. |
| **RF-16** | **Notificaciones internas en plataforma** | **Hecho** | Modelo `Notificacion`, servicio `notificar` y endpoints `GET /api/v1/notificaciones`, `PATCH .../leida`. Disparos automáticos en creación, asignación, comentarios, resolución, cierre y alertas de baja calificación ($\le$ 2 estrellas). Campana interactiva en `Layout.jsx`. |
| **RF-17** | **Reportes estadísticos y métricas** | **Hecho** | Servicio `reporte_service.py` con los 5 informes agregados en JSON y servicio `exportacion_service.py` para exportar a PDF (`reportlab`) y Excel (`openpyxl`) con sanitización contra inyección de fórmulas. Botones integrados en vista `Reportes.jsx`. |
| **RF-18** | **Supervisión de calificaciones y feedback** | **Hecho** | `GET /api/v1/calificaciones` con filtros por técnico, puntuación y rango de fechas. Vista 20 (`CalificacionesRecibidas.jsx`) conectada a la API real. |

---

## 2. Estado de Cierre y Módulos Completados (Daily 06)

Todos los módulos de cierre funcional y despliegue del **Daily 06** fueron completados con éxito:

- **M0 · CI Hermético y Protección de Ramas:** Tests ejecutados con SQLite en memoria y MySQL en CI independiente.
- **M1 · Adjuntos de Evidencia (Backend - RF-08):** Subida, almacenamiento sanitizado, validación MIME y descarga anti-IDOR.
- **M2 · Adjuntos de Evidencia (Frontend - RF-08):** Componente `SeccionAdjuntos.jsx` con drag and drop, validación de tamaño y tipo de archivo.
- **M3 · Exportación de Reportes a PDF y Excel (RF-17):** 5 informes exportables a `.xlsx` y `.pdf` en tiempo récord (<3 s) con neutralización de fórmulas.
- **M4 · Correo SMTP y Recuperación de Contraseña (RF-15 y RF-03):** Envío asíncrono en background, plantillas HTML y token de reset criptográfico.
- **M5 · Despliegue en VPS, Carga y Manuales:**
  - Configuración de Nginx (`deploy/nginx.conf`) con reverse proxy, rate limiting, SSL y SPA fallback.
  - Servicio Systemd (`deploy/sistemasar-backend.service`) con 2 workers Uvicorn.
  - Script de respaldos automatizados (`deploy/backup_mysql.sh`) con retención de 7 días y verificación de restauración.
  - Script de pruebas de carga Locust (`deploy/test_carga_locust.py`) para 100 usuarios concurrentes.
  - Manuales en `docs/manuales/`: `manual-tecnico.md`, `manual-despliegue.md` y `manual-usuario.md`.

### 2.1 Tareas Opcionales para Fases Futuras
| ID | Tarea | Descripción |
|---|---|---|
| **O-01** | Alerta de ticket estancado | Notificación al administrador si un ticket permanece >8h en `En_Proceso`. |
| **O-02** | Disponibilidad dinámica del técnico | Endpoint para que el propio técnico alterne su estado (`Disponible`, `En_Almuerzo`, `Ocupado`). |
| **O-03** | Advertencia de saturación de técnico | Alerta al administrador al asignar si el técnico ya posee 5 tickets en proceso. |
| **O-04** | Tablero Kanban interactivo | Visualización en columnas drag-and-drop sincronizada con la API REST. |
| **O-05** | Edición de perfil de cliente y equipos | Vista mejorada para actualizar datos personales del cliente. |

---

## 3. Desfases entre la Implementación y el Documento Definitivo

1. **Inactivación de Categorías (RF-06):**
   - El Documento Definitivo menciona la posibilidad de inactivar categorías. Sin embargo, en el DDL oficial `database/mibasededatos.sql`, la tabla `Categoria` solo contiene `(id_categoria, nombre_categoria, descripcion)`, careciendo de columna `estado` o `activo`.
   - **Solución adoptada:** Se implementó exclusivamente creación y edición para respetar fielmente el contrato DDL sin introducir alteraciones destructivas al esquema.
2. **Librerías de Seguridad y Criptografía:**
   - La especificación original sugería `passlib[bcrypt]` y `python-jose`.
   - **Solución adoptada:** Se utiliza `bcrypt` nativo y `PyJWT` moderno. Esto previene fallos de compatibilidad con versiones recientes de Python (3.10+) donde `passlib` presenta advertencias y bugs con esquemas de longitud de cadena mayores a 72 bytes.
3. **Módulo de Inventario de Repuestos (Vistas 13 y 18):**
   - Aunque existían maquetas iniciales, el Documento Definitivo v2.0 delimitó el alcance exclusivamente al sistema de ticketing y soporte técnico. No existe tabla de inventario en `database/mibasededatos.sql`, por lo que estas vistas quedan desactivadas.
4. **Seriales de Equipos:**
   - En el modelo `Equipo`, la columna `serial` cuenta con restricción `UNIQUE` en la base de datos. Cualquier intento de registrar un serial existente responde HTTP 409 con mensaje claro.

---

## 4. Guía de Ejecución y Puesta en Marcha desde Cero

### 4.1 Base de Datos (MySQL 8.0)
1. Crear la base de datos relacional:
   ```sql
   CREATE DATABASE sistemas_ar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE sistemas_ar;
   ```
2. Ejecutar el DDL estructural:
   ```bash
   mysql -u <usuario> -p sistemas_ar < database/mibasededatos.sql
   ```
3. Poblar los datos iniciales y usuarios de prueba:
   ```bash
   mysql -u <usuario> -p sistemas_ar < database/datos_prueba.sql
   ```

### 4.2 Backend (FastAPI + SQLAlchemy)
1. Navegar al directorio y configurar entorno virtual:
   ```bash
   cd backend
   python -m venv venv
   # En Windows:
   venv\Scripts\activate
   # En Linux/Mac:
   source venv/bin/activate
   ```
2. Instalar dependencias exactas:
   ```bash
   pip install -r requirements.txt
   ```
3. Configurar variables de entorno copiando `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Asegurar los valores para:
   - `DATABASE_URL=mysql+pymysql://<user>:<pass>@<host>:<port>/sistemas_ar`
   - `JWT_SECRET=<secreto_seguro>`
   - `ALGORITHM=HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES=60`
   - `REFRESH_TOKEN_EXPIRE_DAYS=7`
4. Iniciar el servidor API en modo desarrollo:
   ```bash
   uvicorn app.main:app --reload
   ```
   - La API estará disponible en `http://localhost:8000`.
   - Documentación interactiva Swagger: `http://localhost:8000/docs`.
5. Ejecutar la suite completa de pruebas automatizadas:
   ```bash
   pytest
   ```

### 4.3 Frontend (React + Vite)
1. Navegar al directorio e instalar paquetes:
   ```bash
   cd frontend
   npm install
   ```
2. Iniciar el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```
   - La aplicación web estará disponible en `http://localhost:5173`.
3. Validar compilación de producción:
   ```bash
   npm run build
   ```

---

## 5. Usuarios de Prueba y Credenciales Estándar

Todas las cuentas de prueba comparten la misma contraseña configurada en el script de datos de prueba:

> **Contraseña de prueba universal:** `Prueba123*`

| Rol | Correo Electrónico | Estado | Propósito de Prueba |
| :--- | :--- | :---: | :--- |
| **Administrador** | `admin@prueba.com` | `Activo` | Acceso completo: usuarios, categorías, asignaciones, reportes y calificaciones. |
| **Técnico** | `tecnico@prueba.com` | `Activo` | Gestión de tickets asignados, notas internas y reportes de solución. |
| **Cliente** | `cliente@prueba.com` | `Activo` | Creación de tickets, registro de equipos, comentarios y calificación de servicio. |
| **Cliente Inactivo** | `inactivo@prueba.com` | `Inactivo` | Validación de rechazo de login y bloqueo de acceso (HTTP 401). |

---

## 6. Convenciones del Equipo y Buenas Prácticas

1. **Estrategia de Ramas Git:**
   - `main`: Código final validado y en producción.
   - `develop`: Rama troncal de integración de características.
   - `feature/<nombre-tarea>`: Ramas cortas de desarrollo por funcionalidad (fusionadas mediante pull request sin commits directos a `develop` o `main`).
2. **Seguridad de Secretos:**
   - Prohibido versionar tokens JWT reales, claves privadas o cadenas de conexión con contraseñas de producción. El archivo `.env` se mantiene en `.gitignore`.
3. **Integridad de Base de Datos:**
   - Prohibido ejecutar comandos SQL destructivos (`DROP TABLE`, `TRUNCATE`, `DELETE` sin cláusula `WHERE`) en el entorno compartido sin autorización expresa.
4. **Gobernanza de Dependencias:**
   - `backend/requirements.txt`: Mantenido y centralizado exclusivamente por Cristian.
   - `frontend/package.json`: Mantenido y centralizado exclusivamente por Jaider.

---

## 7. Próximos Pasos Recomendados para el Equipo

1. **Fase P3 - Envío de Correos y Adjuntos:**
   - Implementar el router de adjuntos en `backend/app/routers/adjuntos.py` con almacenamiento local o en S3/Cloud Storage.
   - Integrar un servicio de envío de correos asíncrono con `aiosmtplib` o FastAPI `BackgroundTasks`.
2. **Fase P3 - Exportación de Documentos:**
   - Agregar endpoints `GET /api/v1/reportes/exportar/excel` y `GET /api/v1/reportes/exportar/pdf` utilizando las funciones ya existentes en `reporte_service.py`.
3. **Hardening y Despliegue:**
   - Preparar archivo `Dockerfile` y `docker-compose.yml` para orquestación estandarizada de base de datos, backend y frontend.
   - Configurar pipeline CI/CD en GitHub Actions para ejecutar `pytest` y `npm run build` en cada Pull Request hacia `develop`.
