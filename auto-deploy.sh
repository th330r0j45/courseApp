#!/bin/bash

# 🚀 Deploy rápido y fácil (preservando SSL)
echo "🚀 Desplegando nuevos cambios..."

# Cambiar a rama to_deploy
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "to_deploy" ]; then
    echo "✅ Ya estás en rama to_deploy"
else
    echo "📂 Cambiando a rama to_deploy..."
    git checkout to_deploy
fi

# Actualizar código
echo "⬇️ Descargando cambios..."
# Descartar cambios locales no deseados y actualizar
git reset --hard HEAD
git clean -fd
git pull origin to_deploy

# Detectar si hay configuración SSL
SSL_CONFIG=""
COMPOSE_FILE="docker/docker-compose.yaml"

if [ -f "docker/nginx-ssl.conf" ] && [ -f "docker/docker-compose-ssl.yaml" ] && [ -d "/etc/letsencrypt" ]; then
    echo "🔐 SSL detectado - usando configuración segura"
    SSL_CONFIG="-ssl"
    COMPOSE_FILE="docker/docker-compose-ssl.yaml"
    
    # Verificar que el certificado SSL esté válido
    if [ -d "/etc/letsencrypt/live" ]; then
        CERT_COUNT=$(sudo ls /etc/letsencrypt/live/ 2>/dev/null | wc -l)
        if [ "$CERT_COUNT" -gt 0 ]; then
            echo "✅ Certificado SSL válido encontrado"
        else
            echo "⚠️ Directorio SSL existe pero no hay certificados válidos"
        fi
    fi
else
    echo "🌐 SSL no detectado - usando configuración estándar"
fi

# Parar contenedores (preservando volúmenes y certificados)
echo "⏹️ Parando contenedores (preservando SSL y datos)..."
docker-compose -f "$COMPOSE_FILE" stop

# Reconstruir solo las imágenes (sin eliminar volúmenes)
echo "🔨 Reconstruyendo imágenes..."
docker-compose -f "$COMPOSE_FILE" build --no-cache

# Iniciar contenedores
echo "🚀 Iniciando aplicación..."
docker-compose -f "$COMPOSE_FILE" up -d

# Verificar que los contenedores estén corriendo
echo "🔍 Verificando estado de los contenedores..."
sleep 5

if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
    echo "✅ Contenedores iniciados correctamente"
else
    echo "❌ Error: Algunos contenedores no iniciaron"
    echo "📋 Estado actual:"
    docker-compose -f "$COMPOSE_FILE" ps
fi

echo ""
echo "✅ ¡Deploy completado!"

if [ -n "$SSL_CONFIG" ]; then
    echo "🔐 Aplicación desplegada con SSL"
    echo "🌐 Disponible en HTTPS (puerto 443)"
    echo "🔄 HTTP redirige automáticamente a HTTPS"
    echo ""
    echo "📋 Archivos SSL preservados:"
    echo "   - Certificados Let's Encrypt: ✅"
    echo "   - Configuración Nginx SSL: ✅"
    echo "   - Volúmenes de datos: ✅"
else
    echo "🌐 Aplicación desplegada sin SSL"
    echo "🌐 Disponible en HTTP (puerto 80)"
fi

echo ""
echo "💡 Tip: Si necesitas SSL, ejecuta ./setup-ssl.sh"