#!/bin/bash

# Script para construir y ejecutar la aplicación con Docker Compose

echo "🚀 Iniciando construcción de contenedores..."

# Detener contenedores existentes
echo "⏹️  Deteniendo contenedores existentes..."
docker-compose -f docker/docker-compose.yaml down

# Construir y ejecutar los contenedores
echo "🔨 Construyendo y ejecutando contenedores..."
docker-compose -f docker/docker-compose.yaml up --build -d

# Mostrar estado de los contenedores
echo "📊 Estado de los contenedores:"
docker-compose -f docker/docker-compose.yaml ps

echo ""
echo "✅ Aplicación desplegada exitosamente!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:3001"
echo "🏥 Health Check: http://localhost:3001/health"
echo ""
echo "Para ver los logs:"
echo "docker-compose -f docker/docker-compose.yaml logs -f"
echo ""
echo "Para detener:"
echo "docker-compose -f docker/docker-compose.yaml down"
