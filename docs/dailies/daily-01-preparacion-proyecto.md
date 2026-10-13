# Primer daily - Preparación del proyecto sistemasar.net

Oct 9, 2026 · @Teylork

## Objetivo del día

El primer daily deja el proyecto armado y corriendo en los cinco computadores: repositorio, base de datos, backend y frontend conectados entre sí. Todavía no se programa ninguna vista.

Al final del día se abre la página en React y se ve un mensaje que confirma que el backend responde y que la base de datos está conectada. Eso demuestra que las tres capas se hablan, y desde el día siguiente se puede empezar con el login.

Entregables del día:

- Repositorio en GitHub con las carpetas `backend`, `frontend` y `database`, y las ramas `main` y `develop`.
- Base de datos `sistemasar_db` creada en un servidor compartido, con las 8 tablas del script DDL y usuarios de prueba.
- Backend FastAPI corriendo, con una ruta que confirma la conexión a MySQL.
- Frontend React corriendo, con una página que muestra la respuesta del backend.
- Los cinco integrantes con el proyecto clonado y funcionando en su computador.

## Quién hace qué

Cada integrante trabaja en una sola capa, y todos instalan las herramientas y clonan el repositorio.

| Responsable | Tarea | Herramienta | Entregable |
| --- | --- | --- | --- |
| Teylork | Crear el repositorio con la carpeta de la base de datos, `.gitignore`, `README` y las ramas `main` y `develop`, e invitar a los 4 compañeros | GitHub y Git | Repositorio con los 5 integrantes como colaboradores |
| Teylork | Crear `sistemasar_db` en un servidor MySQL compartido en la nube, ejecutar el script DDL y cargar un usuario de prueba por rol | Servicio MySQL en la nube, con Workbench o phpMyAdmin | Base con las 8 tablas y 3 usuarios de prueba (cliente, técnico, administrador), con los dos scripts guardados en el repositorio |
| Magleony | Crear el proyecto FastAPI en `backend/` con la ruta `GET /health`, CORS y `requirements.txt` | Python, FastAPI, Uvicorn | Backend corriendo y la ruta visible en `/docs` |
| Cristian | Crear la conexión a MySQL (`database.py`), el archivo `.env` y la ruta `GET /db-check` | Python, PyMySQL | Ruta que confirma la conexión a la base de datos |
| Vidal | Crear el proyecto React en `frontend/`, con la estructura de carpetas y las rutas base | Node.js, Vite, VS Code | Frontend corriendo en `localhost:5173` |
| Jaider | Preparar logo y colores, y crear el layout base: encabezado con logo y avatar, menú lateral fijo y botones rectangulares | React y CSS | Componente de layout visible en el frontend |
| Todos | Instalar herramientas, clonar el repositorio, crear su rama y comprobar que el proyecto corre | Git y VS Code | Proyecto funcionando en cada computador |

## Orden de ejecución

Todos arrancan en paralelo, y solo tres tareas esperan el pull request de otro compañero.

&#91;embedded content: orden del primer daily por persona · 5 etapas, 3 dependencias entre personas\]

Teylork crea el repositorio y los demás clonan cuando reciben la invitación. Cristian espera el proyecto base de Magleony y la base de datos de Teylork, Jaider espera el de Vidal, y Vidal espera las dos rutas del backend para armar la página `Estado`. El demo espera a todos.

## Cómo hacerlo

Cada persona sigue sus pasos en orden, trabaja en una rama propia y termina abriendo un pull request a `develop`.

### Teylork: repositorio y base de datos

1. En GitHub, crear el repositorio privado `sistemasar` con un `README` y clonarlo en el computador.
2. Crear la carpeta `database/` con el script DDL que ya tienen, y un archivo `.gitignore` con estas líneas: `.env`, `venv/`, `node_modules/` y `__pycache__/`.
3. Subir todo a `main` (`git add .`, `git commit -m "Estructura inicial"`, `git push`) y crear la rama `develop` (`git checkout -b develop`, `git push -u origin develop`).
4. En GitHub, en Settings → Collaborators, invitar a Cristian, Magleony, Vidal y Jaider. Este paso va antes que la base de datos, porque los otros cuatro esperan el repositorio para empezar.
5. Si el plan de GitHub lo permite, proteger `main` en Settings → Branches para exigir pull request. Si no lo permite, el acuerdo es no subir directo a `main`.
6. Crear `sistemasar_db` en un servidor MySQL en la nube que permita conexiones desde fuera, ejecutar el script y verificar que existan las 8 tablas.
7. Escribir `database/datos_prueba.sql` con un usuario por rol (cliente, técnico, administrador), ejecutarlo y subirlo al repositorio. La contraseña definitiva se encripta el día del login.
8. Crear un usuario de MySQL solo para el proyecto, con permisos sobre `sistemasar_db`, y pasarles los datos de conexión (servidor, puerto, usuario, contraseña y nombre de la base) a Cristian y Magleony por mensaje privado, nunca por el repositorio.

