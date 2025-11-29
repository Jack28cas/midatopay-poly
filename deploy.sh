#!/bin/bash

# MidatoPay Deployment Script
# Usage: ./deploy.sh [production|development]

set -e

ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.yml"

if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo "🚀 Deploying to PRODUCTION..."
else
    echo "🚀 Deploying to DEVELOPMENT..."
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}📦 Step 1: Pulling latest code...${NC}"
git pull origin main || echo -e "${YELLOW}⚠️  Could not pull from git, continuing...${NC}"

echo -e "${GREEN}📦 Step 2: Building Docker images...${NC}"
docker-compose -f $COMPOSE_FILE build --no-cache

echo -e "${GREEN}📦 Step 3: Stopping existing containers...${NC}"
docker-compose -f $COMPOSE_FILE down

echo -e "${GREEN}📦 Step 4: Starting containers...${NC}"
docker-compose -f $COMPOSE_FILE up -d

echo -e "${GREEN}📦 Step 5: Waiting for services to be ready...${NC}"
sleep 10

echo -e "${GREEN}📦 Step 6: Running database migrations...${NC}"
docker-compose -f $COMPOSE_FILE exec -T backend npx prisma migrate deploy || echo -e "${YELLOW}⚠️  Migrations may have failed, check logs${NC}"

echo -e "${GREEN}📦 Step 7: Generating Prisma client...${NC}"
docker-compose -f $COMPOSE_FILE exec -T backend npx prisma generate || echo -e "${YELLOW}⚠️  Prisma generate may have failed${NC}"

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}📊 Checking container status...${NC}"
docker-compose -f $COMPOSE_FILE ps

echo -e "${GREEN}📋 View logs with: docker-compose -f $COMPOSE_FILE logs -f${NC}"

