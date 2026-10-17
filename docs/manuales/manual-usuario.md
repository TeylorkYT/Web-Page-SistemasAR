# Manual de Usuario Final por Rol — SistemasAR

**Versión:** 2.0  
**Fecha:** Octubre 2026  
**Sistema:** Plataforma Web de Mesa de Ayuda y Soporte Técnico  
**Equipo:** Vidal (Frontend & Documentación de Usuario), Jaider (Frontend Layout), Teylork (Líder Técnico).

---

## 1. Introducción y Acceso a la Plataforma

SistemasAR es una plataforma diseñada para centralizar, atender y resolver solicitudes de soporte técnico informático en hardware y software de forma ágil y transparente.

La plataforma cuenta con tres perfiles o roles claramente diferenciados:
- **Cliente:** Usuarios que solicitan asistencia técnica para sus equipos tecnológicos.
- **Técnico:** Personal especializado responsable de diagnosticar y solucionar incidencias.
- **Administrador:** Coordinadores de soporte encargados de la supervisión, métricas, gestión de personal y asignación de carga de trabajo.

---

## 2. Guía para el Rol Cliente

### 2.1 Registro de Cuenta e Inicio de Sesión
1. Ingrese a la dirección web `https://sistemasar.net`.
2. Si no dispone de cuenta, haga clic en **"Registrarse"**, complete su nombre, apellido, correo electrónico corporativo o personal, teléfono, empresa (opcional) y defina una contraseña segura (mínimo 8 caracteres).
3. Una vez registrado, inicie sesión con su correo electrónico y contraseña.

### 2.2 Recuperación de Contraseña
1. Si ha olvidado su clave de acceso, haga clic en el enlace **"¿Olvidaste tu contraseña?"** en la pantalla de inicio de sesión.
2. Ingrese su correo electrónico y presione **"Enviar Instrucciones"**.
3. Por motivos de seguridad y privacidad, el sistema mostrará un mensaje confirmando el envío sin revelar si el correo existe o no en la base de datos.
4. Revise su bandeja de entrada (y carpeta de correo no deseado/spam). Recibirá un mensaje de **SistemasAR Soporte** con un botón de acceso seguro de un solo uso válido por 30 minutos.
5. Ingrese su nueva contraseña, confírmela y presione **"Restablecer Contraseña"**. Su contraseña quedará actualizada y podrá iniciar sesión de inmediato.

### 2.3 Registro y Consulta de Equipos
Antes de crear tickets, o durante la creación de los mismos, puede consultar los equipos tecnológicos vinculados a su cuenta:
1. Acceda a la sección **"Mis Equipos"** en el menú superior o lateral.
2. Presione **"Registrar Equipo"** para dar de alta computadores, impresoras, servidores o dispositivos móviles indicando tipo, marca, modelo y número de serie único.

### 2.4 Creación de Ticket de Soporte Técnico con Evidencias
1. En el panel principal del cliente, haga clic en el botón destacado **"Crear Ticket"** o **"Nuevo Ticket"**.
2. Complete los campos requeridos:
   - **Título de la incidencia:** Breve descripción del problema (ej. *"Pantalla azul recurrente en laptop de contabilidad"*).
   - **Descripción detallada:** Pasos para reproducir el fallo, mensajes de error observados y urgencia percibida.
   - **Categorías del servicio:** Seleccione una o varias opciones aplicables (ej. *Hardware*, *Sistema Operativo*, *Redes*).
   - **Equipo afectado:** Seleccione el equipo de su catálogo previamente registrado (o déjelo en blanco si es una consulta general).
   - **Modalidad preferida:** Seleccione entre *Remoto* o *Presencial*.
3. **Sección de Evidencias y Archivos Adjuntos (RF-08):**
   - Puede adjuntar hasta **3 archivos de evidencia** (fotografías del error, capturas de pantalla o documentos de diagnóstico).
   - Formatos permitidos: `.jpg`, `.png`, `.pdf`.
   - Tamaño máximo por archivo: **5 MB**.
   - Al seleccionar los archivos observará una vista previa con el nombre y tamaño.
4. Haga clic en **"Crear Ticket"**. El ticket quedará registrado en estado **Abierto** y recibirá un correo de confirmación de apertura.

### 2.5 Seguimiento, Comentarios y Descarga de Archivos
1. En la tabla **"Mis Tickets"**, haga clic sobre cualquier ticket para abrir su vista de detalle.
2. Podrá observar en tiempo real:
   - Estado actual (*Abierto*, *En Proceso*, *Resuelto*, *Cerrado*).
   - Técnico de soporte asignado.
   - Historial de cambios con fecha y hora.
   - Archivos de evidencia adjuntos, los cuales puede previsualizar o descargar de forma segura.
3. Para comunicarse con el equipo técnico, escriba su mensaje en la sección **"Comentarios"** y presione enviar. Toda respuesta técnica le notificará en la campana de alertas y por correo electrónico.

### 2.6 Calificación del Servicio y Cierre del Ticket
1. Cuando el técnico solucione la incidencia, el ticket pasará a estado **Resuelto**.
2. Podrá leer el diagnóstico final y la solución aplicada por el técnico.
3. Aparecerá el módulo de **"Calificación de Servicio"**:
   - Asigne una valoración de **1 a 5 estrellas**.
   - Ingrese un comentario u opinión sobre la calidad y rapidez del servicio recibido.
   - Haga clic en **"Enviar Calificación"**.
