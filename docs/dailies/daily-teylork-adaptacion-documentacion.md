# Daily de Teylork - Adaptar el proyecto al Documento Definitivo v2.0

Responsable: Teylork (líder y dueño de la base de datos)
Este daily es aparte del daily 2 (frontend de las 20 vistas) y del daily 3 (login con backend). Lo hace solo Teylork.

---

## 0. Instrucciones para el agente de IA (leer primero)

Eres el asistente de Teylork. Reglas:

1. Lee las secciones 1 a 4 completas antes de ejecutar nada.
2. Ejecuta SOLO las tareas de este documento. No edites archivos de otros integrantes: lo que les toca a ellos va en la sección 7 como aviso, no como cambio tuyo.
3. Los nombres de tablas, columnas y valores de enumeraciones salen EXACTAMENTE de la sección 4. No inventes campos ni valores. Si algo no aparece en la sección 4, pregunta.
4. NUNCA ejecutes SQL destructivo (`DROP DATABASE`, `DROP TABLE`, `DELETE` sin `WHERE`, `TRUNCATE`) sin pedir confirmación escrita a Teylork y sin haber verificado antes qué hay en la base. La base es compartida por 5 personas.
5. No escribas contraseñas reales, hashes reales ni datos de conexión en archivos del repositorio. Van en `.env`, que no se sube.
6. Trabaja en una rama por bloque y entrega con pull request a `develop`. No hagas commit directo a `main` ni a `develop`.
7. Al terminar cada tarea, verifica sus criterios de aceptación (sección 8) y dile a Teylork qué probaste y qué falta.

---

## 1. Objetivo y entregables

Alinear la base de datos, los datos de prueba, los datos falsos del frontend y las 4 vistas de Teylork con el Documento Definitivo v2.0 (PDF del proyecto), y dejar escritas las decisiones que el resto del equipo debe conocer.

Entregables:

- Base compartida `sistemas_ar` creada con las 14 tablas y los 10 índices del script v2.0.
- Archivos `database/mibasededatos.sql` y `database/datos_prueba.sql` en el repositorio, iguales a lo que quedó en la base.
- `src/data/datosFalsos.js` con los campos reales del esquema v2.0.
- Las vistas 17, 14, 16 y 20 ajustadas al esquema.
- Lista de decisiones comunicada al equipo (sección 7).

---

## 2. Qué cambia respecto a lo que teníamos

| Tema | Antes | Ahora (Documento Definitivo v2.0) |
| --- | --- | --- |
| Base de datos | `sistemasar_db`, 8 tablas, 11 índices | `sistemas_ar`, 14 tablas, 10 índices |
| Inventario | Había tablas y las vistas 13 y 18 | No hay módulo de inventario: se quitan las vistas 13 y 18 |
| Notificaciones | Se pensaban sin registro en la base | Existe la tabla `Notificacion` |
| Categorías (vista 17) | Mockup con servicios, SLA y costo | `Categoria` solo tiene `nombre_categoria` y `descripcion` |
| Prioridad del ticket | Sin confirmar | `prioridad`: Baja, Media, Alta, Critica |
| Disponibilidad del técnico | Sin confirmar | `disponibilidad`: Disponible, Ocupado, En_Almuerzo, Fuera_de_Servicio |
| Rol en la base | Minúscula en el contrato del login | Enumeración con mayúscula: `Cliente`, `Administrador`, `Tecnico` |
| Código del ticket | El mockup muestra «TKT-1035» | Solo existe `id_ticket` |
| Ruta del login | `POST /login` | `POST /api/v1/auth/login` |
| Estructura del backend | `main.py` y `database.py` con PyMySQL | `backend/app/` con `routers/`, `models/`, `schemas/`, `services/` y SQLAlchemy |

---

## 3. Tareas

### Bloque A - Base de datos compartida (rama `feature/db-esquema-v2`)

**A1. Revisar el servidor antes de tocar nada**

1. Conectarse al servidor MySQL compartido y verificar la versión con `SELECT VERSION();`. Debe ser 8.0.16 o superior, porque desde esa versión MySQL aplica las restricciones `CHECK` (el script las usa en `Adjunto_Ticket` y `Calificacion`).
2. Listar las bases existentes con `SHOW DATABASES;` y confirmar si ya existe `sistemasar_db` o `sistemas_ar`.
3. Si `sistemasar_db` existe, NO borrarla todavía: se deja intacta hasta confirmar con el equipo que nadie la usa.

**A2. Preparar el script**

