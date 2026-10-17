# Manual de Instalación, Configuración y Despliegue en Servidor VPS — SistemasAR

**Versión:** 2.0  
**Fecha:** Octubre 2026  
**Entorno de Producción Objetivo:** Hostinger VPS KVM 1 (Ubuntu 22.04 LTS, 1 vCPU, 4 GB RAM, 50 GB NVMe)  
**Dominio:** `sistemasar.net`  
**Responsable:** Teylork (Líder Técnico & Infraestructura) con apoyo de Vidal.

---

## 1. Requisitos Previos y Preparación del Servidor

### 1.1 Paquetes del Sistema Operativo
Actualizar repositorios e instalar las dependencias base:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw build-essential python3-dev python3-pip python3-venv \
    mysql-server nginx certbot python3-certbot-nginx
```

### 1.2 Creación de Usuario de Sistema No-Root
Para ejecutar los servicios de forma aislada sin privilegios de superusuario:

```bash
sudo adduser --disabled-password --gecos "" sistemasar
sudo usermod -aG sudo sistemasar
```

### 1.3 Configuración de Firewall Perimetral (UFW)
Asegurar que únicamente los puertos web (80, 443) y administración remota segura (22) queden expuestos al exterior. MySQL (3306) y Uvicorn (8000) **nunca** deben exponerse a internet:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status verbose
```

---

## 2. Configuración y Despliegue de la Base de Datos (MySQL 8.0)

### 2.1 Asegurar el Motor MySQL
1. Verificar que MySQL escuche únicamente en la interfaz local de bucle (`127.0.0.1`):
   ```bash
   sudo sed -i 's/^bind-address.*/bind-address = 127.0.0.1/' /etc/mysql/mysql.conf.d/mysqld.cnf
   sudo systemctl restart mysql
   ```
2. Ejecutar el asistente de aseguramiento:
   ```bash
   sudo mysql_secure_installation
   ```

### 2.2 Creación del Esquema y Usuarios de Producción
1. Acceder a MySQL y crear la base de datos con cotejamiento UTF-8 seguro:
   ```sql
   CREATE DATABASE sistemas_ar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Importar el DDL estructural oficial (**nunca** cargar `datos_prueba.sql` en producción):
   ```bash
   mysql -u root -p sistemas_ar < /var/www/sistemasar/database/mibasededatos.sql
   ```
3. Crear el usuario de aplicación con privilegios acotados:
   ```sql
   CREATE USER 'sistemasar_app'@'127.0.0.1' IDENTIFIED BY 'CLAVE_SEGURA_ALEATORIA_PROD_123!';
   GRANT SELECT, INSERT, UPDATE, DELETE ON sistemas_ar.* TO 'sistemasar_app'@'127.0.0.1';
   FLUSH PRIVILEGES;
   ```

---

## 3. Despliegue del Backend (FastAPI + Uvicorn + Systemd)

### 3.1 Estructura en el Servidor
Clonar o transferir el código del repositorio a `/var/www/sistemasar`:

```bash
sudo mkdir -p /var/www/sistemasar
sudo chown -R sistemasar:sistemasar /var/www/sistemasar
cd /var/www/sistemasar
git clone https://github.com/TeylorkYT/Web-Page-SistemasAR.git .
```

### 3.2 Entorno Virtual y Dependencias
```bash
cd /var/www/sistemasar/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 3.3 Directorio de Almacenamiento de Evidencias
Crear el directorio dedicado para adjuntos de tickets con permisos adecuados:

```bash
mkdir -p /var/www/sistemasar/backend/uploads
chmod 750 /var/www/sistemasar/backend/uploads
```

### 3.4 Configuración del Archivo `.env` de Producción
Crear el archivo `/var/www/sistemasar/backend/.env` con valores seguros de producción:

```env
ENV=production
PROJECT_NAME="SistemasAR Mesa de Ayuda"
API_V1_STR="/api/v1"

# Conexión a Base de Datos
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=sistemasar_app
DB_PASSWORD=CLAVE_SEGURA_ALEATORIA_PROD_123!
DB_NAME=sistemas_ar

# Criptografía y JWT (Cadena aleatoria de 64 caracteres)
JWT_SECRET=b65f7c32e91048e98031d234a5d8f6120c99f1b74e892c57849e7fa1230485d2
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Seguridad CORS
CORS_ORIGINS=["https://sistemasar.net", "https://www.sistemasar.net"]

# Almacenamiento de Archivos Adjuntos (RF-08)
UPLOAD_DIR=/var/www/sistemasar/backend/uploads
MAX_UPLOAD_SIZE_MB=5

# Servidor SMTP de Notificaciones y Recuperación (RF-15 y RF-03)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=soporte@sistemasar.net
SMTP_PASSWORD=PASSWORD_CORREO_HOSTINGER
SMTP_FROM="SistemasAR Soporte <soporte@sistemasar.net>"
SMTP_TLS=true
FRONTEND_URL=https://sistemasar.net
```

