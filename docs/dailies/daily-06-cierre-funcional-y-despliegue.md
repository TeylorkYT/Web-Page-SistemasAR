# DAILY 06 · Cierre funcional (P3) + CI + Despliegue · SistemasAR

> **Formato para agente IA.** Trabaja **un módulo por sesión**: lee solo los archivos listados en ese módulo, no el repo completo.
> Base verificada: `develop` @ `7c3b42c` (merge PR #29, Daily 05). Fecha: 2026-10-16.

## 0. REGLAS (iguales al Daily 05, resumidas)

1. No inventes: confirma en el código (`backend/app/routers|services|schemas|models`, `database/mibasededatos.sql`) antes de usar un nombre.
2. Una rama por módulo: `feature/<id>-<tema>` creada **desde `develop` actualizado**. PR pequeño → `develop`. Nada de commits directos.
3. Cada cambio lleva test (pytest) o caso manual escrito. Meta: no bajar de los tests actuales.
4. No cambiar el DDL ni los ENUM sin aprobación del líder (Teylork). No subir `.env`, secretos ni archivos subidos.
5. `backend/requirements.txt` solo lo toca **Cristian**; `frontend/package.json` solo **Jaider** (los demás le piden la dependencia).
6. Mensajes de error al usuario en español, sin trazas ni datos internos.

### Comandos base
```bash
cd backend && source venv/bin/activate && pip install -r requirements.txt && pytest -q
cd frontend && npm ci && npm run lint && npm run build
```

---

## 1. ESTADO VERIFICADO (punto de partida)

| Ítem | Estado real |
|---|---|
| Lint / build frontend | 0 advertencias · build OK |
| pytest | 45 pasan, **1 falla sin MySQL local**: `tests/test_seguridad_core.py::test_t12_db_check_dev_responde_ok` (llama al `/db-check` real → 503). Pasa solo si hay BD viva. **No es hermético.** |
| CI | **No existe** `.github/workflows` |
| Tests vs producción | Corren en SQLite; producción es MySQL 8 (P-02 sigue abierto) |
| Adjuntos RF-08 | Existe modelo `AdjuntoTicket` y tabla; **no hay router, servicio ni UI** |
| Exportar RF-17 | Existen los 5 informes JSON en `reporte_service.py`; **no hay exportación**. `openpyxl`/`reportlab` no están en requirements |
| SMTP RF-15 / recuperación RF-03 | `POST /auth/recuperar` solo responde un mensaje fijo; sin envío ni restablecer |
| `.gitignore` | Falta `uploads/` (archivos subidos) |
| Reportes UI | `Reportes.jsx` muestra columna **"Días"**; el documento v2.0 pide **horas** (el backend ya devuelve `promedio_horas`) |
| Pendientes no críticos | Alerta >8 h, disponibilidad del técnico, Kanban drag&drop, límite de 5 tickets simultáneos |

---

## 2. MÓDULOS Y ORDEN

```
M0 CI + tests herméticos ──► M1 Adjuntos (backend) ──► M2 Adjuntos (frontend)
        │                                  
        ├──► M3 Exportar PDF/Excel (backend + frontend)   (paralelo a M1/M2)
        ├──► M4 Correo SMTP + recuperación real           (paralelo a M1/M2)
        └──────────────────────────────────────────────► M5 Despliegue VPS + carga + manuales
```
M0 va **primero y bloquea** el resto (así cada PR siguiente ya se valida solo). M5 va al final, pero Teylork puede preparar el servidor en paralelo desde el día 1.

| Módulo | Responsable | Apoyo |
|---|---|---|
| M0 · CI y tests herméticos | **Teylork** | Cristian (revisa) |
| M1 · Adjuntos backend | **Cristian** | Magleony (revisa seguridad) |
| M2 · Adjuntos frontend | **Jaider** | Cristian (contrato API) |
| M3 · Exportación PDF/Excel | **Magleony** (backend) + **Jaider** (botones) | — |
| M4 · SMTP + recuperación | **Magleony** (backend) + **Vidal** (frontend) | Teylork (variables y servidor) |
| M5 · Despliegue, carga y manuales | **Teylork** | Vidal (manual de usuario), todos prueban |

---

## M0 · CI en GitHub Actions y tests herméticos (Teylork)
**Rama:** `feature/m0-ci-github-actions` · **Resuelve:** P-02, test no hermético.

**Archivos a leer:** `backend/tests/conftest.py`, `backend/tests/test_seguridad_core.py`, `backend/app/main.py`, `backend/.env.example`, `.gitignore`.

**Tareas**
1. **T0-01** Arreglar `test_t12_db_check_dev_responde_ok`: que use un engine de prueba (override o `patch` de `app.main.engine`) y no dependa de MySQL. Resultado: `pytest` pasa en una máquina **sin** MySQL.
2. **T0-02** Crear `.github/workflows/ci.yml` con 3 jobs en `pull_request` hacia `develop`:
   - `backend-sqlite`: Python 3.12, `pip install -r requirements.txt`, `pytest -q`.
   - `backend-mysql`: servicio `mysql:8.0` (con healthcheck), cargar `database/mibasededatos.sql` y correr `pytest` con `TEST_DB_HOST/USER/PASSWORD/NAME` (variables que ya lee `conftest.py`). Si algo falla solo aquí, abrir issue (son diferencias ENUM/CHECK/collation).
   - `frontend`: Node 22, `npm ci`, `npm run lint`, `npm run build`.
3. **T0-03** Cachear dependencias (pip y npm). Los secretos del CI solo vía `secrets`, nunca en el archivo.
4. **T0-04** Añadir a `.gitignore`: `uploads/`, `backend/uploads/`, `dist/` (si falta), `*.log`.
5. **T0-05** Activar en GitHub *branch protection* sobre `develop` y `main`: PR obligatorio + checks `backend-sqlite`, `backend-mysql`, `frontend` en verde.
6. **T0-06** Documentar en README una sección "CI" y el comando para correr tests contra MySQL.

**Casos de prueba**
- C0-1 Quitar MySQL local → `pytest -q` sigue todo en verde.
- C0-2 PR con test roto a propósito → el check queda en rojo y bloquea el merge.
- C0-3 PR con error de lint → job `frontend` falla.
- C0-4 Job `backend-mysql` ejecuta los mismos tests que SQLite sin diferencias.

**DoD:** los 3 jobs verdes en un PR real, protección de ramas activa.

---

## M1 · Adjuntos de evidencia, backend (Cristian)
**Rama:** `feature/m1-adjuntos-backend` · **Resuelve:** RF-08 (HU-CLI-02, HU-SOP-02).

**Archivos a leer:** `backend/app/models/adjunto_ticket.py`, `backend/app/services/ticket_service.py` (`validar_acceso_ticket`, `crear_comentario`), `backend/app/routers/tickets.py`, `backend/app/core/config.py`, `backend/app/main.py`.

**Contrato API (nuevo `routers/adjuntos.py`, prefijo `/api/v1/tickets`)**
| Método · Ruta | Quién | Respuesta |
|---|---|---|
| `POST /{id_ticket}/adjuntos` (multipart, campo `archivo`) | Cliente dueño, técnico asignado, admin | 201 con metadatos |
| `GET /{id_ticket}/adjuntos` | mismos (misma regla de acceso que el ticket) | lista de metadatos |
| `GET /{id_ticket}/adjuntos/{id_adjunto}/descargar` | mismos | archivo; **requiere token**, no es carpeta estática pública |

**Reglas de negocio y seguridad**
- Solo `image/jpeg`, `image/png`, `application/pdf`; máx **5 MB (5.242.880 bytes)**; máx **3 por ticket**; no permitir adjuntar si el ticket está `Cerrado`.
- Validar el tipo por **contenido real (firma/magic bytes)**, no solo por `Content-Type` ni extensión.
- Guardar con nombre **UUID** + extensión derivada del tipo detectado; **nunca** usar el nombre original en la ruta del disco (el original va en `nombre_archivo`, sanitizado y ≤150).
- Carpeta configurable `UPLOAD_DIR` (variable de entorno, fuera del código y en `.gitignore`); evitar *path traversal*.
- Leer el archivo por bloques y cortar al pasar 5 MB (no cargar todo en memoria).
- Dejar rastro en `Historial_Ticket` con `tipo_accion="Comentario"` y `detalles="Adjunto agregado: <nombre>"` (**no** modificar el ENUM).
- Si falla el guardado en BD, borrar el archivo ya escrito (sin huérfanos).
- Pedir a sí mismo (dueño de requirements) agregar `python-multipart` a `requirements.txt` si no está.

**Casos de prueba**
- C1-01 Subir JPG/PNG/PDF válidos → 201 y aparecen en el listado.
- C1-02 Subir `.exe` renombrado a `.png` → 400/415 (falla la firma).
- C1-03 Archivo de 5.242.881 bytes → 413/400; de exactamente 5.242.880 → 201.
- C1-04 Subir el 4.º adjunto → 400 con mensaje claro.
- C1-05 Cliente ajeno / técnico no asignado: subir, listar y descargar → 404.
- C1-06 Sin token → 401. Ticket `Cerrado` → 400.
- C1-07 Nombre `../../etc/passwd.png` → se guarda con UUID dentro de `UPLOAD_DIR`.
- C1-08 Descarga devuelve el mismo contenido y `Content-Type` correcto, con `X-Content-Type-Options: nosniff`.
- C1-09 Dos subidas simultáneas con 2 adjuntos previos → máximo 3 en total.

**DoD:** tests de C1-01..C1-09 en verde en SQLite y MySQL; sin archivos en git.

---

## M2 · Adjuntos, frontend (Jaider)
**Rama:** `feature/m2-adjuntos-frontend` · **Depende de:** M1 mergeado.

**Archivos a leer:** `frontend/src/pages/cliente/CrearTicket.jsx`, `DetalleTicketCliente.jsx`, `pages/tecnico/DetalleTicketTecnico.jsx`, `services/ticketsService.js`, `services/tecnicoService.js`, `api/client.js`.

**Tareas**
1. **T2-01** En `ticketsService.js` agregar `subirAdjunto(id, archivo)`, `listarAdjuntos(id)`, `descargarAdjunto(id, idAdjunto)` (descarga con Axios + token, `responseType: "blob"`; no usar enlaces directos sin token).
2. **T2-02** `CrearTicket`: selector de hasta 3 archivos; tras crear el ticket, subirlos y mostrar progreso/errores por archivo.
3. **T2-03** `DetalleTicketCliente` y `DetalleTicketTecnico`: sección "Evidencias" con lista, miniatura para imágenes, botón de descarga y botón "Adjuntar" (oculto si hay 3 o el ticket está `Cerrado`).
4. **T2-04** Validación previa en el navegador (tipo y 5 MB) con mensajes claros; el backend sigue siendo la validación real.
5. **T2-05** Estados de carga, vacío ("Sin evidencias") y error con reintento.

**Casos de prueba:** C2-01 adjuntar válido; C2-02 archivo grande/tipo prohibido muestra mensaje sin enviar; C2-03 4.º archivo bloqueado; C2-04 descargar abre el archivo correcto; C2-05 ticket cerrado sin botón; C2-06 móvil 360 px; C2-07 `npm run lint` y `build` limpios.

**DoD:** flujo E2E cliente adjunta → técnico lo ve y descarga.

---

## M3 · Exportar reportes a PDF y Excel (Magleony backend, Jaider frontend)
**Rama:** `feature/m3-exportar-reportes` · **Resuelve:** RF-17 / HU-ADM-04.

**Archivos a leer:** `backend/app/routers/reportes.py`, `services/reporte_service.py`, `schemas/reportes.py`, `frontend/src/pages/admin/Reportes.jsx`, `services/reportesService.js`.

**Backend (Magleony)**
1. **T3-01** Nuevo servicio `exportacion_service.py` que **reutiliza** las funciones existentes del servicio de reportes (no duplicar consultas). Dependencias `openpyxl` y `reportlab` (Cristian las agrega a requirements).
2. **T3-02** Endpoint `GET /api/v1/reportes/{tipo_informe}/exportar?formato=pdf|excel&desde=&hasta=` (solo Administrador). `formato` inválido → 400; mismas validaciones de fecha que el JSON.
3. **T3-03** Excel: una hoja por informe, encabezados en español, tipos numéricos reales. **Neutralizar fórmulas**: si un texto empieza con `=`, `+`, `-` o `@`, anteponer `'`.
4. **T3-04** PDF: título, rango de fechas, fecha de generación, tabla del informe; paginación si es larga. Cabeceras `Content-Disposition: attachment; filename=...`.
5. **T3-05** Rendimiento: exportar en **<3 s** con ~1.000 tickets (RNF-02).

**Frontend (Jaider)**
6. **T3-06** En `Reportes.jsx` botones **Exportar PDF** y **Exportar Excel** que descargan con Axios + token y respetan los filtros actuales.
7. **T3-07** Cambiar la columna **"Días" → "Horas"** para alinearla al documento (usar el dato de horas del backend; verificar el cálculo).

**Casos de prueba**
- C3-01 Los 5 informes en PDF y Excel descargan y abren sin error.
- C3-02 Cifras del archivo = cifras de la pantalla = consulta SQL manual.
- C3-03 Cliente/técnico → 403; sin token → 401.
- C3-04 `formato=word` → 400; fecha basura → 400.
- C3-05 Título de ticket `=HYPERLINK("http://x")` → en Excel aparece como texto, no como fórmula.
- C3-06 Informe vacío → archivo válido con "Sin datos".
- C3-07 Tiempo de generación <3 s.

**DoD:** tests automáticos de status/tipo de contenido/hojas + prueba manual de apertura en Excel y visor PDF.

---

## M4 · Correo SMTP y recuperación real de contraseña (Magleony backend, Vidal frontend)
**Rama:** `feature/m4-smtp-recuperacion` · **Resuelve:** RF-15 y completa RF-03.

**Archivos a leer:** `backend/app/routers/auth.py`, `schemas/usuario.py` (`RecuperarIn`), `core/security.py`, `core/config.py`, `services/notificacion_service.py`, `frontend/src/pages/auth/RecuperarContrasena.jsx`, `services/authService.js`.

**Decisiones de diseño (sin tocar el DDL):** la base **no tiene tabla de tokens**, así que el enlace de recuperación usa un **JWT firmado de tipo `reset`**, vida corta (30 min), que incluye una huella del hash de contraseña actual; así queda **inválido tras usarse** o tras cualquier cambio de contraseña.

**Backend (Magleony)**
1. **T4-01** Variables en `config.py` y `.env.example`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_TLS`, `FRONTEND_URL`. Si `SMTP_HOST` está vacío → el correo se omite con log (el sistema **nunca falla** por no poder enviar).
2. **T4-02** `email_service.py` con envío en segundo plano (`BackgroundTasks`) y 3 plantillas HTML editables: ticket resuelto/asignado/comentario, recuperación, bienvenida. Texto en español; escapar datos del usuario en el HTML.
3. **T4-03** Conectar el envío a los eventos que hoy solo crean `Notificacion`: apertura, asignación, comentario, resolución y cierre (en `notificar` o tras el commit, sin bloquear la respuesta).
4. **T4-04** `POST /auth/recuperar`: si el correo existe y está activo, enviar enlace `FRONTEND_URL/restablecer?token=...`; la respuesta es **idéntica** exista o no (sin enumeración).
5. **T4-05** Nuevo `POST /auth/restablecer` `{token, contrasena}`: valida tipo `reset`, vigencia y huella; aplica las mismas reglas de contraseña (8–72 bytes); responde 400 genérico si el token es inválido.
6. **T4-06** Limitar abuso: máximo N solicitudes de recuperación por correo/IP en una ventana (en memoria es aceptable en esta fase; en producción reforzar con `limit_req` de Nginx).

**Frontend (Vidal)**
7. **T4-07** `RecuperarContrasena.jsx`: mensaje neutral tras enviar, bloqueo de reenvío por unos segundos.
8. **T4-08** Nueva vista `/restablecer` (lee `token` de la URL): campos nueva contraseña + confirmación, validación (≥8, coinciden), éxito → `/login`, token inválido/vencido → mensaje y enlace para pedir otro.

**Casos de prueba**
- C4-01 Correo existente y no existente → misma respuesta y mismo tiempo aproximado.
- C4-02 Enlace válido cambia la clave; el login con la anterior falla y con la nueva funciona.
- C4-03 Reusar el mismo enlace → 400. Enlace vencido/manipulado/access-token usado como reset → 400.
- C4-04 Cuenta inactiva no recibe correo.
- C4-05 Con SMTP caído o vacío, crear/asignar/resolver ticket sigue respondiendo 2xx.
- C4-06 Probar con un SMTP local de pruebas (Mailpit o similar): llega 1 correo por evento, con asunto y datos correctos, sin HTML inyectado.
- C4-07 Frontend: contraseñas distintas bloquean envío; token ausente muestra error.

**DoD:** los 5 eventos y la recuperación verificados contra un SMTP de pruebas; tests con SMTP simulado (mock) en CI.

---

## M5 · Despliegue en VPS, carga y manuales (Teylork; apoyo Vidal)
**Rama:** `feature/m5-despliegue-docs` (solo archivos de despliegue y `docs/`). Infraestructura según Documento v2.0: Hostinger VPS KVM 1, Ubuntu 22.04, Nginx, Certbot, systemd, UFW.

**Tareas**
1. **T5-01** Servidor: usuario no-root, SSH con llaves, `ufw default deny incoming` y solo 22/80/443; MySQL escucha en `127.0.0.1`.
2. **T5-02** BD: crear esquema con `mibasededatos.sql`; usuarios por rol con `permisos_dcl_produccion.sql` (contraseñas fuertes propias, no las de ejemplo); **no** cargar `datos_prueba.sql` en producción.
3. **T5-03** Backend con systemd: `uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2`, `Restart=always`, `.env` con `ENV=production`, `JWT_SECRET` largo y aleatorio, `CORS_ORIGINS=https://sistemasar.net`, `UPLOAD_DIR`, SMTP.
4. **T5-04** Frontend: `VITE_API_URL` apuntando al dominio (o vacío si Nginx sirve `/api` en el mismo origen), `npm run build`, servir `dist/` desde Nginx con *fallback* a `index.html` (rutas de React Router).
5. **T5-05** Nginx: proxy `/api/` → `127.0.0.1:8000`, `limit_req`, `client_max_body_size 6m` (adjuntos), cabeceras de seguridad (HSTS, `X-Content-Type-Options`, `X-Frame-Options`), HTTPS con Certbot y renovación automática.
6. **T5-06** Backups: `mysqldump` diario comprimido por cron + snapshot semanal; **probar una restauración real**.
7. **T5-07** Prueba de carga (Locust o `ab`): 100 usuarios concurrentes sobre login, listado y creación de tickets → latencia media <800 ms y 0 respuestas 500.
8. **T5-08** Manuales en `docs/manuales/`: **técnico** (arquitectura, módulos, endpoints, BD) y **instalación/despliegue** (Teylork); **usuario final por rol** Cliente/Técnico/Administrador con capturas (Vidal).
9. **T5-09** (Opcional) `Dockerfile` + `docker-compose.yml` para levantar BD, backend y frontend en local.

**Casos de prueba (humo en producción)**
- C5-01 `https://sistemasar.net` carga con candado válido; `http` redirige a `https`.
- C5-02 Desde fuera: puertos 8000 y 3306 cerrados (escaneo externo).
- C5-03 `/docs` y `/db-check` ocultos o protegidos en producción; la app **no arranca** sin `JWT_SECRET`.
- C5-04 Reiniciar el VPS → backend y Nginx suben solos.
- C5-05 Recargar `/cliente/tickets/1` directamente → no da 404 de Nginx.
- C5-06 Subir un adjunto de 5 MB funciona; uno de 7 MB es rechazado.
- C5-07 Flujo E2E completo en producción con 3 cuentas reales (no las de prueba).
- C5-08 Restaurar el último backup en una BD temporal y consultar tickets.

**DoD:** sitio estable, prueba de carga documentada, manuales entregados.

---

## 3. OPCIONALES (solo si sobra tiempo; documentar como "fase futura" si no)
| ID | Tarea | Notas |
|---|---|---|
| O-01 | Alerta de ticket >8 h en `En_Proceso` | Tarea programada (APScheduler o cron) que notifique al admin una sola vez por ticket |
| O-02 | Disponibilidad editable por el técnico (`Disponible`/`En_Almuerzo`/`Ocupado`) | Nuevo endpoint solo para el propio técnico |
| O-03 | Aviso al asignar si el técnico ya tiene 5 tickets `En_Proceso` | Aviso, no bloqueo |
| O-04 | Kanban con arrastrar y soltar | Solo transiciones válidas; el backend sigue siendo la fuente de verdad |
| O-05 | Editar perfil / Añadir equipo en `PerfilCliente` | Usar `PUT/POST /equipos` y un endpoint de perfil propio |

---

## 4. PRUEBAS TRANSVERSALES FINALES (todos)
| ID | Prueba | Dueño |
|---|---|---|
| X-06 | E2E con adjuntos: cliente crea con evidencia → admin asigna → técnico descarga, comenta y resuelve → cliente califica; llegan los correos | Jaider + Cristian |
| X-07 | Exportar los 5 informes con datos del E2E y cuadrarlos con SQL | Magleony |
| X-08 | Seguridad: subir archivos maliciosos, IDOR en descargas, XSS en nombre de archivo, abuso del endpoint de recuperación | Magleony + Vidal |
| X-09 | Regresión: `pytest` (SQLite y MySQL), `lint`, `build` en CI verde | Teylork |
| X-10 | Compatibilidad: Chrome, Firefox, Edge y móvil | Vidal + Jaider |

## 5. PLANTILLA DE REPORTE
```
ID: C#-## / T#-##   Resultado: PASS | FAIL
Pasos: …   Esperado vs obtenido: …
Evidencia: (status HTTP, log, captura)   Severidad: Crítica | Alta | Media | Baja
Corrección: …   PR: #…
```

## 6. DEFINICIÓN DE TERMINADO DEL DAILY 06
- [ ] M0: CI activo con protección de ramas; `pytest` pasa sin MySQL local.
- [ ] M1+M2: adjuntos funcionando de punta a punta con las reglas de seguridad.
- [ ] M3: 5 informes exportables a PDF y Excel, en horas, <3 s.
- [ ] M4: correos por evento y recuperación de contraseña real, sin enumeración.
- [ ] M5: producción estable, backup restaurado con éxito, carga validada, 3 manuales.
- [ ] README y `docs/PENDIENTES.md` actualizados (RF-08, RF-15, RF-17 y RF-03 pasan a "Hecho"; opcionales quedan listados).
- [ ] 0 hallazgos Crítica/Alta abiertos.