1. Guardar el script SQL del documento (sección 5.1) como `database/mibasededatos.sql`.
2. Quitar o comentar estas dos cosas antes de ejecutarlo en el servidor compartido:
   - La línea `DROP DATABASE IF EXISTS sistemas_ar;`, porque borraría todo lo que otros ya hayan cargado.
   - El bloque `-- 5. CONTROL DE PERMISOS DCL`. Esos usuarios (`admin_user`, `tecnico_user`, `cliente_user`) están creados con host `localhost`, que sirve en el VPS de producción donde la base y el backend están en la misma máquina, pero no sirve para un servidor compartido al que se conecta cada integrante desde su computador. Ese bloque se guarda aparte como `database/permisos_dcl_produccion.sql` y se ejecuta solo en el VPS.
3. Las contraseñas de los usuarios DCL del documento son de ejemplo. En el archivo de producción se reemplazan por contraseñas reales que no se suben al repositorio.

**A3. Crear el esquema**

1. Ejecutar el script (sin el `DROP` y sin el bloque DCL) en el servidor compartido.
2. Verificar con estas consultas:

```sql
USE sistemas_ar;
SHOW TABLES;                    -- deben salir 14 tablas
SHOW INDEX FROM Ticket;         -- deben aparecer idx_ticket_cliente, idx_ticket_tecnico e idx_ticket_estado
SELECT COUNT(*) AS total_tablas
FROM information_schema.tables
WHERE table_schema = 'sistemas_ar';   -- debe dar 14
```

**A4. Usuario de desarrollo**

1. Crear un usuario de MySQL solo para desarrollo, con permisos únicamente sobre `sistemas_ar.*`, y con el host que permita conectarse desde fuera según lo que admita el proveedor (por ejemplo `'%'`, o las direcciones de los compañeros). Si el proveedor no deja crear usuarios, usar el usuario que da su panel.
2. Pasar host, puerto, usuario, contraseña y nombre de base (`sistemas_ar`) a Cristian, Magleony y Jaider por mensaje privado, nunca por el repositorio.

### Bloque B - Datos de prueba (rama `feature/db-datos-prueba`)

**B1. Escribir `database/datos_prueba.sql`**

Debe respetar el orden de las claves foráneas (primero `Usuario` y sus subtipos, luego `Categoria`, `Equipo`, `Ticket`, y al final las tablas que dependen de `Ticket`). Contenido mínimo:

- Usuarios, cada uno con su fila en `Usuario` y en su subtipo (`Cliente`, `Tecnico` o `Administrador`):
  - 1 administrador.
  - 3 técnicos con distinta `disponibilidad`: uno `Disponible`, uno `Ocupado` y uno `Fuera_de_Servicio`.
  - 3 clientes con distinta `area_departamento`.
  - Tres de ellos son los usuarios de prueba del login: `cliente@prueba.com`, `tecnico@prueba.com` y `admin@prueba.com`.
- 4 a 5 categorías. Ejemplos del documento: Mantenimiento Hardware, Soporte Software, Redes y Conectividad.
- 5 equipos repartidos entre los clientes, con `serial` único.
- 8 a 10 tickets que cubran: los 4 estados, las 4 prioridades, las 2 modalidades, tickets con y sin técnico, y fechas coherentes (`fecha_resolucion` y `fecha_cierre` nunca anteriores a `fecha_creacion`).
- `Ticket_Categoria`: al menos un ticket con dos categorías.
- `Comentario`: varios, con al menos una nota con `es_nota_interna = TRUE`.
- `Historial_Ticket`: una fila por cada cambio que explique el estado actual de cada ticket.
- `Reporte`: uno por cada ticket en estado `Resuelto` o `Cerrado`.
- `Calificacion`: una por ticket cerrado (máximo una por ticket) y al menos una de 1 estrella, para probar la alerta de baja calificación.
- `Notificacion`: algunas leídas y otras sin leer.

**B2. Contraseñas de los usuarios de prueba**

La columna `contrasena` guarda un hash bcrypt. Mientras el hash real no exista, usar el valor `HASH_PENDIENTE` en todos los usuarios, y se reemplaza el día del login (daily 3), cuando Magleony genera el hash de la contraseña de prueba. No guardar contraseñas en texto plano.

**B3. Cargar y verificar**

1. Ejecutar el archivo en el servidor compartido.
2. Comprobar que cada tabla tenga filas y que no haya errores de claves foráneas.

### Bloque C - Datos falsos del frontend (rama `feature/front-datos-falsos`)

