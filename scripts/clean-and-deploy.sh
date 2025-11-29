#!/bin/bash

# Script completo para limpiar, actualizar y desplegar
# Ejecutar en Termius: bash scripts/clean-and-deploy.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}📦 Paso 1: Limpiando directorios residuales...${NC}"
# Eliminar directorios que no están en el nuevo repositorio
rm -rf starknet-token 2>/dev/null || true
rm -rf cairo-contracts 2>/dev/null || true
rm -rf midatopay-mobile 2>/dev/null || true

echo -e "${GREEN}📦 Paso 2: Actualizando remote del repositorio...${NC}"
git remote set-url origin https://github.com/Jack28cas/midatopay-poly.git

echo -e "${GREEN}📦 Paso 3: Obteniendo últimos cambios...${NC}"
git fetch origin main

echo -e "${GREEN}📦 Paso 4: Resolviendo ramas divergentes (reset hard)...${NC}"
git reset --hard origin/main

echo -e "${GREEN}📦 Paso 5: Limpiando archivos no rastreados...${NC}"
git clean -fd

echo -e "${GREEN}✅ Repositorio actualizado correctamente!${NC}"
echo ""

echo -e "${GREEN}📦 Paso 6: Deteniendo contenedores existentes...${NC}"
docker-compose -f docker-compose.prod.yml down

echo -e "${GREEN}📦 Paso 7: Construyendo imágenes Docker...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

echo -e "${GREEN}📦 Paso 8: Iniciando contenedores...${NC}"
docker-compose -f docker-compose.prod.yml up -d

echo -e "${GREEN}📦 Paso 9: Esperando a que los servicios estén listos...${NC}"
sleep 15

echo -e "${GREEN}📦 Paso 10: Ejecutando migraciones de base de datos...${NC}"
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy || {
    echo -e "${YELLOW}⚠️  Las migraciones pueden haber fallado, revisa los logs${NC}"
}

echo -e "${GREEN}📦 Paso 11: Generando cliente de Prisma...${NC}"
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma generate || {
    echo -e "${YELLOW}⚠️  Error generando cliente de Prisma${NC}"
}

echo -e "${GREEN}✅ Despliegue completado!${NC}"
echo ""
echo -e "${GREEN}📊 Verificando estado de los contenedores...${NC}"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}📋 Para ver los logs en tiempo real:${NC}"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo -e "${GREEN}📋 Para ver logs específicos:${NC}"
echo "   docker-compose -f docker-compose.prod.yml logs -f backend"
echo "   docker-compose -f docker-compose.prod.yml logs -f frontend"

