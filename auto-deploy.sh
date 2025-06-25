#!/bi# Cambiar a rama to_deploy
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "to_deploy" ]; then
    echo "✅ Ya estás en rama to_deploy"
else
    echo "📂 Cambiando a rama to_deploy..."
    git checkout to_deploy
fiash

# 🚀 Deploy rápido y fácil
echo "� Desplegando nuevos cambios..."

# Cambiar a rama to_deploy
echo "� Cambiando a rama to_deploy..."
git checkout to_deploy

# Actualizar código
echo "⬇️ Descargando cambios..."
git pull origin to_deploy

# Parar contenedores
echo "⏹️ Parando contenedores..."
docker-compose -f docker/docker-compose.yaml down

# Construir y ejecutar
echo "� Construyendo y desplegando..."
docker-compose -f docker/docker-compose.yaml up --build -d

echo "✅ ¡Deploy completado!"
echo "🌐 Aplicación desplegada y corriendo"