**C1. Crear `src/data/datosFalsos.js`**

1. Exportar una lista por cada tabla del esquema, con los MISMOS nombres de campo y los mismos valores de enumeración de la sección 4: `usuarios`, `clientes`, `tecnicos`, `administradores`, `categorias`, `equipos`, `tickets`, `ticketCategorias`, `comentarios`, `historial`, `reportes`, `notificaciones`, `calificaciones` y `adjuntos`.
2. Que los ids y las relaciones coincidan con `datos_prueba.sql`, para que más adelante cambiar a datos reales sea directo.
3. Incluir los tres usuarios falsos del login: `cliente@prueba.com`, `tecnico@prueba.com` y `admin@prueba.com`, con la contraseña falsa `Prueba123*`. Esta contraseña es solo para el frontend falso.
4. No agregar inventario, SLA, costos ni código de ticket. Si una vista necesita mostrar un código, se arma con `"TKT-" + id_ticket`.

### Bloque D - Las 4 vistas de Teylork (una rama por vista)

Antes de empezar: el pull request de KIT-1 (entorno de Cristian) debe estar en `develop`. Orden: 17, 14, 16, 20. Cada vista obtiene sus datos solo de `src/services/adminService.js`, sin `fetch` y sin importar `datosFalsos.js` dentro de la vista.

**D1. Vista 17 - Gestión de categorías** (`/admin/categorias`, `pages/admin/GestionCategorias.jsx`)

- Lista de categorías con botón «+ Nueva categoría» y editar.
- El panel derecho del mockup («Servicios asociados») se reemplaza por el detalle de la categoría elegida: nombre y descripción.
- La ventana de crear o editar tiene solo dos campos: `nombre_categoria` (obligatorio y único) y `descripcion`. Se quitan el botón «+ Nuevo servicio», el tiempo estimado (SLA) y el costo referencial.
- Borrar o inactivar: pendiente de la decisión 4 de la sección 7. Mientras tanto, dejar solo crear y editar.

**D2. Vista 14 - Dashboard del administrador** (`/admin`, `pages/admin/DashboardAdmin.jsx`)

- Tickets totales: cantidad de tickets.
- Tickets abiertos: los que no están en estado `Cerrado`. Tickets cerrados: los de estado `Cerrado`. (Definición asumida: confirmar con el equipo.)
- Técnicos activos: los técnicos con `disponibilidad` distinta de `Fuera_de_Servicio`.
- Gráfico semanal de abiertos contra cerrados, con barras simples y datos falsos, sin instalar librería.
- Tabla de técnicos activos: nombre y apellido, estado (su `disponibilidad`) y ticket actual (su ticket en estado `En_Proceso`, o «-» si no tiene).

**D3. Vista 16 - Asignación de técnico** (`/admin/tickets/:id/asignar`, `pages/admin/AsignarTecnico.jsx`)

- Tickets pendientes: los de estado `Abierto` sin técnico. Filtro por prioridad con los 4 valores (Baja, Media, Alta, Critica); agregar el color de `Critica`, que el mockup no tiene.
- Detalle del ticket: código «TKT-» más el id, cliente (nombre y apellido), título, descripción, categorías (desde `Ticket_Categoria`) y fecha de creación.
- Selección de un solo técnico, con su disponibilidad y su cantidad de tickets en `En_Proceso`. Los técnicos en `Fuera_de_Servicio` aparecen deshabilitados. Si un técnico ya tiene 5 tickets en `En_Proceso`, mostrar una alerta.
- La prioridad se puede ajustar antes de asignar.
- Al asignar (en el frontend falso, solo estado local): el ticket guarda `id_tecnico`, `id_asignado_por`, la prioridad elegida y pasa a `En_Proceso`, y sale de la lista de pendientes.
- La ruta lleva el id del ticket: abre esta pantalla con ese ticket ya elegido.

**D4. Vista 20 - Calificaciones recibidas** (`/admin/calificaciones`, `pages/admin/CalificacionesRecibidas.jsx`)

- Filtros por técnico, rango de fechas (sobre `fecha_calificacion`) y puntaje de 1 a 5.
- Métricas: promedio general, técnico mejor valorado y alertas de tickets con calificación de 2 estrellas o menos.
- Tabla del historial con código del ticket, técnico, estrellas, comentario y acciones, con paginación.
- Ventana de detalle con técnico, cliente, calificación, comentario completo, «Ver historial completo del ticket» (muestra las filas de `Historial_Ticket`) y «Enviar correo al cliente» (en el frontend falso muestra solo un mensaje de que el correo se envió).