La base es única para el equipo y nadie la copia en su computador; los cambios en las tablas los hace solo Teylork con los dos scripts de `database/`.

### Magleony: proyecto base del backend

1. Hacer `git pull`, cambiar a `develop` y crear la rama `feature/backend-base`.
2. Crear la carpeta `backend/`, entrar en ella y crear el entorno virtual con `python -m venv venv`. Activarlo con `venv\Scripts\activate` en Windows o `source venv/bin/activate` en Linux y Mac.
3. Instalar las librerías: `pip install fastapi "uvicorn[standard]" pymysql python-dotenv`.
4. Crear `main.py` con la app, la ruta `GET /health` y el permiso CORS para el frontend (sin CORS, el navegador bloquea las llamadas de React al backend):

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="sistemasar.net")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}
```

5. Correr `uvicorn main:app --reload` y abrir `http://127.0.0.1:8000/docs` para confirmar que la ruta aparece.
6. Guardar las dependencias con `pip freeze > requirements.txt`, subir la rama y abrir el pull request a `develop`. Este pull request va primero, porque Cristian lo necesita para agregar su ruta.

### Cristian: conexión a la base de datos

1. Hacer `git pull`, cambiar a `develop` y crear la rama `feature/db-conexion`.
2. Mientras Magleony sube el proyecto base, escribir `backend/database.py` en su computador, con los datos de conexión leídos desde `.env`:

```python
import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
    )
```

3. Crear `backend/.env` con las claves `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME`. Este archivo nunca se sube, y en DB\_HOST va la dirección del servidor compartido, no localhost. Crear también `backend/.env.example` con las mismas claves y sin contraseña, y ese sí se sube.
4. Cuando Teylork pase los datos de conexión, probar la conexión con un script suelto que ejecute `SELECT 1`, sin esperar el proyecto base.
5. Cuando Magleony suba su pull request, traerlo con `git pull origin develop` y agregar en `main.py` la ruta `GET /db-check`, que ejecuta `SELECT 1` y devuelve `{"database": "ok"}`.
6. Subir la rama y abrir el pull request a `develop`.

### Vidal: proyecto base del frontend

1. Hacer `git pull`, cambiar a `develop` y crear la rama `feature/frontend-base`.
2. En la raíz del repositorio, ejecutar `npm create vite@latest frontend -- --template react`, entrar con `cd frontend` y ejecutar `npm install`.
3. Instalar el manejo de rutas con `npm install react-router-dom`.
4. Crear dentro de `src/` las carpetas `pages/`, `components/` y `services/`.
5. Crear `src/services/api.js` con la dirección del backend:

```javascript
export const API_URL = "http://127.0.0.1:8000";
```

6. Ejecutar `npm run dev`, abrir `http://localhost:5173` y confirmar que la página carga. Subir la rama y abrir el pull request lo antes posible, porque Jaider parte de este proyecto.
7. Cuando las rutas de Magleony y Cristian estén en `develop`, crear `src/pages/Estado.jsx`, que consulta `/health` y `/db-check` y muestra el resultado de cada una:

```javascript
import { useEffect, useState } from "react";
import { API_URL } from "../services/api";

export default function Estado() {
  const [backend, setBackend] = useState("Consultando...");
  const [baseDatos, setBaseDatos] = useState("Consultando...");

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setBackend(data.status))
      .catch(() => setBackend("sin conexión"));

    fetch(`${API_URL}/db-check`)
      .then((res) => res.json())
      .then((data) => setBaseDatos(data.database))
      .catch(() => setBaseDatos("sin conexión"));
  }, []);

  return (
    <div>
      <p>Backend: {backend}</p>
      <p>Base de datos: {baseDatos}</p>
    </div>
  );
}
```

### Jaider: layout base del frontend

