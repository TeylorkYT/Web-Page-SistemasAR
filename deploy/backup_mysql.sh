#!/usr/bin/env bash
# ==============================================================================
# SCRIPT DE COPIAS DE SEGURIDAD AUTOMÁTICAS - SISTEMASAR (MySQL 8.0)
# Tarea T5-06: mysqldump comprimido por cron + retención de 7 días
# ==============================================================================

set -euo pipefail

BACKUP_DIR="/var/backups/sistemasar"
FECHA="$(date +'%Y%m%d_%H%M%S')"
ARCHIVO_BACKUP="${BACKUP_DIR}/sistemas_ar_${FECHA}.sql.gz"
LOG_FILE="/var/log/sistemasar_backup.log"
DIAS_RETENCION=7

# Cargar variables de entorno del backend si existen
if [ -f "/var/www/sistemasar/backend/.env" ]; then
    export $(grep -v '^#' /var/www/sistemasar/backend/.env | xargs)
fi

DB_USER="${DB_USER:-avnadmin}"
DB_PASS="${DB_PASSWORD:-}"
DB_NAME="${DB_NAME:-sistemas_ar}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"

mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

log_msg() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

log_msg "Iniciando respaldo de base de datos '${DB_NAME}'..."

# Generación del dump con gzip
if [ -n "${DB_PASS}" ]; then
    MYSQL_PWD="${DB_PASS}" mysqldump \
        --host="${DB_HOST}" \
        --port="${DB_PORT}" \
        --user="${DB_USER}" \
        --single-transaction \
        --quick \
        --routines \
        --triggers \
        "${DB_NAME}" | gzip -9 > "${ARCHIVO_BACKUP}"
else
    mysqldump \
        --host="${DB_HOST}" \
        --port="${DB_PORT}" \
        --user="${DB_USER}" \
        --single-transaction \
        --quick \
        --routines \
        --triggers \
        "${DB_NAME}" | gzip -9 > "${ARCHIVO_BACKUP}"
fi

TAMANO=$(du -h "${ARCHIVO_BACKUP}" | cut -f1)
log_msg "Respaldo generado exitosamente: ${ARCHIVO_BACKUP} (${TAMANO})"

# Rotación de copias antiguas (eliminar las que superen los días de retención)
log_msg "Eliminando respaldos con más de ${DIAS_RETENCION} días..."
find "${BACKUP_DIR}" -type f -name "sistemas_ar_*.sql.gz" -mtime +"${DIAS_RETENCION}" -delete

log_msg "Proceso de respaldo finalizado correctamente."

# ==============================================================================
# PROCEDIMIENTO DE RESTAURACIÓN DE PRUEBA:
# Para restaurar este respaldo en una base de datos temporal de verificación:
#   1. gunzip -c /var/backups/sistemasar/sistemas_ar_YYYYMMDD_HHMMSS.sql.gz > /tmp/restore.sql
#   2. mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS sistemas_ar_restore;"
#   3. mysql -u root -p sistemas_ar_restore < /tmp/restore.sql
#   4. mysql -u root -p -e "SELECT count(*) FROM sistemas_ar_restore.Ticket;"
#   5. rm /tmp/restore.sql
# ==============================================================================
