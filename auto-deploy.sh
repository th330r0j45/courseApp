#!/bin/bash

# Script de auto-deploy desde Git

echo "🔄 Actualizando aplicación desde Git..."

# Verificar que estamos en un repositorio Git
if [ ! -d ".git" ]; then
    echo "❌ Este directorio no es un repositorio Git"
    exit 1
fi

# Obtener rama actual
CURRENT_BRANCH=$(git branch --show-current)
echo "📋 Rama actual: $CURRENT_BRANCH"

# Guardar cambios locales si los hay
if ! git diff-index --quiet HEAD --; then
    echo "💾 Guardando cambios locales..."
    git stash push -m "Auto-stash before deploy $(date)"
fi

# Actualizar desde Git
echo "⬇️  Descargando cambios..."
git pull origin $CURRENT_BRANCH

if [ $? -eq 0 ]; then
    echo "✅ Código actualizado exitosamente"
    
    # Hacer ejecutables los scripts
    chmod +x *.sh
    
    # Desplegar
    echo "🚀 Desplegando aplicación..."
    ./deploy.sh
    
    echo ""
    echo "🎉 ¡Deploy completado!"
    echo "🌐 Tu aplicación está actualizada y corriendo"
    
else
    echo "❌ Error al actualizar desde Git"
    exit 1
fi
