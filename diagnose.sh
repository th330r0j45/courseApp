#!/bin/bash

# Script de diagnóstico para problemas de Nginx

echo "🔍 Diagnóstico de la aplicación"
echo "=============================="

# Verificar contenedores
echo "📦 Estado de contenedores:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "📋 Logs del frontend (últimas 20 líneas):"
docker logs courses-frontend --tail 20

echo ""
echo "📋 Logs del backend (últimas 10 líneas):"
docker logs courses-backend --tail 10

echo ""
echo "🌐 Verificando conectividad:"
echo "Frontend local:"
curl -s -o /dev/null -w "  Status: %{http_code}\n" http://localhost

echo "Backend local:"
curl -s -o /dev/null -w "  Status: %{http_code}\n" http://localhost:3001/health

echo "Backend API:"
curl -s -o /dev/null -w "  Status: %{http_code}\n" http://localhost:3001/api/courses

echo ""
echo "📁 Verificando archivos en el contenedor:"
echo "Archivos en /usr/share/nginx/html:"
docker exec courses-frontend ls -la /usr/share/nginx/html/ 2>/dev/null || echo "  No se puede acceder al contenedor"

echo ""
echo "Contenido de index.html (primeras 10 líneas):"
docker exec courses-frontend head -10 /usr/share/nginx/html/index.html 2>/dev/null || echo "  No se encuentra index.html"

echo ""
echo "📊 Uso de recursos:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "🔧 Comandos para solucionar:"
echo "1. Reconstruir aplicación:"
echo "   docker-compose -f docker/docker-compose.yaml down"
echo "   docker-compose -f docker/docker-compose.yaml up --build -d"
echo ""
echo "2. Ver logs en tiempo real:"
echo "   docker-compose -f docker/docker-compose.yaml logs -f"
echo ""
echo "3. Probar dominio:"
echo "   curl -I http://cursos.eloriaesencial.com"