4. El ticket pasará automáticamente a estado **Cerrado**, concluyendo el ciclo de soporte.

---

## 3. Guía para el Rol Técnico

### 3.1 Panel de Atención y Filtros
1. Al ingresar con perfil técnico, accederá al panel **"Tickets Asignados"**.
2. Visualizará exclusivamente las incidencias que el administrador le haya asignado.
3. Utilice los filtros rápidos por estado (*En Proceso*, *Resuelto*) y por nivel de prioridad (*Crítica*, *Alta*, *Media*, *Baja*).

### 3.2 Atención del Ticket y Revisión de Evidencias
1. Seleccione un ticket de la lista para ver el expediente completo.
2. Revise la descripción del cliente, el equipo tecnológico asociado y descargue los archivos adjuntos de evidencia para analizar el problema técnico reportado.
3. El técnico puede subir evidencias complementarias si fuera necesario.

### 3.3 Notas Internas vs. Comentarios Públicos
Al redactar una respuesta en el ticket, dispone de la opción:
- **Comentario Público:** Visible inmediatamente para el cliente solicitante y el administrador.
- **Nota Interna (`es_interno`):** Marque la casilla *"Nota interna de soporte"*. Esta nota solo será visible para el equipo de soporte y administradores, ideal para registrar comandos técnicos aplicados, pruebas realizadas o detalles de arquitectura confidenciales.

### 3.4 Elaboración del Informe Técnico de Solución (Cierre a Resuelto)
1. Una vez ejecutada la reparación o asistencia, haga clic en el botón **"Registrar Solución"** o **"Resolver Ticket"**.
2. Se desplegará el formulario formal del informe:
   - **Diagnóstico Técnico:** Explicación técnica de la causa raíz de la falla.
   - **Solución Aplicada:** Detalle de las acciones correctivas implementadas, parches instalados o componentes reemplazados.
3. Al presionar **"Confirmar y Resolver"**, el ticket cambiará automáticamente a estado **Resuelto** y se enviará una notificación por correo al cliente invitándolo a validar y calificar.

### 3.5 Consulta de Calificaciones Recibidas
- En la sección **"Calificaciones"**, el técnico puede supervisar su desempeño histórico, promedio de estrellas acumulado y leer las reseñas dejadas por los usuarios.

---

## 4. Guía para el Rol Administrador

### 4.1 Tablero de Control y Métricas Analíticas (Dashboard)
El Administrador cuenta con un centro de mando con indicadores clave de rendimiento (KPIs):
- Total de tickets clasificados por estado (*Abiertos*, *En Proceso*, *Resueltos*, *Cerrados*).
- Distribución de incidencias por nivel de prioridad.
- Tiempos promedio de resolución expresados en horas.
- Alertas inmediatas ante calificaciones bajas ($\le$ 2 estrellas) para auditoría de calidad.

### 4.2 Asignación de Tickets y Prioridades
1. En la pestaña **"Gestión de Tickets"**, visualice los tickets en estado **Abierto**.
2. Presione **"Asignar"**:
   - Seleccione el técnico idóneo evaluando su disponibilidad actual (*Disponible*, *En Almuerzo* o *Fuera de Servicio*).
   - Asigne la prioridad técnica adecuada (*Baja*, *Media*, *Alta*, *Crítica*).
3. Al confirmar, el ticket cambia inmediatamente a **En Proceso** y se notifican tanto al técnico como al cliente.

### 4.3 Gestión Integral de Usuarios
En la sección **"Usuarios"**:
- **Crear Usuario:** Registre clientes, nuevos técnicos o administradores adicionales.
- **Editar Usuario:** Modifique datos de contacto, especialidades técnicas o actualice contraseñas.
- **Inactivación de Cuentas:** Active o inactive accesos de personal de forma segura (la plataforma bloquea que el administrador en sesión se inactive a sí mismo para evitar bloqueos del sistema).

### 4.4 Gestión del Catálogo de Categorías
En **"Categorías"**, defina y edite las áreas de especialidad del soporte técnico (ej. *Telefonía IP*, *Ciberseguridad*, *Base de Datos*, *Infraestructura Servidores*) para que los clientes tipifiquen correctamente sus requerimientos.

### 4.5 Centro de Reportes y Exportación a PDF y Excel (RF-17)
En la sección **"Reportes"**, el administrador puede consultar y descargar 5 tipos de informes analíticos completos:
1. **Rendimiento por Agente:** Carga de trabajo, tickets cerrados y tiempos promedio por cada técnico.
2. **Distribución por Prioridad:** Porcentajes y volumetría de incidentes según su criticidad.
3. **Tiempos de Resolución:** Métricas de atención y resolución en horas con comparativas históricas.
4. **Estado General del Servicio:** Panorama consolidado del flujo de mesa de ayuda.
5. **Incidencias por Área y Categoría:** Detección de problemas recurrentes por tipo de hardware o servicio.

**Botones de Exportación:**
- **Exportar a Excel:** Genera un archivo `.xlsx` estructurado y estilizado con encabezados oscuros, formato numérico correcto y protección contra inyección de fórmulas.
- **Exportar a PDF:** Genera un documento corporativo `.pdf` listo para impresión o presentación ejecutiva con tablas ordenadas y encabezados institucionales.
