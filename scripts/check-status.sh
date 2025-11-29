#!/bin/bash

# Script para verificar el estado de los servicios
# Uso: ./check-status.sh

echo "🔍 Verificando estado de MidatoPay..."
echo ""

# Verificar contenedores Docker
echo "📦 Contenedores Docker:"
docker-compose -f /var/www/midatopay/docker-compose.prod.yml ps
echo ""

# Verificar servicios del sistema
echo "🖥️  Servicios del sistema:"
systemctl is-active --quiet nginx && echo "✅ Nginx: Activo" || echo "❌ Nginx: Inactivo"
echo ""

# Verificar puertos
echo "🔌 Puertos escuchando:"
netstat -tlnp | grep -E ':(80|443|3000|3001)' || ss -tlnp | grep -E ':(80|443|3000|3001)'
echo ""

# Verificar certificado SSL
echo "🔒 Certificado SSL:"
if [ -f "/etc/letsencrypt/live/midatopay.com/fullchain.pem" ]; then
    echo "✅ Certificado encontrado"
    openssl x509 -in /etc/letsencrypt/live/midatopay.com/fullchain.pem -noout -dates
else
    echo "❌ Certificado no encontrado"
fi
echo ""

# Verificar salud de la API
echo "🏥 Health Check API:"
curl -s http://localhost:3001/health | jq . || echo "❌ No se pudo conectar a la API"
echo ""

# Verificar logs recientes
echo "📋 Últimos errores en logs (si hay):"
docker-compose -f /var/www/midatopay/docker-compose.prod.yml logs --tail=10 | grep -i error || echo "✅ No hay errores recientes"
echo ""

# Verificar espacio en disco
echo "💾 Espacio en disco:"
df -h /var/www/midatopay | tail -1
echo ""

echo "✅ Verificación completada"

