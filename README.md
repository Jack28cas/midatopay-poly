# MidatoPay - Deployment Guide

## 🚀 Overview

MidatoPay es una plataforma de pagos Web3 que permite a comercios argentinos recibir pagos en USDC a través de códigos QR interoperables. La plataforma utiliza **Polygon Mainnet** para procesar transacciones.

## 📋 Stack Tecnológico

- **Blockchain**: Polygon Mainnet
- **Backend**: Node.js + Express.js
- **Frontend**: Next.js 14
- **Base de Datos**: PostgreSQL 15
- **Autenticación**: Clerk
- **Blockchain Library**: ethers.js v6



### ✅ Implementado
- **Polygon Mainnet**: Integración completa
- **Contratos Solidity**:
  - `DynamicFxOracle` (0x2eF8D1930b1d20504445943A18d6F70e7ce6ABbe) - Para cotizaciones ARS/USDC
  - `PaymentGateway` (0x52a83a44aa073C0a423f914A6c824DA640ED2F6A) - Para procesar pagos
- **Wallets Ethereum/Polygon**: Generación usando `ethers.Wallet.createRandom()`
- **QR Codes EMVCo TLV**: Formato simplificado con 3 campos (merchant, amount, paymentId)

## 🐳 Docker Setup

### Estructura de Contenedores

```
midatopay/
├── backend/          # API Node.js/Express
├── frontend/         # Next.js App
├── docker-compose.yml           # Desarrollo
└── docker-compose.prod.yml      # Producción
```

### Servicios Docker

1. **postgres**: Base de datos PostgreSQL
2. **backend**: API REST (Puerto 3001)
3. **frontend**: Aplicación Next.js (Puerto 3000)

## 📦 Instalación y Configuración

### 1. Clonar Repositorio

```bash
git clone <repository-url>
cd midatopay
```

### 2. Configurar Variables de Entorno

#### Backend (`backend/.env`)

```bash
# Copiar ejemplo
cp backend/env.example backend/.env

# Editar con tus valores
nano backend/.env
```

**Variables Requeridas:**

```env
# Database
DATABASE_URL="postgresql://usuario:password@localhost:5432/midatopay"

# JWT
JWT_SECRET="tu_jwt_secret_super_seguro_aqui"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="production"

# Polygon Configuration (CRÍTICO)
POLYGON_RPC_URL="https://polygon-mainnet.infura.io/v3/TU_INFURA_KEY"
POLYGON_ORACLE_ADDRESS="0x2eF8D1930b1d20504445943A18d6F70e7ce6ABbe"
POLYGON_PAYMENT_GATEWAY_ADDRESS="0x52a83a44aa073C0a423f914A6c824DA640ED2F6A"
POLYGON_USDC_ADDRESS="0xC37c16139a8eFC8f4c2B7CAA5C607514C825FC4C"
POLYGON_ADMIN_PRIVATE_KEY="tu_private_key_del_admin_aqui"  # ⚠️ CRÍTICO

# Wallet Encryption (32 bytes mínimo)
WALLET_ENCRYPTION_KEY="midatopay-wallet-key-2024-secure-32bytes!!"

# Clerk Authentication
CLERK_SECRET_KEY="sk_live_..."
CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_JWKS_URL="https://tu-instancia.clerk.accounts.dev/.well-known/jwks.json"

# Email (Resend)
RESEND_API_KEY="re_..."
```

#### Frontend (`frontend/.env.production`)

```bash
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NEXT_PUBLIC_WS_URL=wss://api.tudominio.com/ws
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

### 3. Build y Deploy

#### Desarrollo Local

```bash
docker-compose up -d
```

#### Producción

```bash
# Opción 1: Usar script automatizado
chmod +x deploy.sh
./deploy.sh production

# Opción 2: Manual
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

## 🖥️ Deployment en Servidor (Termius)

### Paso 1: Conectar al Servidor

```bash
ssh usuario@tu-servidor-ip
```

### Paso 2: Instalar Docker (si no está instalado)

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reiniciar sesión o ejecutar:
newgrp docker
```

### Paso 3: Clonar y Configurar

```bash
# Ir a directorio de aplicaciones
cd /opt

# Clonar repositorio
git clone <repository-url> midatopay
cd midatopay

# Configurar variables de entorno
cp backend/env.example backend/.env
nano backend/.env  # Editar con tus valores reales

# Crear archivo de frontend
cat > frontend/.env.production << EOF
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NEXT_PUBLIC_WS_URL=wss://api.tudominio.com/ws
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
EOF
```

### Paso 4: Build y Start

```bash
# Build de imágenes
docker-compose -f docker-compose.prod.yml build

# Iniciar servicios
docker-compose -f docker-compose.prod.yml up -d

# Ejecutar migraciones de base de datos
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### Paso 5: Verificar Deployment

```bash
# Ver estado de contenedores
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Health check
curl http://localhost:3001/health
```

## 🔄 Actualizar Aplicación

### Pull y Deploy

```bash
# 1. Ir al directorio
cd /opt/midatopay

# 2. Pull del código
git pull origin main

# 3. Rebuild y restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# 4. Ejecutar migraciones si hay cambios en BD
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

## 🔧 Configuración de Nginx (Reverse Proxy)

### Instalar Nginx

```bash
sudo apt update
sudo apt install nginx
```

### Configurar Site

```bash
sudo nano /etc/nginx/sites-available/midatopay
```

**Contenido:**

```nginx
server {
    listen 80;
    server_name api.tudominio.com;

    # Backend API
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}

