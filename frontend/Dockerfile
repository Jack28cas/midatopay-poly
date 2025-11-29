FROM node:18-alpine

# Build arguments para variables de entorno en tiempo de build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL

# Establecer como variables de entorno para el build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (necesitamos devDependencies para el build)
# Usar --legacy-peer-deps para resolver conflictos de peer dependencies
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Limpiar devDependencies después del build
RUN npm prune --production --legacy-peer-deps

# ============================================
# Configurar usuario no-root por seguridad
# ============================================
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Cambiar ownership de los archivos
RUN chown -R nodejs:nodejs /app

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Comando por defecto
CMD ["npm", "start"]
