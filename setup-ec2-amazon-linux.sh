#!/bin/bash

# Script de configuración inicial para EC2 Amazon Linux
# Instala Docker, Node.js y configura permisos necesarios

echo "🚀 Configurando servidor EC2 Amazon Linux..."

# Actualizar sistema
echo "📦 Actualizando sistema..."
sudo yum update -y

# Instalar Docker
echo "🐳 Instalando Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker

# Configurar permisos de Docker
echo "🔧 Configurando permisos de Docker..."
sudo usermod -aG docker $USER
sudo chmod 666 /var/run/docker.sock

# Instalar Docker Compose
echo "🔧 Instalando Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Crear symlink si no existe
if [ ! -f /usr/bin/docker-compose ]; then
    sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
fi

# Instalar Node.js y npm
echo "📦 Instalando Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20

# Instalar herramientas útiles
echo "🛠️ Instalando herramientas adicionales..."
sudo yum install -y git wget curl htop nano vim

# Configurar firewall básico (si iptables está disponible)
echo "🔒 Configurando reglas básicas de firewall..."
sudo yum install -y iptables-services 2>/dev/null || true

# Crear directorio para la aplicación
echo "📁 Preparando directorios..."
mkdir -p ~/apps
cd ~/apps

# Información sobre puertos para Security Groups
echo ""
echo "🔥 IMPORTANTE: Configuración de Security Groups en AWS"
echo "   Asegúrate de abrir estos puertos en tu Security Group:"
echo "   - Puerto 22 (SSH) - Ya debería estar abierto"
echo "   - Puerto 80 (HTTP) - Para la aplicación web"
echo "   - Puerto 443 (HTTPS) - Para SSL/HTTPS"
echo "   - Puerto 3001 (Backend API) - Para la API"
echo ""

# Verificar instalaciones
echo "✅ Verificando instalaciones..."
echo "Docker version:"
docker --version

echo "Docker Compose version:"
docker-compose --version

echo "Node.js version:"
node --version

echo "NPM version:"
npm --version

echo ""
echo "🎉 Configuración de EC2 Amazon Linux completada!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Clona tu repositorio: git clone <tu-repo>"
echo "   2. Navega al directorio del proyecto"
echo "   3. Ejecuta el script de despliegue: ./deploy.sh"
echo ""
echo "💡 Notas importantes:"
echo "   - Los permisos de Docker han sido configurados"
echo "   - Es recomendable cerrar sesión y volver a entrar para que los cambios surtan efecto"
echo "   - O ejecuta: newgrp docker"
echo "   - Configura los Security Groups según se indicó arriba"
echo ""
echo "🔧 Para configurar SSL más tarde, ejecuta: ./setup-ssl.sh"
