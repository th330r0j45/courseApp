#!/bin/bash

echo "🚀 Iniciando construcción de contenedores..."

# Detectar si estamos en EC2
if curl -s -m 2 http://169.254.169.254/latest/meta-data/instance-id > /dev/null 2>&1; then
    echo "🏷️  Detectado entorno EC2, usando configuración optimizada..."
    EC2_ENV=true
    
    # Obtener token para IMDSv2
    TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" -s)
    
    # Obtener instance ID y public IP usando el token
    INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/instance-id)
    PUBLIC_IP=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/public-ipv4)
    
    echo "🆔 Instance ID: $INSTANCE_ID"
    echo "🌐 Public IP: $PUBLIC_IP"
else
    echo "💻 Entorno local detectado..."
    EC2_ENV=false
    PUBLIC_IP="localhost"
fi

# Configurar Angular para usar rutas relativas (modo producción)
echo "🎯 Configurando Angular para producción..."

# Verificar si existe el archivo de configuración de ambiente
if [ -f "src/environments/environment.prod.ts" ]; then
    # Backup del archivo original
    cp src/environments/environment.prod.ts src/environments/environment.prod.ts.backup
    
    # Crear nueva configuración de producción
    cat > src/environments/environment.prod.ts << EOF
export const environment = {
  production: true,
  apiUrl: '/api', // Usar proxy de Nginx
  endpoints: {
    courses: '/courses',
    health: '/health'
  }
};
EOF
    echo "✅ Configuración de Angular actualizada para producción"
else
    echo "⚠️  Archivo environment.prod.ts no encontrado, creando..."
    mkdir -p src/environments
    cat > src/environments/environment.prod.ts << EOF
export const environment = {
  production: true,
  apiUrl: '/api',
  endpoints: {
    courses: '/courses',
    health: '/health'
  }
};
EOF
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

# Esperar a que los contenedores estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 15

# Verificar salud del backend
echo "🏥 Verificando salud del backend..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:3001/health > /dev/null; then
        echo "✅ Backend está saludable"
        break
    else
        echo "⏳ Intento $attempt/$max_attempts - Esperando backend..."
        sleep 2
        ((attempt++))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ Backend no responde después de $max_attempts intentos"
    echo "📊 Logs del backend:"
    docker logs courses-backend --tail 20
else
    # Verificar que el proxy funciona
    echo "🔍 Verificando proxy de Nginx..."
    sleep 5
    if curl -s http://localhost/health > /dev/null; then
        echo "✅ Proxy de Nginx funcionando correctamente"
    else
        echo "⚠️  Verificando configuración del proxy..."
        docker logs courses-frontend --tail 10
    fi
fi

# Mostrar estado de los contenedores
echo "📊 Estado de los contenedores:"
docker-compose -f docker/docker-compose.yaml ps

echo ""
echo "✅ Aplicación desplegada exitosamente!"

if [ "$EC2_ENV" = true ]; then
    echo "🌐 Aplicación completa: http://$PUBLIC_IP"
    echo "🔧 API (a través de proxy): http://$PUBLIC_IP/api/courses/public"
    echo "🏥 Health Check (a través de proxy): http://$PUBLIC_IP/health"
else
    echo "🌐 Aplicación completa: http://localhost"
    echo "🔧 API (a través de proxy): http://localhost/api/courses/public"
    echo "🏥 Health Check (a través de proxy): http://localhost/health"
fi

echo ""
echo "🧪 Pruebas rápidas:"
echo "curl http://$PUBLIC_IP/health"
echo "curl http://$PUBLIC_IP/api/courses/public"

echo ""
echo "🎉 ¡Tu aplicación debería cargar los cursos correctamente ahora!"