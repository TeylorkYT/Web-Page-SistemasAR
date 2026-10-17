# Plantilla de Registro de Hallazgos — Teylork
**Rol:** Tester asignado a **Vistas del Cliente** (Mockups de Vidal)  
**Rama probada:** `qa/pruebas-calidad-teylork` (base `develop`)  
**Fecha:** 16 de Octubre de 2026  
**Tester:** Teylork  

---

## 1. Registro de Hallazgos

| # | Vista y ruta | Tipo | Qué hice | Qué esperaba | Qué pasó o qué falta | Gravedad | Estado / Evidencia |
|---|---|---|---|---|---|---|---|
| 1 | `DashboardCliente` (`/cliente`) | **Falla** | Clic en el botón `+ Nuevo Ticket` | Navegar a la creación de ticket (`/cliente/tickets/nuevo`) | Apuntaba a `/cliente/crear`, provocando redirección fallida | **Alta** | **Corregido** (`DashboardCliente.jsx:53`) |
| 2 | `DashboardCliente` y `PerfilCliente` | **Organizar** | Carga de datos del cliente | Usar la identidad del usuario autenticado (token/contexto) | Parámetro `(1)` quemado con comentario `Simulamos ser Laura` | **Media** | **Corregido** (`DashboardCliente.jsx:13`, `PerfilCliente.jsx:15`) |
| 3 | Backend `auth/me` / `PerfilCliente` | **Falta** | Cargar tarjeta de información del cliente | Mostrar teléfono, dirección y departamento | El endpoint `/me` no consultaba los atributos de la tabla `Cliente` | **Media** | **Corregido** (`auth.py:141-157`) |
| 4 | `PerfilCliente` (`/cliente/perfil`) | **Falta** | Clic en `Editar Perfil` y `+ Añadir Equipo` | Abrir modal o permitir edición | Botones con propiedad `deshabilitado` fija sin interactividad | **Media** | **Anotado** (`PerfilCliente.jsx:79, 91`) |
| 5 | `CrearTicket` / Backend API | **Falla** | Enviar creación de ticket (`POST /tickets`) | Crear el ticket en base de datos con código 201 | Error 500 por columnas faltantes en MySQL (`modalidad`, default de `fecha_creacion` y `leida` en `Notificacion`) | **Alta** | **Corregido** (`Ticket`, `Notificacion`, `ticket_service.py`) |
| 6 | `CrearTicket` (`/cliente/tickets/nuevo`) | **Falla** | Ingresar título extenso en formulario | Límite consistente con la base de datos | Tenía `maxLength={120}`, pero el backend rechaza con 422 si supera 100 caracteres | **Media** | **Corregido** (`CrearTicket.jsx:153`) |
| 7 | `CrearTicket` (`/cliente/tickets/nuevo`) | **Falta** | Registrar ticket seleccionando equipo y modalidad | Poder elegir modalidad (*Presencial* / *Remoto*) y equipo asociado | Faltaban los campos de selección en el formulario | **Media** | **Corregido** (`CrearTicket.jsx:158-185`) |
| 8 | `MisTickets` (`/cliente/tickets`) | **Organizar** | Revisar visualización de fechas y búsqueda | Fechas en formato amigable y búsqueda rápida | Fechas en ISO crudo y ausencia de buscador por texto | **Media** | **Corregido** (`MisTickets.jsx:15-60`) |
| 9 | `DetalleTicketCliente` (`/cliente/tickets/:id`) | **Falta** | Ver comunicación con técnico | Lista de comentarios y caja para responder | La vista no renderizaba comentarios ni permitía al cliente comentar | **Alta** | **Corregido** (`DetalleTicketCliente.jsx:180-220`) |
| 10 | `DetalleTicketCliente` / Backend API | **Falla** | Enviar comentario del cliente | Registrar comentario en base de datos (201) | Error 500 por falta de la columna `es_nota_interna` en tabla MySQL `Comentario` | **Alta** | **Corregido** (`Comentario.es_nota_interna`) |
| 11 | `DetalleTicketCliente` (`/cliente/tickets/:id`) | **Falta** | Consultar datos de atención y cierre | Ver técnico asignado, equipo y solución técnica | No mostraba técnico ni solución aplicada del reporte | **Media** | **Corregido** (`DetalleTicketCliente.jsx:100-140`) |
| 12 | `CalificarTicket` (`/cliente/tickets/:id/calificar`) | **Falla** | Acceder a calificar con ticket Abierto | Bloquear o guiar al usuario si el ticket no está resuelto | Permitía llenar formulario y fallaba con 400 sin explicar el motivo | **Media** | **Corregido** (`CalificarTicket.jsx:45-100`) |
| 13 | Vistas del Cliente (Transversal) | **Organizar** | Carga del menú y encabezado | Pasar propiedades explícitas al `Layout` (`rol`, `itemActivo`, `nombreUsuario`) | Se instanciaba `<Layout>` genérico sin propiedades | **Baja** | **Corregido** (Todas las vistas) |

---

## 2. Resumen por Vista

| Vista y ruta | Carga | Diseño | Funciones | Casos límite | Total Falta | Total Falla | Total Organizar | Estado general |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Dashboard Cliente** (`/cliente`) | Sí | Sí | Sí | Sí | 0 | 1 | 2 | **Lista** (ajustes aplicados) |
| **Perfil del Cliente** (`/cliente/perfil`) | Sí | Sí | Sí | Sí | 2 | 0 | 2 | **Con ajustes** (botones edición pendientes) |
| **Crear Ticket Nuevo** (`/cliente/tickets/nuevo`) | Sí | Sí | Sí | Sí | 1 | 2 | 1 | **Lista** (ajustes aplicados) |
| **Listado de Mis Tickets** (`/cliente/tickets`) | Sí | Sí | Sí | Sí | 0 | 0 | 2 | **Lista** (ajustes aplicados) |
| **Detalle del Ticket** (`/cliente/tickets/:id`) | Sí | Sí | Sí | Sí | 2 | 1 | 1 | **Lista** (ajustes aplicados) |
| **Calificar Ticket** (`/cliente/tickets/:id/calificar`) | Sí | Sí | Sí | Sí | 1 | 1 | 1 | **Lista** (ajustes aplicados) |

---

## 3. Estado de la Entrega (Teylork)
* **Bloque asignado:** Vistas del Cliente (6 vistas).
* **Vistas revisadas:** 6 / 6 (100%).
* **Total hallazgos documentados:** 13 hallazgos (4 Faltas, 5 Fallas, 4 Organizar).
* **Ajustes y correcciones críticas implementadas:** 12 / 13 resueltos y verificados con pruebas automatizadas (`pytest` 65/65 aprobadas, `npm run build` exitoso).
