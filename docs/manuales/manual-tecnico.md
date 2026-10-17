# Manual Técnico de Arquitectura y Desarrollo — SistemasAR

**Versión:** 2.0  
**Fecha:** Octubre 2026  
**Sistema:** Mesa de Ayuda y Gestión de Tickets de Soporte Técnico  
**Equipo:** Teylork (Líder Técnico & BD), Cristian (Backend Tickets & Pruebas), Magleony (Backend Cuentas & Flujos), Vidal (Frontend Cuentas & Catálogos), Jaider (Frontend Tickets & Layout).

---

## 1. Visión General del Sistema y Arquitectura

SistemasAR es una plataforma web integral bajo el modelo cliente-servidor orientada a la gestión, atención y resolución de incidencias tecnológicas en hardware y software.

```
                    ┌──────────────────────────────────────────┐
                    │            Nginx (Reverse Proxy)         │
                    │   SSL / TLS 1.3 · Rate Limiting · HSTS   │
                    └─────────────────────┬────────────────────┘
                                          │
                  ┌───────────────────────┴────────────────────────┐
                  ▼                                                ▼
     ┌─────────────────────────┐                      ┌─────────────────────────┐
     │  Frontend SPA (React)   │                      │  Backend API (FastAPI)  │
     │  Vite · Vanilla CSS     │                      │  Uvicorn (2 workers)    │
     │  React Router v6        │                      │  Python 3.10+           │
     └─────────────────────────┘                      └────────────┬────────────┘
                                                                   │
                                                ┌──────────────────┴──────────────────┐
                                                ▼                                     ▼
                                   ┌─────────────────────────┐           ┌─────────────────────────┐
                                   │  MySQL 8.0 (Relacional) │           │  Servidor SMTP / Disco  │
                                   │  14 tablas · InnoDB     │           │  Emails · Evidencias    │
                                   └─────────────────────────┘           └─────────────────────────┘
```

### 1.1 Principios Arquitectónicos
1. **Separación de Responsabilidades:** Frontend desacoplado servido como Single Page Application (SPA) y Backend expuesto mediante API RESTful sin estado (*stateless*).
2. **Defensa en Profundidad:** Validación estricta en frontend (UX) y backend (Pydantic v2), consultas parametrizadas con ORM SQLAlchemy, tokens JWT con rotación y verificación de huella (*fingerprint*).
3. **Resiliencia Operativa:** Fallback transparente en servicios auxiliares (el sistema opera con normalidad si el SMTP no está configurado), neutralización de inyección de fórmulas en exportaciones y contención de excepciones HTTP estandarizadas.

---

## 2. Estructura de Módulos del Proyecto

### 2.1 Backend (`/backend`)
Organizado siguiendo patrones de arquitectura limpia y modular de FastAPI:
- `app/core/`: Configuración centralizada vía Pydantic Settings (`config.py`), seguridad y criptografía con `bcrypt` y `PyJWT` (`security.py`), y dependencias de autenticación/RBAC (`dependencies.py`).
- `app/db/`: Inicialización del motor SQLAlchemy, sesión `SessionLocal` y Base declarativa (`session.py`, `base.py`).
- `app/models/`: Declaración ORM de las 14 entidades relacionales reflejando exactamente el DDL de `mibasededatos.sql`.
- `app/schemas/`: Esquemas de entrada y salida (DTOs) con validaciones de tipo, longitud y restricciones semánticas con Pydantic v2.
- `app/routers/`: Controladores de endpoints agrupados por dominio:
  - `auth.py`: Autenticación, rotación de tokens, `/me`, recuperación y restablecimiento de contraseña.
  - `usuarios.py`: Gestión administrativa de usuarios, roles y contraseñas.
  - `equipos.py`: Catálogo de hardware por cliente con validación de unicidad de serial.
  - `categorias.py`: Catálogo de servicios técnicos.
  - `tickets.py`: Ciclo de vida de tickets, asignación, comentarios, reportes de solución, calificación y adjuntos de evidencia.
  - `reportes.py`: Agregaciones analíticas y exportación a PDF y Excel.
  - `calificaciones.py`: Supervisión y auditoría del feedback de clientes.
  - `notificaciones.py`: Consulta y marcado de notificaciones en plataforma.
