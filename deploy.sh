#!/bin/bash

# Script para construir y ejecutar la aplicación con Docker Compose

echo "🚀 Iniciando construcción de contenedores..."

# Detectar si estamos en EC2
if curl -s -m 2 http://169.254.169.254/latest/meta-data/instance-id > /dev/null 2>&1; then
    echo "🏷️  Detectado entorno EC2, usando configuración optimizada..."
    EC2_ENV=true
    PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
else
    echo "💻 Entorno local detectado..."
    EC2_ENV=false
fi

# Verificar que Docker esté corriendo
if ! systemctl is-active --quiet docker 2>/dev/null && ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Iniciando Docker..."
    if command -v systemctl > /dev/null; then
        sudo systemctl start docker
    fi
fi

# Detener contenedores existentes
echo "⏹️  Deteniendo contenedores existentes..."
docker-compose -f docker/docker-compose.yaml down

# Limpiar recursos no utilizados en EC2
if [ "$EC2_ENV" = true ]; then
    echo "🧹 Limpiando recursos no utilizados..."
    docker system prune -f
fi

# Construir y ejecutar los contenedores
echo "🔨 Construyendo y ejecutando contenedores..."
docker-compose -f docker/docker-compose.yaml up --build -d

# Mostrar estado de los contenedores
echo "📊 Estado de los contenedores:"
docker-compose -f docker/docker-compose.yaml ps

echo ""
echo "✅ Aplicación desplegada exitosamente!"

if [ "$EC2_ENV" = true ]; then
    echo "🌐 Frontend: http://$PUBLIC_IP"
    echo "🔧 Backend API: http://$PUBLIC_IP:3001"
    echo "🏥 Health Check: http://$PUBLIC_IP:3001/health"
else
    echo "🌐 Frontend: http://localhost"
    echo "🔧 Backend API: http://localhost:3001"
    echo "🏥 Health Check: http://localhost:3001/health"
fi

echo ""
echo "Para ver los logs:"
echo "docker-compose -f docker/docker-compose.yaml logs -f"
echo ""
echo "Para detener:"
echo "docker-compose -f docker/docker-compose.yaml down"

if [ "$EC2_ENV" = true ]; then
    echo ""
    echo "📊 Para monitorear: ./monitor-ec2.sh"
    echo "🔐 Para SSL: ./setup-ssl-domain.sh"
fi
