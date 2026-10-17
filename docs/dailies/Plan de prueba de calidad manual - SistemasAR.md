# Plan de prueba de calidad manual — SistemasAR

Rama probada: `develop` (TeylorkYT/Web-Page-SistemasAR) Equipo: Vidal, Teylork, Jaider, Cristian, Magleony

## 1. Objetivo

Revisar a mano todas las vistas del sistema y sus funciones, abriéndolas en el navegador y usándolas como las usaría un usuario real, para dejar por escrito qué falta, qué falla y qué se debería organizar, y al final juntar los datos de los 5 integrantes en un solo informe que sirva para priorizar el trabajo pendiente.

## 2. Reglas del juego

1. Nadie prueba sus propias vistas, así cada uno revisa con ojos nuevos lo que hizo otro compañero.
2. Cada integrante prueba solo las vistas que se le asignan en la sección 3, y no corrige nada mientras prueba, solo anota.
3. Todo hallazgo se anota en la plantilla de la sección 6, con la ruta de la vista, qué hizo, qué esperaba y qué pasó.
4. Todos prueban con la misma rama `develop` actualizada (hacer `git pull` antes de empezar) y con la base de datos compartida.
5. Si algo se encuentra en una vista que no es suya, se anota igual pero en el formato de hallazgo general al final de su plantilla.

## 3. Reparto de vistas

Son 20 vistas en total. Cada persona revisa el bloque que le toca, y ninguno revisa el que hizo.

| Quién prueba | Bloque que revisa | Quién lo hizo en los mockups |
| --- | --- | --- |
| Teylork | Vistas del cliente | Vidal |
| Vidal | Vistas del técnico | Cristian |
| Cristian | Vistas transversales | Jaider |
| Magleony | Vistas del administrador 1 a 4: Dashboard general, Gestión de usuarios, Asignación de técnico a ticket, Gestión de categorías | Teylork |
| Jaider | Autenticación y vistas del administrador 5 a 7: Gestión de inventario, Reportes, Calificaciones recibidas | Magleony y Teylork |

Nota: el listado exacto de vistas de cada bloque se confirma con las rutas que dejó Cristian en el frontend, y cada tester escribe en su plantilla el nombre y la ruta de cada vista que le tocó. Si una vista de la lista no existe en el repositorio (por ejemplo Gestión de inventario, que el Documento Definitivo v2.0 ya no incluye como módulo), se anota como hallazgo para decidir si se quita de los mockups o se deja.

## 4. Preparación antes de probar

1. Hacer `git pull` de la rama `develop` y levantar el frontend (y el backend si la vista ya lo usa).
2. Tener a mano un usuario de prueba por cada rol: cliente, técnico y administrador.
3. Probar en el navegador que cada uno use normalmente, y además una vez en celular o con la ventana angosta para ver cómo se ve responsive.
4. Tener abierta la plantilla de la sección 6 para ir anotando mientras se prueba, y no después de memoria.

## 5. Qué se revisa en cada vista

Este checklist es el mismo para todas las vistas, y por cada punto se marca Sí, No o No aplica.

### 5.1 Carga y acceso

- La vista abre sin errores y sin pantalla en blanco.
- La ruta existe y el menú lateral lleva a ella.
- Solo entra el rol que debe entrar, y un rol que no corresponde es bloqueado o redirigido.
- Al recargar la página (F5) no se pierde la sesión ni se rompe la vista.

### 5.2 Contenido y diseño

- Se ven todos los elementos que muestra el mockup (campos, tablas, botones, textos).
- Se respeta el estándar compartido: menú lateral fijo, barra superior con logo y avatar, botones rectangulares.
- Los textos están sin errores de ortografía y con nombres consistentes entre vistas.
- Se ve bien en pantalla grande y en pantalla pequeña, sin elementos cortados o encimados.

### 5.3 Funciones

- Cada botón, enlace y formulario hace lo que dice.
- Los formularios validan campos vacíos, formatos incorrectos y datos repetidos, con mensajes claros.
- Crear, editar, listar y filtrar o buscar funcionan donde aplica.
- Después de guardar, la vista muestra el cambio sin tener que recargar.
- Los datos que se muestran vienen del backend y no están quemados en el código.