- `app/services/`: Capa de lógica de negocio transaccional:
  - `ticket_service.py`: Transiciones de estado, reglas de asignación y cálculo de métricas.
  - `notificacion_service.py`: Generación automática de notificaciones internas y disparo de correos.
  - `email_service.py`: Renderizado de plantillas HTML y despacho SMTP asíncrono con `BackgroundTasks`.
  - `exportacion_service.py`: Generación de libros Excel (`openpyxl`) y documentos PDF (`reportlab`) con neutralización de fórmulas.
  - `reporte_service.py`: Consultas estadísticas agregadas para los 5 informes clave.

### 2.2 Frontend (`/frontend`)
Desarrollado en React 18 con Vite:
- `src/api/`: Cliente Axios centralizado (`axios.js`) con interceptores para inyección automática del token Bearer y refresco transparente ante códigos 401.
- `src/context/`: `AuthContext.jsx` para gestión reactiva de la sesión, persistencia de tokens y datos del usuario logueado.
- `src/components/`: Componentes modulares reutilizables:
  - `Layout.jsx`: Barra de navegación responsive, campana interactiva de notificaciones y cierre de sesión.
  - `RutaProtegida.jsx`: Guardián de rutas que valida autenticación y permisos según el rol.
  - `SeccionAdjuntos.jsx`: Componente de carga y descarga de evidencias (.jpg, .png, .pdf) con barra de progreso y previsualización.
  - `Tabla.jsx`, `Modal.jsx`, `NotificacionesDropdown.jsx`.
- `src/pages/`: Vistas segmentadas por rol de usuario:
  - `auth/`: Login, Registro de clientes, Recuperación y Restablecimiento de contraseña.
  - `cliente/`: Panel principal, Creación de ticket, Detalle de ticket con adjuntos y calificación, Mis equipos.
  - `tecnico/`: Panel de tickets asignados, Detalle de atención con comentarios y reporte de solución, Calificaciones recibidas.
  - `admin/`: Dashboard analítico con gráficos y métricas, Gestión de usuarios, Gestión de categorías, Asignación de tickets, Auditoría de calificaciones, Exportación de reportes.
- `src/services/`: Conectores modulares a la API REST (`authService`, `ticketsService`, `reportesService`, `tecnicoService`, etc.).

---

## 3. Catálogo Exhaustivo de Endpoints de la API (`/api/v1`)

Todos los endpoints requieren cabecera `Authorization: Bearer <access_token>` excepto los marcados como **Público**.

### 3.1 Autenticación y Cuentas (`/api/v1/auth`)
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Público | Autenticación con correo y contraseña. Retorna access y refresh tokens. |
| `POST` | `/api/v1/auth/register` | Público | Auto-registro de clientes (rol `Cliente`). |
| `POST` | `/api/v1/auth/refresh` | Público | Renovación de access token mediante refresh token válido. |
| `GET` | `/api/v1/auth/me` | Autenticado | Retorna los datos y rol del usuario en sesión. |
| `POST` | `/api/v1/auth/recuperar` | Público | Solicita enlace de recuperación de contraseña (anti-enumeración). |
| `POST` | `/api/v1/auth/restablecer` | Público | Restablece contraseña mediante token JWT de un solo uso con huella criptográfica. |

