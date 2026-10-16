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
| **RF-03** | **Registro de clientes y recuperación** | **Parcial** | Registro completo de clientes (`POST /api/v1/auth/register`) con validación de contraseña (8 a 72 chars) y duplicidad de correo (409). Recuperación segura (`POST /api/v1/auth/recuperar`) responde mensaje estándar; el envío real por correo SMTP queda pendiente para P3. |
| **RF-04** | **Gestión de usuarios por Administrador** | **Hecho** | CRUD completo (`GET`, `POST`, `PUT /api/v1/usuarios`), filtrado por rol y estado, actualización de contraseñas con hash bcrypt y validación que impide al admin inactivarse a sí mismo (400). Vista 15 conectada. |
| **RF-05** | **Gestión de categorías de servicio** | **Hecho** | Endpoints `GET`, `POST`, `PUT /api/v1/categorias`. Validación de unicidad de nombre (409). Vista 17 conectada. |
| **RF-06** | **Asignación de categorías a tickets** | **Hecho** | Tabla relacional `Ticket_Categoria` que soporta múltiples categorías por ticket en la creación y visualización. Nota: no existe inactivación de categorías debido al diseño del DDL. |
| **RF-07** | **Registro y gestión de equipos** | **Hecho** | Endpoints `GET`, `POST`, `PUT /api/v1/equipos`. Filtrado por cliente dueño, unicidad de serial (409) y soporte para administración. Vista 9 conectada. |
| **RF-08** | **Adjuntos de evidencia en tickets** | **Pendiente** | Subida y almacenamiento de archivos `.jpg`, `.png` y `.pdf` de hasta 5 MB (máx 3 por ticket) diferido para Prioridad 3 (P3). |
| **RF-09** | **Creación de tickets de soporte** | **Hecho** | Endpoint `POST /api/v1/tickets`. Requiere al menos una categoría válida y valida que el equipo pertenezca al cliente. Estado inicial `Abierto`, prioridad por defecto `Media`, evento inicial en historial. |
| **RF-10** | **Listado y filtrado de tickets por rol** | **Hecho** | `GET /api/v1/tickets` con filtrado estricto: cliente solo ve los suyos, técnico solo los asignados, administrador ve todos con filtros por estado, prioridad y técnico. |
| **RF-11** | **Detalle integral, historial y comentarios** | **Hecho** | `GET /api/v1/tickets/{id}`, historial ordenado cronológicamente y comentarios con regla de privacidad: los clientes nunca ven notas internas ni pueden crearlas. |
| **RF-12** | **Asignación de técnico y prioridad** | **Hecho** | `PATCH /api/v1/tickets/{id}/asignar` por Administrador. Valida técnico activo y disponible (rechaza `Fuera_de_Servicio` con 400). Transición a `En_Proceso`. |
| **RF-13** | **Informe técnico de solución** | **Hecho** | `POST /api/v1/tickets/{id}/reporte` ejecutado por el técnico asignado. Valida solución no vacía, crea registro en `Reporte` y pasa ticket a `Resuelto`. |
| **RF-14** | **Calificación y cierre de tickets** | **Hecho** | `POST /api/v1/tickets/{id}/calificacion` por el cliente (puntuación 1 a 5) o cierre directo sin calificar con `PATCH /api/v1/tickets/{id}/estado`. Transición a `Cerrado`. |
| **RF-15** | **Notificaciones por correo electrónico (SMTP)** | **Pendiente** | Envío de correos automáticos ante eventos críticos mediante servidor SMTP diferido para Prioridad 3 (P3). |
| **RF-16** | **Notificaciones internas en plataforma** | **Hecho** | Modelo `Notificacion`, servicio `notificar` y endpoints `GET /api/v1/notificaciones`, `PATCH .../leida`. Disparos automáticos en creación, asignación, comentarios, resolución, cierre y alertas de baja calificación ($\le$ 2 estrellas). Campana interactiva en `Layout.jsx`. |
| **RF-17** | **Reportes estadísticos y métricas** | **Parcial** | Servicio `reporte_service.py` con los 5 informes agregados en JSON (`por_agente`, `por_prioridad`, `tiempos_resolucion`, `estado_general`, `incidencias_area_categoria`) y dashboard del administrador conectado. Exportación a PDF y Excel pendiente para P3. |
| **RF-18** | **Supervisión de calificaciones y feedback** | **Hecho** | `GET /api/v1/calificaciones` con filtros por técnico, puntuación y rango de fechas. Vista 20 (`CalificacionesRecibidas.jsx`) conectada a la API real. |

---

## 2. Lista de Pendientes por Prioridad

### 2.1 Prioridad 3 (P3 - Mejoras funcionales pendientes)
1. **Adjuntos de evidencia en tickets (RF-08):**
   - Endpoint `POST /api/v1/tickets/{id}/adjuntos`.
   - Soporte para multipart/form-data con validación de MIME types (`image/jpeg`, `image/png`, `application/pdf`) y límite de 5 MB.
   - Restricción de máximo 3 adjuntos por ticket. Almacenamiento seguro en disco o bucket con nombres sanitizados (UUID).
2. **Servicio de correo electrónico SMTP (RF-15):**
   - Configuración de credenciales SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`) en `.env`.
   - Servicio asíncrono en background para envío de plantillas HTML: confirmación de registro, link de recuperación de contraseña con token temporal, y notificación de ticket resuelto.
3. **Exportación de reportes a PDF y Excel (RF-17):**
   - Integración de `openpyxl` para exportación de hojas de cálculo con el detalle de tickets y tiempos.
   - Integración de `reportlab` o `weasyprint` para generación de informes ejecutivos en PDF.
4. **Alerta de tickets estancados (> 8 horas):**
   - Tarea programada (scheduler/cron) que evalúe tickets en estado `Abierto` por más de 8 horas hábiles sin asignación y emita alerta crítica al administrador.
5. **Edición dinámica de disponibilidad técnica (HU-SOP-01):**
   - Endpoint para que el técnico pueda alternar su disponibilidad entre `Disponible` y `En_Almuerzo` desde su interfaz sin intervención del administrador.
6. **Tablero Kanban interactivo:**
   - Tablero arrastrable con drag-and-drop para mover tickets entre estados respetando las reglas de la máquina de estados.

### 2.2 Tareas fuera del alcance formativo (Infraestructura y Producción)
1. **Despliegue en VPS (Producción):**
   - Configuración de servidor Ubuntu Server 22.04 LTS.
   - Configuración de servidor web Nginx como reverse proxy para FastAPI (puerto 8000) y archivos estáticos de React.
   - Certificados SSL/TLS gratuitos mediante Certbot (Let's Encrypt).
   - Daemonización y persistencia con `systemd` para Uvicorn y autoarranque tras reinicios.
2. **Pruebas de estrés y concurrencia:**
   - Creación de escenarios de carga con **Locust** o **k6** para validar tiempos de respuesta bajo 100 usuarios concurrentes.
3. **Documentación final:**
   - Manual Técnico de Arquitectura.
   - Manual de Instalación y Despliegue en Servidor.
   - Manual de Usuario final por rol (Administrador, Técnico, Cliente).

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
