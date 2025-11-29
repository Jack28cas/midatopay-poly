FROM node:18-slim

# Instalar dependencias del sistema para Prisma y OpenSSL
RUN apt-get update && \
    apt-get install -y openssl libssl-dev passwd && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /app

# ============================================
# PASO 1: Instalar dependencias
# ============================================
# Copiar solo package.json primero (optimización de cache)
# Si package.json no cambia, Docker reutiliza esta capa
COPY package*.json ./

# Instalar TODAS las dependencias (necesitamos prisma para generar cliente)
RUN npm ci

# ============================================
# PASO 2: Copiar código y generar Prisma
# ============================================
# Copiar el resto del código
COPY . .

# Generar cliente de Prisma (necesita el código fuente)
RUN npx prisma generate

# ============================================
# PASO 3: Limpiar (opcional, para imagen más pequeña)
# ============================================
# Eliminar devDependencies que ya no necesitamos
RUN npm prune --production

# ============================================
# PASO 4: Configurar ejecución
# ============================================
# Exponer puerto
EXPOSE 3001

# Usuario no-root por seguridad
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nodejs

# Cambiar ownership de los archivos ANTES de cambiar de usuario
# Nota: Cambiar ownership después de copiar todo el código
RUN chown -R nodejs:nodejs /app

# Cambiar a usuario no-root
USER nodejs

# Comando por defecto
CMD ["npm", "start"]