### Bloque E - Avisar al equipo

Entregar la sección 7 al equipo por el grupo. Es la única tarea de este bloque.

---

## 4. Esquema v2.0 (fuente de verdad de nombres y valores)

Base de datos: `sistemas_ar` (MySQL 8.0, InnoDB, `utf8mb4`).

| Tabla | Columnas |
| --- | --- |
| `Usuario` | `id_usuario` (PK, auto), `nombre`, `apellido`, `correo_electronico` (único), `contrasena` (hash bcrypt), `rol` (`Cliente`, `Administrador`, `Tecnico`), `fecha_registro` (fecha), `estado` (`Activo`, `Inactivo`; por defecto `Activo`) |
| `Cliente` | `id_usuario` (PK y FK a `Usuario`), `telefono`, `direccion`, `area_departamento` (por defecto `General`) |
| `Administrador` | `id_usuario` (PK y FK a `Usuario`), `cargo` |
| `Tecnico` | `id_usuario` (PK y FK a `Usuario`), `especialidad`, `disponibilidad` (`Disponible`, `Ocupado`, `En_Almuerzo`, `Fuera_de_Servicio`; por defecto `Disponible`) |
| `Categoria` | `id_categoria` (PK, auto), `nombre_categoria` (único), `descripcion` |
| `Equipo` | `id_equipo` (PK, auto), `tipo` (`Computador`, `Impresora`, `Servidor`, `Red`, `Otro`), `marca`, `modelo`, `serial` (único), `sistema_operativo`, `area_departamento`, `id_cliente` (FK a `Cliente`), `estado_equipo` (`Operativo`, `En_Reparacion`, `Fuera_de_Servicio`) |
| `Ticket` | `id_ticket` (PK, auto), `titulo`, `descripcion`, `modalidad` (`Remoto`, `Presencial`), `fecha_creacion`, `fecha_resolucion`, `fecha_cierre` (fecha y hora; las dos últimas pueden ser nulas), `prioridad` (`Baja`, `Media`, `Alta`, `Critica`; por defecto `Media`), `estado` (`Abierto`, `En_Proceso`, `Resuelto`, `Cerrado`; por defecto `Abierto`), `id_cliente` (FK), `id_tecnico` (FK, puede ser nulo), `id_asignado_por` (FK a `Administrador`, puede ser nulo), `id_equipo` (FK, puede ser nulo) |
| `Ticket_Categoria` | `id_ticket` y `id_categoria` (clave primaria compuesta) |
| `Adjunto_Ticket` | `id_adjunto` (PK, auto), `id_ticket`, `id_usuario`, `nombre_archivo`, `ruta_url`, `tipo_mime` (`image/jpeg`, `image/png`, `application/pdf`), `tamano_bytes` (mayor que 0 y hasta 5242880), `fecha_subida` |
| `Historial_Ticket` | `id_historial` (PK, auto), `id_ticket`, `tipo_accion` (`Creacion`, `Asignacion`, `Cambio_Estado`, `Resolucion`, `Cierre`, `Comentario`), `estado_anterior`, `estado_nuevo` (valores de estado del ticket, pueden ser nulos), `fecha_accion`, `id_usuario`, `detalles` |
| `Comentario` | `id_comentario` (PK, auto), `contenido`, `es_nota_interna` (por defecto falso), `fecha_creacion`, `id_usuario`, `id_ticket` |
| `Reporte` | `id_reporte` (PK, auto), `id_ticket`, `id_tecnico`, `solucion_aplicada` (obligatoria), `fecha_reporte`, `estado` (`Pendiente`, `En_Revision`, `Aprobado`; por defecto `Pendiente`) |
| `Notificacion` | `id_notificacion` (PK, auto), `mensaje`, `tipo` (`Asignacion`, `Actualizacion`, `Resolucion`, `Comentario`), `leida` (por defecto falso), `fecha_envio`, `id_usuario_destino`, `id_ticket` |
| `Calificacion` | `id_calificacion` (PK, auto), `id_ticket` (único: una sola por ticket), `id_cliente`, `id_tecnico`, `puntuacion` (de 1 a 5), `comentario`, `fecha_calificacion` |

Índices del script (10): `idx_equipo_cliente`, `idx_equipo_area`, `idx_ticket_cliente`, `idx_ticket_tecnico`, `idx_ticket_estado`, `idx_adjunto_ticket`, `idx_historial_ticket`, `idx_comentario_ticket`, `idx_reporte_ticket` e `idx_notificacion_destino`.