Proteger el archivo contra lectura no autorizada:
```bash
chmod 600 /var/www/sistemasar/backend/.env
```

### 3.5 Servicio Systemd de Uvicorn
Copiar y habilitar la unidad de servicio proporcionada en `deploy/sistemasar-backend.service`:

```bash
sudo cp /var/www/sistemasar/deploy/sistemasar-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable sistemasar-backend
sudo systemctl start sistemasar-backend
sudo systemctl status sistemasar-backend
```

---

## 4. Compilación y Despliegue del Frontend (React + Vite)

### 4.1 Instalación de Node.js 18+ LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 4.2 Compilación de Archivos Estáticos
Configurar las variables de entorno para que las llamadas a la API se canalicen en el mismo origen HTTPS:

```bash
cd /var/www/sistemasar/frontend
echo "VITE_API_URL=/api/v1" > .env.production
npm ci
npm run build
```

El resultado compilado quedará listo en `/var/www/sistemasar/frontend/dist`.

---

## 5. Servidor Web y Proxy Inverso Nginx

### 5.1 Enlace de Configuración
Copiar o enlazar la configuración optimizada de `deploy/nginx.conf`:

```bash
sudo cp /var/www/sistemasar/deploy/nginx.conf /etc/nginx/sites-available/sistemasar.conf
sudo ln -s /etc/nginx/sites-available/sistemasar.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

### 5.2 Obtención de Certificado SSL/TLS con Certbot
Emitir los certificados gratuitos con renovación automática:

```bash
sudo certbot --nginx -d sistemasar.net -d www.sistemasar.net
```

Validar sintaxis y reiniciar Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. Automatización de Respaldos (Backups)

### 6.1 Instalación del Script de Backup
Instalar el script `deploy/backup_mysql.sh` para copias diarias comprimidas:

```bash
sudo mkdir -p /var/backups/sistemasar
sudo cp /var/www/sistemasar/deploy/backup_mysql.sh /usr/local/bin/backup_sistemasar.sh
sudo chmod +x /usr/local/bin/backup_sistemasar.sh
```

### 6.2 Programación en Crontab
Editar el crontab de superusuario (`sudo crontab -e`) y añadir la ejecución automática a las 02:00 AM todos los días con retención de 7 días:

```cron
0 2 * * * /usr/local/bin/backup_sistemasar.sh >> /var/log/sistemasar_backup.log 2>&1
```

### 6.3 Procedimiento de Restauración Verificado
Para probar o ejecutar una restauración en una base de datos temporal:
```bash
# 1. Descomprimir respaldo
gunzip -c /var/backups/sistemasar/sistemas_ar_YYYYMMDD_HHMMSS.sql.gz > /tmp/restauracion_prueba.sql

# 2. Crear base de verificación
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS sistemas_ar_restore CHARACTER SET utf8mb4;"

# 3. Importar estructura y datos
mysql -u root -p sistemas_ar_restore < /tmp/restauracion_prueba.sql

# 4. Verificar integridad y conteo de registros
mysql -u root -p -e "SELECT count(*) AS total_tickets FROM sistemas_ar_restore.Ticket;"

# 5. Limpieza de archivo temporal
rm /tmp/restauracion_prueba.sql
```

---

## 7. Pruebas de Carga y Rendimiento (Locust)

Se incluye el script `deploy/test_carga_locust.py` para someter al sistema a 100 usuarios concurrentes simultáneos realizando inicios de sesión, navegación de tickets y generación de incidencias.

### 7.1 Ejecución en Modo Headless
```bash
pip install locust
locust -f /var/www/sistemasar/deploy/test_carga_locust.py \
    --headless \
    -u 100 \
    -r 10 \
    --run-time 2m \
    --host https://sistemasar.net
```

### 7.2 Métricas de Aceptación (RNF-02)
- **Tasa de error (HTTP 500):** 0%.
- **Latencia promedio de respuesta:** < 800 ms.
- **Percentil 95 (p95):** < 1500 ms.
- **Uso de CPU del VPS:** < 65% con 2 workers asíncronos de Uvicorn.
