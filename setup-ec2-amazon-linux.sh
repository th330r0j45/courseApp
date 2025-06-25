#!/bin/bash

# Script de configuración inicial para Amazon Linux 2 EC2

echo "🚀 Configurando Amazon Linux 2 para Docker..."

# Actualizar el sistema
echo "🔄 Actualizando sistema..."
sudo yum update -y

# Instalar paquetes básicos
echo "📦 Instalando paquetes esenciales..."
sudo yum install -y git curl wget htop nano

# Instalar Docker
echo "🐳 Instalando Docker..."
sudo yum install -y docker

# Iniciar y habilitar Docker
echo "⚡ Habilitando Docker..."
sudo systemctl start docker
sudo systemctl enable docker

# Agregar usuario ec2-user al grupo docker
echo "👤 Configurando permisos de Docker..."
sudo usermod -a -G docker ec2-user

# Instalar Docker Compose
echo "🔧 Instalando Docker Compose..."
DOCKER_COMPOSE_VERSION="2.24.1"
sudo curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Crear enlace simbólico
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Instalar Node.js (para desarrollo local si es necesario)
echo "📦 Instalando Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 22
nvm use 22

# Configurar firewall básico con Security Groups
echo "🔥 Configuración de seguridad..."
echo "NOTA: Asegúrate de configurar los Security Groups en AWS Console:"
echo "- Puerto 22 (SSH) desde tu IP"
echo "- Puerto 80 (HTTP) desde 0.0.0.0/0"
echo "- Puerto 3001 (API) desde 0.0.0.0/0 (opcional, solo para pruebas)"

# Crear directorio de trabajo
echo "📁 Creando estructura de directorios..."
mkdir -p ~/apps/courses
cd ~/apps/courses

# Configurar logrotate para Docker
echo "📋 Configurando rotación de logs..."
sudo tee /etc/logrotate.d/docker > /dev/null <<EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF

echo ""
echo "✅ Configuración completada!"
echo "🔄 IMPORTANTE: Reinicia la sesión SSH para aplicar permisos:"
echo "   exit"
echo "   ssh -i tu-key.pem ec2-user@$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo ""
echo "📋 Versiones instaladas:"
docker --version 2>/dev/null || echo "Docker: Reinicia sesión para verificar"
docker-compose --version 2>/dev/null || echo "Docker Compose: Reinicia sesión para verificar"
node --version 2>/dev/null || echo "Node.js: Reinicia sesión para verificar"
echo ""
echo "🏠 Directorio de trabajo: ~/apps/courses"
echo "🌐 IP Pública: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