1. Mientras Vidal sube el proyecto base, revisar los mockups y sacar el logo, los colores y la tipografía. Escribirlos como variables CSS en un archivo `variables.css`, por ejemplo `--color-primario`.
2. Cuando Vidal suba su pull request, hacer `git pull origin develop` y crear la rama `feature/layout-base`.
3. Crear `src/components/Layout.jsx` con el estándar visual de los mockups: encabezado con logo y avatar, menú lateral fijo y un espacio para el contenido.
4. Crear `src/components/Boton.jsx`, un botón rectangular reutilizable para todas las vistas.
5. Probar el layout con una página de ejemplo y, cuando Vidal suba `Estado.jsx`, mostrarla dentro del layout.
6. Subir la rama y abrir el pull request a `develop`.

## Herramientas

Todos instalan Git y Visual Studio Code; además, cada capa instala lo suyo y Teylork crea la base de datos compartida. La instalación se hace mientras Teylork crea el repositorio, para que nadie espere.

| Herramienta | Para qué sirve | Quién la instala |
| --- | --- | --- |
| Git | Guardar los cambios del código y trabajar en ramas | Todos |
| GitHub | Alojar el repositorio, abrir pull requests y llevar el tablero de tareas (GitHub Projects) | Todos |
| Visual Studio Code | Editor de código | Todos |
| MySQL 8.0 o superior en un servidor compartido, con Workbench o phpMyAdmin | Base de datos única a la que se conectan los cinco, y consola para ejecutar los scripts | Teylork lo crea; Cristian y Magleony se conectan desde el backend |
| Python 3.10 o superior | Ejecutar FastAPI y Uvicorn | Cristian y Magleony |
| Node.js (versión LTS) | Ejecutar React con `npm` y Vite | Vidal y Jaider |
| `/docs` de FastAPI | Probar las rutas del backend desde el navegador, sin necesitar el frontend | Cristian y Magleony |
| WhatsApp o Google Meet | Hacer el daily y avisar bloqueos | Todos |

## Acuerdos y definición de terminado

Estas reglas se leen en voz alta al comienzo del daily y valen para todo el proyecto.

### Reglas de Git

- `main` solo recibe lo que ya funcionó en `develop`; nadie sube directo a `main`.
- Cada tarea tiene su propia rama, con el nombre `feature/<capa>-<tarea>`, por ejemplo `feature/backend-base`.
- Los mensajes de commit son cortos y dicen qué se hizo, por ejemplo "Agrega ruta health".
- Cada pull request lo revisa al menos un compañero de otra capa antes de unirse a `develop`.
- El archivo `.env` nunca se sube; el `.env.example`, sin contraseñas, sí.

### Acuerdos del equipo

- Cada tarea tiene un solo responsable, el de la tabla de este documento.
- Quien se bloquea más de 30 minutos avisa en el grupo en ese momento, sin esperar al siguiente daily.
- Quien termina antes revisa un pull request o ayuda a otro compañero.

* Solo Teylork cambia la estructura de las tablas de la base compartida, y lo hace con scripts guardados en `database/`.
* Nadie borra ni modifica datos que no sean suyos sin avisar antes en el grupo.

### Cuándo una tarea está terminada

Una tarea está terminada cuando el código corre en el computador de quien lo hizo, está subido a su rama, tiene el pull request abierto y otro compañero lo revisó.

## Demo de cierre y reporte del día

El día cierra con un demo de 5 minutos en el que se ve la página de React mostrando que el backend y la base de datos responden.

1. Todos los pull requests del día ya están unidos a `develop`.
2. Teylork hace `git pull origin develop` y arranca el backend con `uvicorn main:app --reload` y el frontend con `npm run dev`.
3. Se abre `http://localhost:5173` y se muestra la página `Estado` dentro del layout, con los textos "Backend: ok" y "Base de datos: ok".

Si algo no quedó integrado, se muestra lo que sí funciona y se anota lo que falta como primera tarea del día siguiente.

Cada integrante deja su reporte en el grupo o en el tablero antes de terminar:

| Integrante | Qué terminé | Enlace al pull request | Qué me falta o me bloqueó |
| --- | --- | --- | --- |
| Teylork |  |  |  |
| Magleony |  |  |  |
| Cristian |  |  |  |
| Vidal |  |  |  |
| Jaider |  |  |  |

Los últimos 15 minutos se usan para acordar el contrato del login del día siguiente: la ruta `POST /login` recibe correo y contraseña, y devuelve el token, el rol y el nombre del usuario.