### 3.2 Gestión de Usuarios (`/api/v1/usuarios`)
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/usuarios` | Admin | Lista usuarios con filtros por rol y estado. |
| `POST` | `/api/v1/usuarios` | Admin | Crea un nuevo usuario (Cliente, Técnico o Admin). |
| `GET` | `/api/v1/usuarios/{id}` | Admin | Detalle completo de un usuario. |
| `PUT` | `/api/v1/usuarios/{id}` | Admin | Actualiza información, rol o estado del usuario. |

### 3.3 Catálogos: Equipos y Categorías
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/equipos` | Autenticado | Lista equipos (clientes ven solo los propios; admin ve todos). |
| `POST` | `/api/v1/equipos` | Cliente, Admin | Registra un nuevo equipo validando serial único. |
| `GET` | `/api/v1/categorias` | Autenticado | Lista categorías de soporte disponibles. |
| `POST` | `/api/v1/categorias` | Admin | Crea una nueva categoría de servicio. |
| `PUT` | `/api/v1/categorias/{id}` | Admin | Modifica el nombre o descripción de una categoría existente. |

### 3.4 Tickets de Soporte (`/api/v1/tickets`)
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/tickets` | Autenticado | Listado filtrado según rol (Cliente: propios; Técnico: asignados; Admin: todos). |
| `POST` | `/api/v1/tickets` | Cliente, Admin | Creación de ticket en estado `Abierto` con categorías asociadas. |
| `GET` | `/api/v1/tickets/{id}` | Autenticado | Consulta integral del ticket, historial y comentarios según permisos. |
| `PATCH` | `/api/v1/tickets/{id}/asignar` | Admin | Asigna técnico y prioridad al ticket; cambia estado a `En_Proceso`. |
| `POST` | `/api/v1/tickets/{id}/comentarios` | Autenticado | Agrega comentario (clientes solo públicos; técnicos y admin pueden agregar internos). |
| `POST` | `/api/v1/tickets/{id}/reporte` | Técnico | Registra informe técnico de solución; cambia estado a `Resuelto`. |
| `POST` | `/api/v1/tickets/{id}/calificacion` | Cliente | Registra calificación de satisfacción (1-5 estrellas); cambia estado a `Cerrado`. |
| `PATCH` | `/api/v1/tickets/{id}/estado` | Admin, Cliente | Cierre directo o transición forzada de estado. |

### 3.5 Adjuntos de Evidencia (`/api/v1/tickets/{id}/adjuntos`)
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/v1/tickets/{id}/adjuntos` | Autenticado | Sube archivo de evidencia (máx. 3 por ticket, máx. 5 MB c/u, JPG/PNG/PDF). |
| `GET` | `/api/v1/tickets/{id}/adjuntos` | Autenticado | Lista metadatos de los adjuntos asociados al ticket. |
| `GET` | `/api/v1/tickets/{id}/adjuntos/{id_adjunto}/descargar` | Autenticado | Descarga segura del archivo con validación estricta de pertenencia (anti-IDOR). |

### 3.6 Reportes y Métricas (`/api/v1/reportes`)
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/reportes/{tipo_informe}` | Admin | Consulta agregada en formato JSON para dashboards. |
| `GET` | `/api/v1/reportes/{tipo_informe}/exportar` | Admin | Exportación descargable en formato Excel (`.xlsx`) o PDF (`.pdf`). |

Tipos de informe soportados: `por_agente`, `por_prioridad`, `tiempos_resolucion`, `estado_general`, `incidencias_area_categoria`.

### 3.7 Notificaciones y Calificaciones
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/v1/notificaciones` | Autenticado | Lista notificaciones dirigidas al usuario en sesión. |
| `PATCH` | `/api/v1/notificaciones/{id}/leida` | Autenticado | Marca una notificación específica como leída. |
| `GET` | `/api/v1/calificaciones` | Admin, Técnico | Consulta calificaciones emitidas por los clientes. |

---

## 4. Diccionario de Datos (14 Tablas Relacionales MySQL 8.0)

El esquema implementado en `database/mibasededatos.sql` cuenta con 14 tablas relacionales:

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Usuario   │──────<│   Cliente   │──────<│   Equipo    │
└──────┬──────┘       └─────────────┘       └──────┬──────┘
       │                                           │
       │              ┌─────────────┐              │
       ├─────────────<│   Tecnico   │              │
       │              └──────┬──────┘              │
       │                     │                     │
       │              ┌──────┴──────┐              │
       └─────────────<│Administrador│              │
                      └─────────────┘              │
                             │                     │
                             ▼                     ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  Categoria  │──────<│   Ticket    │>──────│   Adjunto   │
