#!/bin/bash

# Script de backup de base de datos para MidatoPay
# Uso: ./backup-db.sh

set -e

BACKUP_DIR="/var/www/midatopay/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/midatopay_backup_$TIMESTAMP.sql"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

echo "🔄 Creando backup de la base de datos..."

# Verificar que el contenedor de postgres esté corriendo
if ! docker ps | grep -q midatopay-postgres-prod; then
    echo "❌ Error: El contenedor de PostgreSQL no está corriendo"
    exit 1
fi

# Crear backup
docker exec midatopay-postgres-prod pg_dump -U midatopay midatopay > "$BACKUP_FILE"

# Comprimir backup
echo "📦 Comprimiendo backup..."
gzip "$BACKUP_FILE"
BACKUP_FILE_COMPRESSED="${BACKUP_FILE}.gz"

# Verificar que el backup se creó correctamente
if [ -f "$BACKUP_FILE_COMPRESSED" ]; then
    SIZE=$(du -h "$BACKUP_FILE_COMPRESSED" | cut -f1)
    echo "✅ Backup creado exitosamente: $BACKUP_FILE_COMPRESSED"
    echo "   Tamaño: $SIZE"
    
    # Eliminar backups antiguos (mantener solo los últimos 7 días)
    echo "🧹 Eliminando backups antiguos (más de 7 días)..."
    find "$BACKUP_DIR" -name "midatopay_backup_*.sql.gz" -mtime +7 -delete
    
    echo "✅ Backup completado!"
else
    echo "❌ Error: No se pudo crear el backup"
    exit 1
fi