server {
    listen 80;
    server_name tudominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Activar Site

```bash
sudo ln -s /etc/nginx/sites-available/midatopay /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com -d api.tudominio.com
```

## 📊 Monitoreo y Logs

### Ver Logs

```bash
# Todos los servicios
docker-compose -f docker-compose.prod.yml logs -f

# Backend solamente
docker-compose -f docker-compose.prod.yml logs -f backend

# Frontend solamente
docker-compose -f docker-compose.prod.yml logs -f frontend

# Últimas 100 líneas
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Estado de Contenedores

```bash
# Ver estado
docker-compose -f docker-compose.prod.yml ps

# Estadísticas de recursos
docker stats
```

## 🔐 Seguridad

### Variables Críticas

⚠️ **NUNCA** commits estas variables a Git:
- `POLYGON_ADMIN_PRIVATE_KEY` - Clave privada del admin (tiene fondos)
- `JWT_SECRET` - Secreto para tokens JWT
- `WALLET_ENCRYPTION_KEY` - Clave para encriptar wallets
- `CLERK_SECRET_KEY` - Secreto de Clerk
- `DATABASE_URL` - URL con contraseña de base de datos

### Backup de Base de Datos

```bash
# Crear backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U midatopay midatopay > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U midatopay midatopay < backup_file.sql
```

## 🐛 Troubleshooting

### Contenedor no inicia

```bash
# Ver logs detallados
docker-compose -f docker-compose.prod.yml logs backend

# Verificar variables de entorno
docker-compose -f docker-compose.prod.yml exec backend env | grep POLYGON

# Reiniciar contenedor
docker-compose -f docker-compose.prod.yml restart backend
```

### Error de conexión a base de datos

```bash
# Verificar que PostgreSQL está corriendo
docker-compose -f docker-compose.prod.yml ps postgres

# Ver logs de PostgreSQL
docker-compose -f docker-compose.prod.yml logs postgres

# Probar conexión
docker-compose -f docker-compose.prod.yml exec backend node -e "console.log(process.env.DATABASE_URL)"
```

### Error en transacciones Polygon

```bash
# Verificar que POLYGON_ADMIN_PRIVATE_KEY está configurada
docker-compose -f docker-compose.prod.yml exec backend env | grep POLYGON_ADMIN

# Verificar que la wallet admin tiene fondos (MATIC) en Polygon
# Usar Polygonscan para verificar: https://polygonscan.com/address/TU_ADDRESS
```

### Frontend no compila

```bash
# Limpiar cache y rebuild
docker-compose -f docker-compose.prod.yml build --no-cache frontend
docker-compose -f docker-compose.prod.yml up -d frontend
```

## 📝 Comandos Útiles

```bash
# Detener todos los servicios
docker-compose -f docker-compose.prod.yml down

# Detener y eliminar volúmenes (⚠️ elimina datos)
docker-compose -f docker-compose.prod.yml down -v

# Rebuild sin cache
docker-compose -f docker-compose.prod.yml build --no-cache

# Ver uso de recursos
docker stats

# Entrar al contenedor backend
docker-compose -f docker-compose.prod.yml exec backend sh

# Ejecutar comandos Prisma
docker-compose -f docker-compose.prod.yml exec backend npx prisma studio
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate status
```

## 🔗 Contratos Polygon

- **Oracle**: `0x2eF8D1930b1d20504445943A18d6F70e7ce6ABbe`
  - Función: `quote(address token, uint256 amountARS) returns(uint256)`
  - Retorna: Cantidad de USDC (6 decimales)

- **Payment Gateway**: `0x52a83a44aa073C0a423f914A6c824DA640ED2F6A`
  - Función: `pay(address merchant, uint256 amountARS, address token, bytes32 paymentId) returns(bool)`
  - Parámetros:
    - `merchant`: Dirección del comercio (42 caracteres)
    - `amountARS`: Cantidad en ARS (sin decimales)
    - `token`: `0xC37c16139a8eFC8f4c2B7CAA5C607514C825FC4C` (USDC)
    - `paymentId`: bytes32 (secuencial: 1, 2, 3...)

- **USDC Token**: `0xC37c16139a8eFC8f4c2B7CAA5C607514C825FC4C` (fake/test)

## 📌 Notas Importantes

1. **PaymentId**: Se genera secuencialmente (`payment_1`, `payment_2`, etc.) y se convierte a `bytes32` para los contratos
2. **Direcciones**: Solo direcciones de 42 caracteres (Polygon/Ethereum). Las direcciones de otros formatos no son compatibles
3. **Gas**: La wallet admin necesita MATIC para pagar el gas de las transacciones
4. **Decimales**: USDC usa 6 decimales en Polygon
5. **Wallets**: Se generan usando `ethers.Wallet.createRandom()` (compatible con Polygon)

## ✅ Checklist de Deployment

- [ ] Variables de entorno configuradas
- [ ] `POLYGON_ADMIN_PRIVATE_KEY` configurada y wallet tiene MATIC
- [ ] `WALLET_ENCRYPTION_KEY` tiene al menos 32 bytes
- [ ] Base de datos PostgreSQL accesible
- [ ] Migraciones ejecutadas (`prisma migrate deploy`)
- [ ] Contenedores corriendo (`docker-compose ps`)
- [ ] Health checks pasando (`/health` endpoint)
- [ ] Nginx configurado (si aplica)
- [ ] SSL configurado (si aplica)
- [ ] Backups de base de datos programados

## 🆘 Soporte

Para problemas:
1. Revisar logs: `docker-compose logs -f`
2. Verificar variables de entorno
3. Verificar que los contratos Polygon están desplegados
4. Verificar que la wallet admin tiene fondos (MATIC)

---

**Última actualización**: Migración completa a Polygon - Noviembre 2025