└─────────────┘       └──────┬──────┘       └─────────────┘
                             │
     ┌──────────────┬────────┼──────────────┬──────────────┐
     ▼              ▼        ▼              ▼              ▼
┌─────────┐   ┌───────────┐ ┌─────────┐   ┌────────────┐ ┌──────────────┐
│Historial│   │Comentario │ │ Reporte │   │Calificacion│ │ Notificacion │
└─────────┘   └───────────┘ └─────────┘   └────────────┘ └──────────────┘
```

### 4.1 `Usuario`
Almacena las credenciales y datos maestros transversales a todos los roles.
- `id_usuario`: INT AUTO_INCREMENT PRIMARY KEY.
- `nombre`: VARCHAR(100) NOT NULL.
- `apellido`: VARCHAR(100) NOT NULL.
- `correo_electronico`: VARCHAR(150) NOT NULL UNIQUE.
- `contrasena_hash`: VARCHAR(255) NOT NULL.
- `rol`: ENUM('Cliente', 'Tecnico', 'Administrador') NOT NULL.
- `estado`: ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo'.
- `fecha_creacion`: DATETIME DEFAULT CURRENT_TIMESTAMP.

### 4.2 `Cliente`
Especialización del rol Cliente.
- `id_cliente`: INT PRIMARY KEY, FK -> `Usuario(id_usuario)` ON DELETE CASCADE.
- `telefono`: VARCHAR(20).
- `direccion`: VARCHAR(200).
- `empresa`: VARCHAR(100).

### 4.3 `Tecnico`
Especialización del rol Técnico de soporte.
- `id_tecnico`: INT PRIMARY KEY, FK -> `Usuario(id_usuario)` ON DELETE CASCADE.
- `especialidad`: VARCHAR(100).
- `estado_disponibilidad`: ENUM('Disponible', 'En_Almuerzo', 'Fuera_de_Servicio') NOT NULL DEFAULT 'Disponible'.

### 4.4 `Administrador`
Especialización del rol Administrador.
- `id_admin`: INT PRIMARY KEY, FK -> `Usuario(id_usuario)` ON DELETE CASCADE.
- `nivel_acceso`: VARCHAR(50) DEFAULT 'Total'.

### 4.5 `Equipo`
Equipos tecnológicos registrados por clientes.
- `id_equipo`: INT AUTO_INCREMENT PRIMARY KEY.
- `id_cliente`: INT NOT NULL, FK -> `Cliente(id_cliente)` ON DELETE CASCADE.
- `tipo_equipo`: VARCHAR(50) NOT NULL.
- `marca`: VARCHAR(50) NOT NULL.
- `modelo`: VARCHAR(50) NOT NULL.
- `serial`: VARCHAR(100) NOT NULL UNIQUE.
- `fecha_registro`: DATETIME DEFAULT CURRENT_TIMESTAMP.

### 4.6 `Categoria`
Catálogo de áreas o tipologías de soporte.
- `id_categoria`: INT AUTO_INCREMENT PRIMARY KEY.
- `nombre_categoria`: VARCHAR(100) NOT NULL UNIQUE.
- `descripcion`: TEXT.

### 4.7 `Ticket`
Entidad principal del sistema que modela la incidencia técnica.
- `id_ticket`: INT AUTO_INCREMENT PRIMARY KEY.
- `id_cliente`: INT NOT NULL, FK -> `Cliente(id_cliente)`.
- `id_tecnico`: INT NULL, FK -> `Tecnico(id_tecnico)`.
- `id_equipo`: INT NULL, FK -> `Equipo(id_equipo)`.
- `titulo`: VARCHAR(150) NOT NULL.
- `descripcion`: TEXT NOT NULL.
- `prioridad`: ENUM('Baja', 'Media', 'Alta', 'Critica') NOT NULL DEFAULT 'Media'.
- `estado`: ENUM('Abierto', 'En_Proceso', 'Resuelto', 'Cerrado') NOT NULL DEFAULT 'Abierto'.
- `modalidad`: ENUM('Remoto', 'Presencial') NOT NULL DEFAULT 'Remoto'.
- `fecha_creacion`: DATETIME DEFAULT CURRENT_TIMESTAMP.
- `fecha_cierre`: DATETIME NULL.

### 4.8 `Ticket_Categoria`
Relación muchos a muchos entre tickets y categorías de soporte.
- `id_ticket`: INT NOT NULL, FK -> `Ticket(id_ticket)` ON DELETE CASCADE.
- `id_categoria`: INT NOT NULL, FK -> `Categoria(id_categoria)`.
- PRIMARY KEY (`id_ticket`, `id_categoria`).

### 4.9 `Historial_Estado`
Pista de auditoría cronológica de los cambios de estado del ticket.
- `id_historial`: INT AUTO_INCREMENT PRIMARY KEY.
- `id_ticket`: INT NOT NULL, FK -> `Ticket(id_ticket)` ON DELETE CASCADE.
- `id_usuario`: INT NOT NULL, FK -> `Usuario(id_usuario)`.
- `estado_anterior`: ENUM('Abierto', 'En_Proceso', 'Resuelto', 'Cerrado') NULL.
- `estado_nuevo`: ENUM('Abierto', 'En_Proceso', 'Resuelto', 'Cerrado') NOT NULL.
- `motivo_cambio`: TEXT.
- `fecha_cambio`: DATETIME DEFAULT CURRENT_TIMESTAMP.

### 4.10 `Comentario`
Mensajes, respuestas y notas técnicas en la atención del ticket.
- `id_comentario`: INT AUTO_INCREMENT PRIMARY KEY.
- `id_ticket`: INT NOT NULL, FK -> `Ticket(id_ticket)` ON DELETE CASCADE.
- `id_usuario`: INT NOT NULL, FK -> `Usuario(id_usuario)`.
- `mensaje`: TEXT NOT NULL.
- `es_interno`: BOOLEAN NOT NULL DEFAULT FALSE.
- `fecha_comentario`: DATETIME DEFAULT CURRENT_TIMESTAMP.

### 4.11 `Reporte`
Informe formal de resolución redactado por el técnico.
- `id_reporte`: INT AUTO_INCREMENT PRIMARY KEY.
- `id_ticket`: INT NOT NULL UNIQUE, FK -> `Ticket(id_ticket)` ON DELETE CASCADE.
- `id_tecnico`: INT NOT NULL, FK -> `Tecnico(id_tecnico)`.
- `diagnostico`: TEXT NOT NULL.
- `solucion`: TEXT NOT NULL.
- `fecha_reporte`: DATETIME DEFAULT CURRENT_TIMESTAMP.

### 4.12 `Calificacion`
Evaluación de satisfacción del cliente al cierre del servicio.
- `id_calificacion`: INT AUTO_INCREMENT PRIMARY KEY.
- `id_ticket`: INT NOT NULL UNIQUE, FK -> `Ticket(id_ticket)` ON DELETE CASCADE.
- `puntuacion`: INT NOT NULL CHECK (`puntuacion` BETWEEN 1 AND 5).
- `comentarios`: TEXT.
- `fecha_calificacion`: DATETIME DEFAULT CURRENT_TIMESTAMP.

### 4.13 `Notificacion`
Alertas en plataforma para usuarios ante eventos de interés.
- `id_notificacion`: INT AUTO_INCREMENT PRIMARY KEY.
- `id_usuario`: INT NOT NULL, FK -> `Usuario(id_usuario)` ON DELETE CASCADE.
- `id_ticket`: INT NULL, FK -> `Ticket(id_ticket)` ON DELETE CASCADE.
- `mensaje`: VARCHAR(255) NOT NULL.
- `leida`: BOOLEAN NOT NULL DEFAULT FALSE.
- `fecha_notificacion`: DATETIME DEFAULT CURRENT_TIMESTAMP.

### 4.14 `Adjunto`
Archivos de evidencia física o visual vinculados al ticket.
- `id_adjunto`: INT AUTO_INCREMENT PRIMARY KEY.
- `id_ticket`: INT NOT NULL, FK -> `Ticket(id_ticket)` ON DELETE CASCADE.
- `nombre_archivo`: VARCHAR(255) NOT NULL.
- `ruta_archivo`: VARCHAR(500) NOT NULL.
- `tipo_mime`: VARCHAR(100) NOT NULL.
- `tamano_bytes`: INT NOT NULL.
- `fecha_subida`: DATETIME DEFAULT CURRENT_TIMESTAMP.

---

## 5. Matriz de Control de Acceso Basada en Roles (RBAC)

| Módulo / Acción | Cliente | Técnico | Administrador |
|---|:---:|:---:|:---:|
| Iniciar sesión / Cerrar sesión / Recuperar contraseña | Sí | Sí | Sí |
| Ver perfil propio (`/auth/me`) | Sí | Sí | Sí |
| Registrar y gestionar equipos propios | Sí | No | Sí (todos) |
| Crear ticket de soporte con adjuntos | Sí | No | Sí |
| Ver listado de tickets | Solo propios | Solo asignados | Todos |
| Ver detalle de ticket y comentarios públicos | Solo propios | Solo asignados | Todos |
| Ver y crear comentarios internos (`es_interno=true`) | **Bloqueado** | Sí | Sí |
| Subir y descargar adjuntos de evidencia | Solo de sus tickets | Solo de asignados | Todos |
| Asignar técnico y prioridad a tickets | No | No | Sí |
| Registrar informe técnico de solución | No | Solo asignado | Sí |
| Calificar servicio (1-5 estrellas) | Solo tickets propios | No | No |
| Consultar calificaciones y feedback | No | Solo las suyas | Todas |
| Exportar reportes analíticos (PDF / Excel) | No | No | Sí |
| Administrar usuarios y catálogo de categorías | No | No | Sí |

---

## 6. Arquitectura de Seguridad Implementada

1. **Autenticación Robusta:** Tokens JWT emitidos con algoritmo HMAC-SHA256 (`HS256`). Los access tokens tienen vigencia de 60 minutos; los refresh tokens duran 7 días.
2. **Restablecimiento Criptográfico de Contraseña:** Generación de JWT de tipo `reset` con 30 minutos de vida que incrusta una huella (*fingerprint*) de los primeros 16 caracteres del hash actual. Al usarse o alterarse la contraseña, el token queda automáticamente invalidado sin requerir columnas adicionales en la BD.
3. **Protección Anti-Enumeración y Rate Limiting:** La recuperación responde con el mismo mensaje genérico exista o no el correo electrónico. Se aplica limitación en memoria y en Nginx para mitigar ataques de fuerza bruta.
4. **Almacenamiento Seguro de Evidencias:** Los nombres de archivo se sanitizan reemplazándose por UUIDv4 en disco. Se validan extensiones y tipos MIME (`image/jpeg`, `image/png`, `application/pdf`) y se restringe el tamaño a 5 MB por archivo con un máximo de 3 adjuntos por ticket.
5. **Mitigación de Inyección de Fórmulas en Hojas de Cálculo (CSV/Excel):** Todos los valores de texto en exportaciones son prefijados con comilla simple (`'`) si inician con `=, +, -, @` para evitar la ejecución arbitraria de comandos en Microsoft Excel o LibreOffice Calc.
6. **Políticas de Seguridad en Cabeceras HTTP:** HSTS (HTTP Strict Transport Security) con expiración de 2 años, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` y `Referrer-Policy: strict-origin-when-cross-origin`.
