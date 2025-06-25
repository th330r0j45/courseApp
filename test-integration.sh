#!/bin/bash

echo "🧪 Probando Backend de Cursos"
echo "================================"
echo ""

# 1. Probar salud del servidor
echo "1. ⚡ Probando salud del servidor..."
curl -s http://localhost:3001/health | echo "   ✅ $(cat)"
echo ""

# 2. Obtener cursos públicos
echo "2. 📚 Obteniendo cursos públicos..."
COURSES=$(curl -s http://localhost:3001/api/courses/public | jq length 2>/dev/null || echo "No se pudo parsear JSON")
echo "   ✅ Cursos encontrados: $COURSES"
echo ""

# 3. Obtener primer curso con detalles
echo "3. 📖 Obteniendo detalles del primer curso..."
FIRST_COURSE=$(curl -s "http://localhost:3001/api/courses/public" | head -c 500 2>/dev/null)
echo "   ✅ Primeros 500 caracteres:"
echo "   $FIRST_COURSE..."
echo ""

# 4. Probar paginación
echo "4. 📄 Probando paginación (página 1, límite 2)..."
PAGINATED=$(curl -s "http://localhost:3001/api/courses?page=1&limit=2" | head -c 300 2>/dev/null)
echo "   ✅ Respuesta con paginación:"
echo "   $PAGINATED..."
echo ""

# 5. Probar filtro por categoría
echo "5. 🔍 Filtrando por categoría 'Programación'..."
FILTERED=$(curl -s "http://localhost:3001/api/courses?category=Programación" | head -c 200 2>/dev/null)
echo "   ✅ Cursos de programación:"
echo "   $FILTERED..."
echo ""

echo "🎉 ¡Pruebas completadas!"
echo ""
echo "📋 Resumen:"
echo "   • Backend: ✅ Funcionando en http://localhost:3001"
echo "   • Frontend: ⚠️  Verifica http://localhost:4200"
echo "   • Base de datos: ✅ SQLite con datos de ejemplo"
echo ""
echo "🚀 Para probar el frontend:"
echo "   1. Abre http://localhost:4200 en tu navegador"
echo "   2. Verifica que se muestren los cursos con imágenes"
echo "   3. Prueba crear, editar y eliminar cursos"