### 5.4 Casos límite

- Qué pasa con la lista vacía (sin tickets, sin usuarios, etc.).
- Qué pasa si el backend no responde o devuelve error.
- Qué pasa con textos muy largos, números negativos o caracteres raros.
- Qué pasa si se da doble clic al botón de guardar.

### 5.5 Organización

- Algo que está en un lugar confuso y se debería mover.
- Algo que se repite en varias vistas y se podría volver un componente compartido.
- Nombres de rutas, archivos o carpetas que no siguen el mismo estilo.
- Pasos que se pueden hacer en menos clics.

## 6. Plantilla de registro de hallazgos

Cada integrante copia esta plantilla y la llena con su nombre. Hay una fila por cada hallazgo.

| # | Vista y ruta | Tipo | Qué hice | Qué esperaba | Qué pasó o qué falta | Gravedad | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 |  | Falta / Falla / Organizar |  |  |  | Alta / Media / Baja | captura o nota |

Por cada hallazgo se elige un solo tipo:

- **Falta**: algo que está en el mockup o en los requerimientos y no existe en la vista.
- **Falla**: algo que existe pero no funciona o funciona mal.
- **Organizar**: algo que funciona pero está mal ubicado, repetido o desordenado.

Gravedad:

- **Alta**: la vista no se puede usar o se pierde información.
- **Media**: se puede usar pero con un problema que se nota.
- **Baja**: detalle visual, de texto o de orden.

### Resumen por vista

Al terminar su bloque, cada integrante llena también esta tabla con una fila por vista revisada.

| Vista y ruta | Carga | Diseño | Funciones | Casos límite | Total Falta | Total Falla | Total Organizar | Estado general |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | Sí / No | Sí / No | Sí / No | Sí / No |  |  |  | Lista / Con ajustes / Rehacer |

## 7. Consolidación final

Cuando los 5 terminan, Teylork junta todas las plantillas en un solo documento y hace lo siguiente:

1. Unir todos los hallazgos en una sola tabla, ordenada por vista, y quitar los repetidos (si dos personas anotaron lo mismo, queda uno solo).
2. Contar cuántos hallazgos hay por tipo (Falta, Falla, Organizar), por gravedad y por vista, para saber cuáles vistas están peor.
3. Armar la lista de pendientes en este orden: primero las fallas de gravedad alta, luego lo que falta de gravedad alta, luego las fallas medias, y al final lo de organizar y lo de gravedad baja.
4. Asignar cada pendiente a una capa y a un responsable (frontend, backend o base de datos) según el reparto del equipo.
5. Guardar el resultado como un archivo `.md` dentro del proyecto para que el equipo y el agente lo puedan leer.

## 8. Entrega

| Qué | Quién | Cuándo |
| --- | --- | --- |
| Preparar entorno y usuarios de prueba | Todos | Antes de empezar |
| Probar el bloque asignado y llenar la plantilla | Cada integrante | Fecha acordada por el equipo |
| Entregar la plantilla llena a Teylork | Cada integrante | Fecha acordada por el equipo |
| Consolidar y priorizar | Teylork | Después de recibir las 5 plantillas |
| Reunión corta para repartir los pendientes | Todos | Después de consolidar |

## 9. Cuadro de seguimiento general

| Integrante | Bloque | Vistas revisadas | Hallazgos | Entregó plantilla |
| --- | --- | --- | --- | --- |
| Teylork | Vistas del cliente | 6 / 6 (100%) | 13 (12 corregidos) | Sí ([Ver plantilla](file:///c:/TEYLORK/WORKSPACE/SistemasAR/Web-Page-SistemasAR/docs/dailies/Plantilla%20de%20hallazgos%20-%20Teylork%20-%20Vistas%20del%20Cliente.md)) |
| Vidal | Vistas del técnico |  |  |  |
| Cristian | Vistas transversales |  |  |  |
| Magleony | Administrador 1 a 4 |  |  |  |
| Jaider | Autenticación y administrador 5 a 7 |  |  |  |