---

## 5. Reglas del documento que no están en la base (las aplica la aplicación)

- Máximo 3 archivos adjuntos por ticket.
- Un técnico en `Fuera_de_Servicio` no puede recibir tickets, y se avisa si supera 5 tickets simultáneos en `En_Proceso`.
- No se puede pasar un ticket a `Resuelto` o `Cerrado` sin un `Reporte` con `solucion_aplicada`.
- Alerta al administrador si un ticket pasa de 8 horas continuas en `En_Proceso`, y si una calificación es de 2 estrellas o menos.
- Los 5 informes del administrador: tickets por agente, por prioridad, tiempos de resolución en horas, estado general e incidencias por área y categoría.

---

## 6. Orden de trabajo

1. Bloque A (base de datos) primero, porque Cristian y Magleony necesitan la conexión y el nombre de la base.
2. Bloque B (datos de prueba) y Bloque C (datos falsos) en paralelo; deben quedar con los mismos ids.
3. Bloque E (avisos) apenas termine el Bloque A, para que todos cambien `DB_NAME`.
4. Bloque D (vistas) cuando el entorno de Cristian (KIT-1) esté en `develop`.

---

## 7. Decisiones para comunicar al equipo

| # | Decisión propuesta | A quién avisar |
| --- | --- | --- |
| 1 | Sacar las vistas 13 y 18 (inventario) del alcance. Quedan 18 vistas. Cristian no crea esas dos rutas y el menú de Jaider no muestra «Inventario». Cristian pasa a 3 vistas (10, 11 y 12) y Magleony a 2 (15 y 19). | Cristian, Magleony, Jaider |
| 2 | La base se llama `sistemas_ar`. Cada uno cambia `DB_NAME` en su `.env` y se actualiza `.env.example`. | Todos |
| 3 | El rol vive en la base con mayúscula (`Cliente`, `Tecnico`, `Administrador`). La API lo devuelve en minúscula en el login, para que el frontend use `cliente`, `tecnico` y `administrador`. | Magleony, Cristian, Vidal, Jaider |
| 4 | Inactivar categorías (RF-06) no tiene columna en `Categoria`. Opciones: agregar una columna `estado` con `Activa` e `Inactiva`, o quitar «inactivar» del requisito. Falta que Teylork decida. | Cristian, Magleony |
| 5 | El código del ticket se muestra como `TKT-` más `id_ticket`, solo para mostrar. No se guarda aparte. | Todos |
| 6 | Estructura del backend según el documento: carpeta `backend/app/` con `routers/`, `models/`, `schemas/` y `services/`, y SQLAlchemy. Se aplica antes de construir el login del daily 3. | Cristian, Magleony |
| 7 | Contrato del login para el daily 3: ruta `POST /api/v1/auth/login`, token JWT de 60 minutos con renovación (refresh token), según RF-01. | Magleony, Vidal, Jaider |
| 8 | En el dashboard, «tickets abiertos» son los que no están `Cerrado`. Confirmar con el equipo. | Todos |

---

## 8. Criterios de aceptación

- `SHOW TABLES;` en `sistemas_ar` devuelve 14 tablas y los 10 índices existen.
- `database/mibasededatos.sql` y `database/datos_prueba.sql` están en el repositorio y reproducen exactamente la base.
- El script que se ejecuta en el servidor compartido no tiene `DROP DATABASE` ni el bloque DCL con usuarios `localhost`.
- `datos_prueba.sql` cubre los 4 estados, las 4 prioridades, ambas modalidades, una nota interna, un reporte por ticket resuelto o cerrado y una calificación de 1 estrella.
- `datosFalsos.js` usa solo campos y valores del esquema de la sección 4.
- Las vistas 17, 14, 16 y 20 cumplen lo de la sección 3 (bloque D), usan solo `adminService.js` y no contienen inventario, SLA ni costos.
- Ningún archivo del repositorio contiene contraseñas reales, hashes reales ni datos de conexión.

---

## 9. Prompt sugerido para el agente

> Lee `docs/daily-teylork-adaptacion-documentacion.md`. Soy Teylork. Ejecuta el Bloque A primero y no ejecutes ningún SQL destructivo sin mi confirmación escrita. Luego los Bloques B y C, y por último las vistas del Bloque D en el orden 17, 14, 16 y 20. Usa solo los nombres de campo de la sección 4 y pregúntame si algo no está claro.
