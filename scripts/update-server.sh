#!/bin/bash

# Script para actualizar el servidor desde el nuevo repositorio
# Ejecutar en Termius: bash scripts/update-server.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}📦 Paso 1: Actualizando remote del repositorio...${NC}"
git remote set-url origin https://github.com/Jack28cas/midatopay-poly.git

echo -e "${GREEN}📦 Paso 2: Obteniendo últimos cambios...${NC}"
git fetch origin main

echo -e "${GREEN}📦 Paso 3: Resolviendo ramas divergentes (reset hard)...${NC}"
git reset --hard origin/main

echo -e "${GREEN}📦 Paso 4: Limpiando archivos no rastreados...${NC}"
git clean -fd

echo -e "${GREEN}✅ Repositorio actualizado correctamente!${NC}"
echo ""
echo -e "${GREEN}Ahora puedes ejecutar Docker:${NC}"
echo "  docker-compose -f docker-compose.prod.yml down"
echo "  docker-compose -f docker-compose.prod.yml build --no-cache"
echo "  docker-compose -f docker-compose.prod.yml up -d"

