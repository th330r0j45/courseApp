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
git pull origin to_deploy

# Detectar si hay configuración SSL
SSL_CONFIG=""
if [ -f "docker/nginx-ssl.conf" ] && [ -d "/etc/letsencrypt" ]; then
    echo "🔐 SSL detectado - usando configuración segura"
    SSL_CONFIG="-ssl"
fi

# Parar contenedores (preservando volúmenes y certificados)
echo "⏹️ Parando contenedores (preservando SSL)..."
docker-compose -f docker/docker-compose${SSL_CONFIG}.yaml stop 2>/dev/null || \
docker-compose -f docker/docker-compose.yaml stop

# Reconstruir solo las imágenes (sin eliminar volúmenes)
echo "🔨 Reconstruyendo imágenes..."
docker-compose -f docker/docker-compose${SSL_CONFIG}.yaml build 2>/dev/null || \
docker-compose -f docker/docker-compose.yaml build

# Iniciar contenedores
echo "🚀 Iniciando aplicación..."
docker-compose -f docker/docker-compose${SSL_CONFIG}.yaml up -d 2>/dev/null || \
docker-compose -f docker/docker-compose.yaml up -d

echo "✅ ¡Deploy completado!"
if [ -n "$SSL_CONFIG" ]; then
    echo "🔐 Aplicación desplegada con SSL"
else
    echo "🌐 Aplicación desplegada"
fi
