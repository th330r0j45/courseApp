#!/bin/bash

# Script de monitoreo específico para EC2

echo "📊 Monitor de aplicación Courses en EC2"
echo "======================================="

# Información de la instancia
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
INSTANCE_TYPE=$(curl -s http://169.254.169.254/latest/meta-data/instance-type)
AZ=$(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone)

echo "🏷️  Instancia: $INSTANCE_ID ($INSTANCE_TYPE)"
echo "🌐 IP Pública: $PUBLIC_IP"
echo "📍 Zona: $AZ"
echo "⏰ Uptime: $(uptime -p)"

echo ""
echo "🐳 Estado de contenedores:"
if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q courses; then
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(NAMES|courses)"
else
    echo "❌ No hay contenedores de la aplicación corriendo"
fi

echo ""
echo "💾 Recursos del sistema:"
echo "CPU:"
top -bn1 | grep "Cpu(s)" | awk '{print $2 $3}' | sed 's/%us,/% usado,/g'

echo "Memoria:"
free -h | awk 'NR==2{printf "  Usado: %s/%s (%.1f%%)\n", $3,$2,$3*100/$2 }'

echo "Disco:"
df -h / | awk 'NR==2{printf "  Usado: %s/%s (%s)\n", $3,$2,$5}'

echo ""
echo "🌐 Conectividad de servicios:"

# Test Backend
if curl -s -f http://localhost:3001/health > /dev/null; then
    HEALTH_RESPONSE=$(curl -s http://localhost:3001/health | jq -r '.status' 2>/dev/null || echo "OK")
    echo "  ✅ Backend: $HEALTH_RESPONSE"
else
    echo "  ❌ Backend: No responde"
fi

# Test Frontend
if curl -s -f http://localhost > /dev/null; then
    echo "  ✅ Frontend: Activo"
else
    echo "  ❌ Frontend: No responde"
fi

# Test API
if curl -s -f http://localhost:3001/api/courses > /dev/null; then
    COURSES_COUNT=$(curl -s http://localhost:3001/api/courses | jq -r '.courses | length' 2>/dev/null || echo "N/A")
    echo "  ✅ API Courses: $COURSES_COUNT cursos disponibles"
else
    echo "  ❌ API Courses: No responde"
fi

echo ""
echo "📊 Estadísticas de contenedores:"
if docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null | grep -q courses; then
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | head -1
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | grep courses
else
    echo "❌ No se pueden obtener estadísticas"
fi

echo ""
echo "🔗 URLs de acceso:"
echo "  🌐 Frontend: http://$PUBLIC_IP"
echo "  🔧 Backend: http://$PUBLIC_IP:3001"
echo "  🏥 Health: http://$PUBLIC_IP:3001/health"

echo ""
echo "📋 Logs recientes (últimas 10 líneas):"
echo "Backend:"
docker logs courses-backend --tail 10 2>/dev/null | sed 's/^/  /' || echo "  No hay logs disponibles"

echo ""
echo "🔧 Comandos de gestión:"
echo "  Logs en tiempo real: docker-compose -f docker/docker-compose.yaml logs -f"
echo "  Reiniciar app: docker-compose -f docker/docker-compose.yaml restart"
echo "  Ver métricas: docker stats"
echo "  Estado AWS: aws ec2 describe-instances --instance-ids $INSTANCE_ID (si AWS CLI está configurado)"
