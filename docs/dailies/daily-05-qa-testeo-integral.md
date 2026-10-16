# DAILY 05 · QA y Testeo Integral · SistemasAR (rama `develop`)

> **Formato para agente IA.** Lee de arriba hacia abajo. Cada tarea tiene ID, pasos y resultado esperado.
> Fecha de auditoría: 2026-10-16 · Commit base auditado: `3c1b5fc` (merge PR #28) · Verificado clonando el repo.

## 0. REGLAS PARA EL AGENTE (leer primero)

1. **No inventes.** Si dudas de un endpoint, campo o regla: abre el archivo (`backend/app/routers/*.py`, `services/*.py`, `schemas/*.py`) o `database/mibasededatos.sql` y confirma.
2. Fuente de verdad: **código en `develop`** > `docs/PENDIENTES.md` > Documento Definitivo v2.0. Si difieren, repórtalo como *desfase*, no lo "arregles" en silencio.
3. Todo fallo → issue/commit en rama `fix/<id>-<tema>`, PR pequeño hacia `develop`. Nunca commit directo a `develop` ni `main`.
4. Cada corrección lleva **test de regresión** (pytest) o caso manual documentado.
5. Prohibido: `DROP`/`TRUNCATE`/`DELETE` sin `WHERE` en BD compartida. No subir `.env` ni secretos.
6. Dependencias: `requirements.txt` → Cristian · `package.json` → Jaider (pedirles el cambio).
7. Reporta cada ejecución con: `ID · PASS/FAIL · evidencia (status HTTP / captura / log)`.

### Comandos base
```bash
# Backend
cd backend && python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt email-validator python-multipart
pytest -q                                   # SQLite en memoria (debe dar 37 passed)
# Contra MySQL real (obligatorio una vez): definir TEST_DB_HOST/USER/PASSWORD/NAME en .env y repetir pytest
uvicorn app.main:app --reload               # http://localhost:8000/docs

# Frontend
cd frontend && npm ci && npm run lint && npm run build && npm run dev   # http://localhost:5173
```
Cuentas (clave `Prueba123*`): `admin@prueba.com` · `tecnico@prueba.com` · `cliente@prueba.com` · `inactivo@prueba.com`.

---

## 1. MAPA DEL PROYECTO (resumen verificado)

| Capa | Contenido real en `develop` |
|---|---|
| BD | MySQL 8, esquema `sistemas_ar`, 14 tablas, `database/{mibasededatos,datos_prueba,permisos_dcl_produccion}.sql` |
| Backend | FastAPI + SQLAlchemy 2 + Pydantic v2 + PyJWT + bcrypt. Prefijo `/api/v1`. Routers: `auth, usuarios, categorias, equipos, tecnicos, tickets, tickets_flujo, calificaciones, notificaciones, reportes` + `/`, `/health`, `/db-check` |
| Frontend | React 19 + Vite 8 + Router 7 + Axios. 20 vistas: auth(3), cliente(6), técnico(4), admin(7), `Indice`, `Estado` |
| Roles | `cliente`, `tecnico`, `administrador` (backend devuelve rol en minúscula en login/me) |
| Máquina de estados | `Abierto →(asignar) En_Proceso →(reporte) Resuelto →(calificar/cerrar) Cerrado` |

### Endpoints y guardas (base de los tests)
| Método · Ruta | Rol permitido |
|---|---|
| POST `/auth/register` `/auth/login` `/auth/refresh` `/auth/recuperar` · GET `/auth/me` | público (me: autenticado) |
| GET/POST/PUT `/usuarios` | Administrador |
| GET `/tecnicos` | Administrador |
| GET `/categorias` · POST/PUT | autenticado · Administrador |
| GET `/equipos` · POST/PUT | autenticado · Cliente y Administrador |
| POST `/tickets` | Cliente |
| GET `/tickets`, `/tickets/{id}`, `/historial`, `/comentarios`, POST `/comentarios` | autenticado (filtrado por rol) |
| PATCH `/tickets/{id}/asignar` | Administrador |
| PATCH `/tickets/{id}/estado` (solo `Cerrado`) | Cliente dueño o Administrador |
| POST `/tickets/{id}/reporte` | Técnico asignado |
| POST `/tickets/{id}/calificacion` | Cliente dueño |
| GET `/calificaciones` · GET `/reportes/{tipo}` | Administrador |
| GET `/notificaciones` · PATCH `/notificaciones/{id}/leida` | autenticado (solo propias) |

---

## 2. HALLAZGOS DE LA AUDITORÍA

### 2.1 Corregidos en esta sesión (patch `auditoria-qa.patch`, 37 tests pasan, `npm run build` OK)
| ID | Sev | Hallazgo (reproducido) | Corrección |
|---|---|---|---|
| H-01 | Alta | `POST /auth/register` aceptaba `correo_electronico="abc"` (201) | Validador de correo + `strip().lower()` en registro, creación/edición admin y login (422 si inválido) |
| H-02 | Alta | Contraseña de 40×`ñ` (80 bytes) → `ValueError` de bcrypt → **HTTP 500** | Validación por **bytes** (≤72) → 422 |
| H-03 | Media | Nombre/apellido `"   "` aceptado | `strip_whitespace + min_length=1` |
| H-04 | Media | `GET /reportes/...?desde=basura` devolvía 200 sin filtrar (error silencioso) | 400 con mensaje claro |
| H-05 | Media | Login sensible a mayúsculas (`ADMIN@..` fallaba en SQLite, distinto a MySQL) | Normalización a minúsculas |
| H-06 | Media | `requirements.txt` en **UTF-16** (rompe herramientas/CI/Docker) | Convertido a UTF-8 |
| H-07 | Baja | README cita `backend/pytest.ini` que no existía | Creado |
| H-08 | Alta | `API_URL` fijo `http://127.0.0.1:8000` → el frontend no funciona en el VPS | `import.meta.env.VITE_API_URL` con fallback local |
| H-09 | Media | `PerfilCliente`: botones **Editar Perfil** y **+ Añadir Equipo** sin acción | Deshabilitados hasta implementarlos (ver T-J05) |

### 2.2 Pendientes (requieren decisión o trabajo del equipo)
| ID | Sev | Hallazgo | Dueño sugerido |
|---|---|---|---|
| P-01 | **Crítica** | `core/security.py` usa `JWT_SECRET` por defecto hardcodeado si falta en `.env` → tokens falsificables en producción | Teylork |
| P-02 | Alta | Tests corren en SQLite; producción es MySQL (ENUM, CHECK, collation, DATETIME). Riesgo de falsos verdes | Teylork + Cristian |
| P-03 | Alta | Frontend aún tiene **módulo Inventario** (rutas `/tecnico/inventario`, `/admin/inventario`, menú, `inventarioService`) con datos falsos; el alcance v2.0 lo excluye | Jaider |
| P-04 | Alta | `adminService.js` y `tecnicoService.js` mezclan API real con **memoria/datos falsos** (`datosFalsos.js`, `TECNICO_ACTUAL`, "servicios" con costo). Verificar qué vista usa qué | Vidal + Jaider |
| P-05 | Media | Doble envío de calificación: `UNIQUE(id_ticket)` lanza `IntegrityError` → posible 500 en vez de 409 (condición de carrera) | Cristian |
| P-06 | Media | Login de cuenta inactiva responde **403** "Cuenta inactiva"; README/PENDIENTES dicen **401** y además permite enumerar cuentas | Magleony |
| P-07 | Media | `/db-check` es público y da 500 sin controlar si la BD cae | Teylork |
| P-08 | Media | Tokens en `localStorage` (riesgo XSS) y `JSON.parse` sin `try/catch` en interceptor/`AuthContext` (sesión corrupta rompe la app) | Vidal |
| P-09 | Baja | `Indice` (menú de desarrollo) es la ruta `/`; falta landing/redirección por sesión | Jaider |
| P-10 | Baja | Doc dice React 18/Python 3.x; repo usa React 19/Vite 8/Python 3.10+. Actualizar documento | Teylork |
| P-11 | Info | Funciones **no implementadas** (P3 oficial): adjuntos RF-08, SMTP RF-15, exportar PDF/Excel RF-17, alerta >8h, disponibilidad técnica, Kanban drag&drop, límite 5 tickets simultáneos, recuperación real de contraseña | Todos |

---

## 3. REPARTO DEL TRABAJO (5 personas)

| # | Responsable | Área | Tareas |
|---|---|---|---|
| 1 | **Teylork** | BD, seguridad, infraestructura | T-T01 … T-T12 |
| 2 | **Cristian** | Backend tickets, flujo, notificaciones | T-C01 … T-C20 |
| 3 | **Magleony** | Backend cuentas, RBAC, catálogos, reportes | T-M01 … T-M18 |
| 4 | **Vidal** | Frontend auth, cuentas, catálogos, sesión | T-V01 … T-V16 |
| 5 | **Jaider** | Frontend tickets, dashboards, layout, UX | T-J01 … T-J18 |

Orden sugerido del día: **mañana** ejecutar tus tests y registrar PASS/FAIL → **tarde** corregir fallos (PR por hallazgo) → **cierre** reunión de 15 min con la tabla de resultados.

---

## 4. CASOS DE PRUEBA POR PERSONA

Formato: `ID · Acción → Esperado`

### 4.1 TEYLORK · BD, seguridad e infraestructura
- **T-T01** Ejecutar `mibasededatos.sql` en MySQL 8 limpio → 14 tablas, 0 errores, sin tabla Inventario.
- **T-T02** Ejecutar `datos_prueba.sql` → 4 usuarios con subtipo correcto (admin/tecnico/cliente/inactivo).
- **T-T03** Comparar tablas/columnas/ENUM del SQL vs `backend/app/models/*.py` → sin diferencias de nombre o tipo.
- **T-T04** Insertar `Adjunto_Ticket` con 5.242.881 bytes y mime `text/html` → rechazo por CHECK/ENUM.
- **T-T05** Insertar `Calificacion` con puntuación 0 y 6, y 2 calificaciones al mismo ticket → rechazo (CHECK / UNIQUE).
- **T-T06** Borrar un `Cliente` con tickets → verificar cascada esperada y que no queden huérfanos.
- **T-T07** Revisar `permisos_dcl_produccion.sql`: sin contraseñas débiles (`AdminPass123!`), mínimo privilegio por rol, `Historial_Ticket` sin UPDATE/DELETE para técnico/cliente.
- **T-T08** Correr `pytest` con `TEST_DB_*` apuntando a MySQL → los 37 tests pasan. Si alguno falla solo en MySQL, abrir issue (P-02).
- **T-T09** **(P-01)** Arrancar backend sin `JWT_SECRET` → debe **fallar al iniciar** en producción (implementar: `raise RuntimeError` si `ENV=production` y no hay secreto).
- **T-T10** Revisar `CORS_ORIGINS` de producción (solo `https://sistemasar.net`, sin `*`) y `.env` fuera de git (`git log --all -- .env` vacío).
- **T-T11** VPS: `ufw status` (solo 22/80/443), `nmap` externo no ve 8000/3306; Nginx con `limit_req`; `systemctl status sistemasar` reinicia tras `kill`; `certbot renew --dry-run` OK; backup `mysqldump` restaurable.
- **T-T12** Proteger/retirar `/db-check` en producción y manejar su error (P-07). Actualizar documentos (P-10).

### 4.2 CRISTIAN · Backend tickets, flujo y notificaciones
**Creación y lectura**
- **T-C01** Cliente crea ticket válido → 201, estado `Abierto`, prioridad `Media`, historial `Creacion`, notificación a cada admin activo.
- **T-C02** Crear sin categorías / categoría inexistente / título >100 / descripción vacía → 400/422.
- **T-C03** Crear con equipo de otro cliente → 400; equipo inexistente → 404.
- **T-C04** Técnico o admin intenta `POST /tickets` → 403. Sin token → 401.
- **T-C05** Listados por rol: cliente solo suyos; técnico solo asignados; admin todos. Filtros `estado`, `prioridad`, `id_tecnico` combinados.
- **T-C06** Detalle de ticket ajeno (cliente/técnico) → 404 (no 403, no fuga de existencia). ID inexistente → 404.
**Asignación**
- **T-C07** Admin asigna técnico → ticket `En_Proceso`, `id_asignado_por` correcto, historial `Asignacion`, notifica técnico y cliente.
- **T-C08** Asignar a técnico `Fuera_de_Servicio`, inactivo, inexistente o que es un cliente → 400.
- **T-C09** Asignar ticket `Resuelto`/`Cerrado` → 400. Reasignar en `En_Proceso` → permitido y registra historial.
- **T-C10** Cambiar prioridad al asignar (`Baja/Media/Alta/Critica`); valor inválido → 422.
**Reporte, cierre y calificación**
- **T-C11** Técnico asignado registra reporte → 201, ticket `Resuelto`, `fecha_resolucion` con hora, notifica cliente.
- **T-C12** Reporte con solución vacía/espacios → 400/422; técnico NO asignado → 403; ticket no `En_Proceso` → 400.
- **T-C13** Cliente califica 1–5 → ticket `Cerrado`, `fecha_cierre`; con 1 o 2 estrellas genera alerta extra a admins.
- **T-C14** Calificar 0, 6, texto, comentario >255 → 422. Calificar ticket ajeno → 404. Calificar ticket no `Resuelto` → 400.
- **T-C15** Doble calificación → 409. **(P-05)** Simular 2 peticiones simultáneas → debe responder 409 y no 500 (capturar `IntegrityError` + rollback).
- **T-C16** Cierre sin calificar (`PATCH /estado` con `Cerrado`) por cliente dueño y admin; por técnico → 403; con estado distinto a `Cerrado` → 422.
**Comentarios, historial, notificaciones**
- **T-C17** Cliente nunca ve ni crea notas internas (`es_nota_interna` forzado a `false`); técnico/admin sí.
- **T-C18** Historial en orden cronológico y completo tras flujo entero (Creacion→Asignacion→Resolucion→Cierre) con usuario correcto.
- **T-C19** Notificaciones: `GET` solo propias, `PATCH leida` de ajena → 404, idempotente al repetir.
- **T-C20** Flujo E2E por API (Swagger o script): crear → asignar → comentar → reporte → calificar; verificar BD y notificaciones en cada paso.

### 4.3 MAGLEONY · Backend cuentas, RBAC, catálogos y reportes
**Auth**
- **M01** Login correcto → `access_token`, `refresh_token`, `rol` en minúscula, `nombre`.
- **M02** Contraseña errónea / correo inexistente → 401 con mensaje genérico idéntico.
- **M03** `inactivo@prueba.com` → bloqueado. **(P-06)** Unificar a 401 genérico y documentar.
- **M04** `refresh` válido rota tokens; usar refresh como access (y viceversa) → 401; token expirado/manipulado → 401.
- **M05** Registro: correo duplicado (incluso con otras mayúsculas) → 409; contraseña <8 o >72 bytes → 422; campos obligatorios; (regresión H-01..H-03 ya cubierta).
- **M06** `/auth/recuperar` responde igual exista o no el correo (sin enumeración).
**Usuarios (admin)**
- **M07** CRUD completo para los 3 roles; el subtipo (Cliente/Tecnico/Administrador) se crea y actualiza.
- **M08** Admin no puede inactivarse a sí mismo (400). Inactivar a otro → su token deja de funcionar de inmediato (401).
- **M09** Editar correo a uno ya usado → 409. Cambiar contraseña desde admin y volver a iniciar sesión.
- **M10** Filtros `rol` y `estado` de `GET /usuarios`; rol/estado inválido → respuesta controlada (no 500).
**RBAC (matriz completa)**
- **M11** Para **cada** endpoint de la tabla §1 probar los 3 roles + sin token: esperado 200/201 solo para el rol permitido, 403 para otro rol, 401 sin token. Registrar matriz 3×N.
**Catálogos**
- **M12** Categorías: crear, nombre duplicado → 409, editar, vacío/ >50 → 422. Cliente/técnico no crean (403).
- **M13** Equipos: serial duplicado → 409; cliente solo ve y edita los suyos; admin crea para un `id_cliente` válido (inexistente → 404/400).
- **M14** `PUT /equipos` cambia `estado_equipo` (Operativo/En_Reparacion/Fuera_de_Servicio); valor inválido → 422.
**Reportes y calificaciones**
- **M15** Los 5 informes (`por_agente, por_prioridad, tiempos_resolucion, estado_general, incidencias_area_categoria`) con datos conocidos: cuadrar totales con consultas SQL directas.
- **M16** Filtro `desde/hasta` (fecha y datetime); `hasta` inclusivo del día completo; fecha inválida → 400 (H-04); tipo de informe inválido → 400.
- **M17** `GET /calificaciones` filtros por técnico, puntuación y rango; solo admin.
- **M18** Tiempos de resolución en **horas** correctos (ticket resuelto en tiempo conocido). Respuesta de reportes <3 s con ~1.000 tickets.

### 4.4 VIDAL · Frontend auth, cuentas, catálogos y sesión
**Login / Registro / Recuperar**
- **V01** `/login`: éxito redirige por rol (`/cliente`, `/tecnico`, `/admin`); error muestra mensaje; botón se bloquea durante la petición; Enter envía.
- **V02** Login inactivo y credenciales erróneas muestran mensaje claro, sin romper la página.
- **V03** `/registro`: validación visual de cada campo (correo inválido, clave corta, vacíos); éxito lleva a login; correo repetido muestra 409.
- **V04** `/recuperar`: envía y muestra mensaje estándar; correo vacío/ inválido validado. *(Correo real = P3, no marcar como falla.)*
- **V05** Enlaces entre las 3 pantallas (login↔registro↔recuperar) todos funcionan.
**Sesión y rutas**
- **V06** Recargar con sesión → se mantiene. Cerrar sesión borra `localStorage` y vuelve a `/login`.
- **V07** Sin sesión, abrir `/cliente`, `/tecnico`, `/admin/...` → redirige a `/login`.
- **V08** Cliente abre `/admin` → redirige a `/cliente`; técnico a `/cliente` → `/tecnico`; cada combinación de rol×ruta (matriz).
- **V09** Token vencido: peticiones renuevan con refresh de forma transparente; refresh inválido → limpia sesión y va a `/login` (sin bucle).
- **V10** Varias peticiones simultáneas con 401 → un solo `refresh` (variable `renovando`). **(P-08)** `localStorage` con JSON corrupto no debe dejar pantalla en blanco.
**Admin: usuarios y categorías**
- **V11** `/admin/usuarios`: listar, filtrar por rol/estado, crear (los 3 roles), editar, activar/inactivar, cambiar contraseña; errores 409/422 visibles.
- **V12** No poder inactivarse a sí mismo (mensaje visible). Campos específicos por rol (teléfono/dirección/área, especialidad/disponibilidad, cargo).
- **V13** `/admin/categorias`: crear, editar, duplicado → mensaje. **(P-04)** Verificar que "servicios"/costo/eliminar categoría no sean datos falsos presentados como reales; si lo son, ocultar o conectar.
- **V14** Modales: se cierran con Cancelar/X/Esc, no pierden datos al error, no dejan scroll bloqueado.
- **V15** Todos los botones de estas pantallas ejecutan acción o están deshabilitados con motivo (inventario de botones: pantalla · botón · resultado).
- **V16** Consola del navegador sin errores rojos; `npm run lint` sin errores (hoy 16 advertencias `no-unused-vars` → limpiar).

### 4.5 JAIDER · Frontend tickets, dashboards, layout y UX
**Cliente**
- **J01** `/cliente`: contadores (total/abiertos/en proceso/resueltos/cerrados) coinciden con la API; 5 recientes; enlaces funcionan.
- **J02** `/cliente/tickets/nuevo`: carga categorías y **solo equipos propios**; validación de obligatorios; modalidad Remoto/Presencial; éxito redirige/mostrar ticket; sin doble envío al hacer doble clic.
- **J03** `/cliente/tickets`: listado, filtros/búsqueda, estados con color correcto, botón de detalle y de calificar solo cuando `Resuelto`.
- **J04** `/cliente/tickets/:id`: datos, línea de tiempo (historial), comentarios (sin notas internas), enviar comentario, botón cerrar/calificar según estado; ID ajeno o inexistente → mensaje 404 amigable.
- **J05** `/cliente/tickets/:id/calificar`: estrellas 1–5 obligatorias, comentario ≤255, envío único, tras éxito ticket queda `Cerrado`. **(H-09)** Decidir implementar "Editar perfil" y "Añadir equipo" (usar `PUT /equipos`, `POST /equipos`) o dejarlos ocultos.
**Técnico**
- **J06** `/tecnico`: métricas reales (sin `TECNICO_ACTUAL` simulado), solo sus tickets asignados; tarjeta de "repuestos" desaparece (P-03).
- **J07** `/tecnico/tickets/:id`: detalle, historial, comentarios públicos y **notas internas**, resaltado de prioridad Alta/Crítica.
- **J08** `/tecnico/tickets/:id/avance`: comentario/nota, y reporte de solución (obligatorio) que pasa el ticket a `Resuelto`; con campo vacío muestra error; reemplazar `alert()` por mensajes en pantalla.
**Admin**
- **J09** `/admin`: métricas y lista de pendientes reales; atajos del menú llevan a la ruta correcta.
- **J10** `/admin/tickets/:id/asignar`: lista técnicos, deshabilita `Fuera_de_Servicio`, permite cambiar prioridad, asigna y confirma; ticket ya `Resuelto` muestra aviso.
- **J11** `/admin/reportes`: los 5 informes con filtros de fecha; fecha inválida/ rango invertido manejado; vacío muestra "sin datos". *(PDF/Excel = P3.)*
- **J12** `/admin/calificaciones`: filtros técnico/puntuación/fechas, promedio y alertas ≤2; botón de seguimiento por correo no promete algo que no existe (`enviarCorreoSeguimientoCliente` es simulado).
**Transversal**
- **J13** `Layout`: menú correcto por rol (sin enlaces a inventario), campana de notificaciones: contador, marcar leída, navegar al ticket.
- **J14** Retirar módulo inventario: rutas, páginas, `inventarioService`, `datosFalsos`, enlaces en `Indice`, `Layout`, dashboards (P-03). Confirmar con el líder antes de borrar.
- **J15** Responsive: 360 px, 768 px y 1366 px en las 20 vistas, sin scroll horizontal; tablas desplazables.
- **J16** Accesibilidad básica: navegación con teclado, foco visible, `label` en inputs, contraste, tamaño de texto ≥14 px.
- **J17** Estados de carga, vacío y error en **cada** listado (spinner, "sin resultados", mensaje de error con reintento).
- **J18** `/` y `*`: reemplazar `Indice` por redirección según sesión (P-09); build de producción (`npm run build` + `npm run preview`) apuntando a `VITE_API_URL`.

---

## 5. PRUEBAS TRANSVERSALES (todos, al final)

| ID | Prueba | Dueño | Esperado |
|---|---|---|---|
| X-01 | Flujo E2E en navegador: cliente crea → admin asigna → técnico comenta y resuelve → cliente califica | Jaider + Cristian | Estados, historial y notificaciones correctos en cada rol |
| X-02 | Seguridad: SQL injection en login/filtros, XSS en título/comentario (`<script>`), IDOR cambiando `/tickets/{id}` | Magleony + Vidal | Entrada escapada, 404/403 sin fuga |
| X-03 | Carga (Locust/ab): 100 usuarios concurrentes, consulta y creación | Teylork | Latencia media <800 ms, 0 respuestas 500 |
| X-04 | Compatibilidad: Chrome, Firefox, Edge, móvil Android/iOS | Vidal + Jaider | Sin diferencias funcionales |
| X-05 | Regresión completa tras merges: `pytest`, `npm run lint`, `npm run build` | Cristian (CI) | Todo en verde en GitHub Actions por cada PR |

---

## 6. PLANTILLA DE REPORTE (copiar por hallazgo)

```
ID: T-xx / H-xx
Resultado: PASS | FAIL
Pasos: 1) … 2) …
Esperado vs obtenido: …
Evidencia: (status HTTP, log, captura)
Severidad: Crítica | Alta | Media | Baja
Corrección propuesta: …  · PR: #…
```

## 7. DEFINICIÓN DE TERMINADO
- [x] Todos los casos ejecutados y registrados PASS/FAIL (84 casos de prueba y 5 transversales).
- [x] 0 hallazgos Crítica/Alta abiertos (P-01, P-02, P-03, P-04, P-05 resueltos y verificados con tests).
- [x] `pytest` verde (46 tests pasando); `npm run lint` (0 errores, 0 advertencias) y `npm run build` sin errores.
- [x] Documentos actualizados (README, PENDIENTES, daily-05).
- [x] Patch `auditoria-qa.patch` aplicado e integrado en la rama `feature/daily-05-qa-testeo-integral`.

