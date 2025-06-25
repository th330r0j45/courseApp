#!/bin/bash

# Script para configurar SSL/HTTPS con Let's Encrypt en EC2

echo "🔐 Configurando SSL/HTTPS para la aplicación..."

# Verificar permisos de Docker
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Error: No tienes permisos para Docker"
    echo "💡 Solucionando permisos de Docker..."
    sudo usermod -aG docker $USER
    sudo chmod 666 /var/run/docker.sock
    echo "✅ Permisos configurados. Cierra sesión y vuelve a entrar, o ejecuta: newgrp docker"
    echo "   Luego ejecuta este script nuevamente"
    exit 1
fi

# Verificar que estamos en EC2 y obtener metadata usando IMDSv2
echo "🔍 Verificando instancia EC2..."

# Obtener token para IMDSv2
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" -s)

if [ -z "$TOKEN" ]; then
    echo "❌ Este script está diseñado para ejecutarse en EC2"
    exit 1
fi

# Obtener instance ID y public IP usando el token
INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/instance-id)
PUBLIC_IP=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo "� Instance ID: $INSTANCE_ID"
echo "🌐 Public IP: $PUBLIC_IP"

# Verificar que la aplicación esté corriendo
if ! curl -s -f http://localhost > /dev/null; then
    echo "❌ La aplicación no está corriendo. Ejecuta ./deploy.sh primero"
    exit 1
fi

# Verificar que el puerto 80 esté disponible para Certbot
echo "🔍 Verificando disponibilidad del puerto 80..."
if sudo netstat -tlnp | grep :80 > /dev/null; then
    echo "⚠️  Puerto 80 está ocupado. Esto es normal si la aplicación está corriendo."
    echo "   Se detendrá temporalmente para obtener el certificado SSL"
fi

# Solicitar información del dominio
echo ""
echo "📝 Para configurar SSL necesitas:"
echo "   1. Un dominio (ej: cursos.midominio.com)"
echo "   2. Que el dominio apunte a esta IP: $PUBLIC_IP"
echo "   3. Puerto 80 y 443 abiertos en Security Groups"
echo ""

read -p "🌐 Ingresa tu dominio (ej: cursos.midominio.com): " DOMAIN
read -p "📧 Ingresa tu email para Let's Encrypt: " EMAIL

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "❌ Dominio y email son requeridos"
    exit 1
fi

# Verificar que el dominio apunte a esta instancia
echo "🔍 Verificando DNS del dominio..."
DOMAIN_IP=$(nslookup $DOMAIN | grep -A 1 "Name:" | tail -1 | awk '{print $2}' 2>/dev/null)

if [ "$DOMAIN_IP" != "$PUBLIC_IP" ]; then
    echo "⚠️  ADVERTENCIA: El dominio $DOMAIN no apunta a esta IP ($PUBLIC_IP)"
    echo "   Dominio apunta a: $DOMAIN_IP"
    echo ""
    read -p "¿Continuar de todas formas? (y/N): " CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        echo "❌ Cancelado. Configura tu DNS primero"
        exit 1
    fi
fi

# Instalar Certbot si no está instalado
if ! command -v certbot &> /dev/null; then
    echo "📦 Instalando Certbot..."
    sudo yum install -y python3-pip
    sudo python3 -m pip install certbot
fi

# Verificar si ya existe un certificado válido
CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
if [ -f "$CERT_PATH" ]; then
    echo "🔍 Verificando certificado existente..."
    
    # Verificar si el certificado es válido y no está expirado
    if sudo openssl x509 -in "$CERT_PATH" -checkend 2592000 -noout > /dev/null 2>&1; then
        echo "✅ Certificado SSL válido encontrado para $DOMAIN"
        echo "   No es necesario obtener un nuevo certificado"
        SKIP_CERT_GENERATION=true
    else
        echo "⚠️  Certificado existente expira pronto o es inválido"
        echo "   Se obtendrá un nuevo certificado"
        SKIP_CERT_GENERATION=false
    fi
else
    echo "🔍 No se encontró certificado existente"
    SKIP_CERT_GENERATION=false
fi

if [ "$SKIP_CERT_GENERATION" = false ]; then
    # Parar la aplicación temporalmente para liberar puerto 80
    echo "⏸️  Parando aplicación temporalmente..."
    docker-compose -f docker/docker-compose.yaml down

    # Obtener certificado SSL usando standalone
    echo "🔐 Obteniendo certificado SSL de Let's Encrypt..."
    sudo certbot certonly \
        --standalone \
        --non-interactive \
        --agree-tos \
        --email $EMAIL \
        -d $DOMAIN

    if [ $? -ne 0 ]; then
        echo "❌ Error obteniendo certificado SSL"
        echo "Verifica que:"
        echo "   - El dominio apunte a esta instancia"
        echo "   - Los puertos 80 y 443 estén abiertos en Security Groups"
        echo "   - No haya otros servicios usando estos puertos"
        echo ""
        echo "🔄 Reiniciando aplicación sin SSL..."
        docker-compose -f docker/docker-compose.yaml up -d
        exit 1
    fi
else
    echo "⏭️  Saltando generación de certificado, usando el existente"
fi

# Crear configuración de Nginx con SSL
echo "🔧 Configurando Nginx con SSL..."
sudo mkdir -p /etc/nginx/ssl

# Crear configuración SSL para Nginx
cat > docker/nginx-ssl.conf << EOF
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Redirección HTTP a HTTPS
    server {
        listen 80;
        server_name $DOMAIN;
        return 301 https://\$server_name\$request_uri;
    }

    # Configuración HTTPS
    server {
        listen 443 ssl http2;
        server_name $DOMAIN;
        
        # SSL Configuration
        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
        
        # SSL Security
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # Security Headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        root /usr/share/nginx/html;
        index index.html;

        # Servir archivos estáticos de Angular
        location / {
            try_files \$uri \$uri/ /index.html;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }

        # Proxy para las llamadas a la API del backend
        location /api/ {
            proxy_pass http://courses-backend:3001/api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
            proxy_connect_timeout 300;
            proxy_send_timeout 300;
            proxy_read_timeout 300;
            
            # Headers CORS
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;
        }

        # Health check del backend a través del proxy
        location /health {
            proxy_pass http://courses-backend:3001/health;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Configuración para archivos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

# Crear docker-compose con SSL
cat > docker/docker-compose-ssl.yaml << EOF
services:
  # Backend Node.js
  courses-backend:
    container_name: courses-backend
    build:
      context: ../backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    volumes:
      - backend_data:/app/data
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped

  # Frontend Angular con SSL
  courses-frontend:
    container_name: courses-frontend
    build:
      context: ..
      dockerfile: docker/Dockerfile-ssl
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      courses-backend:
        condition: service_healthy
    restart: unless-stopped

volumes:
  backend_data:
EOF

# Actualizar Dockerfile para usar configuración SSL
echo "🔧 Preparando configuración SSL..."
cp docker/nginx.conf docker/nginx-original.conf

# Crear Dockerfile específico para SSL
cat > docker/Dockerfile-ssl << EOF
# Building a Node.js application with Docker
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --verbose
COPY . .
RUN npm run build

#Nginx
FROM nginx:1.27-alpine
COPY --from=builder /app/dist/courses/browser /usr/share/nginx/html
COPY docker/nginx-ssl.conf /etc/nginx/nginx.conf
EXPOSE 80 443
#Init Nginx principal service not deamon
CMD ["nginx", "-g", "daemon off;"]
EOF

# Desplegar con SSL
echo "🚀 Desplegando aplicación con SSL..."
docker-compose -f docker/docker-compose-ssl.yaml up --build -d

# Configurar renovación automática
echo "⏰ Configurando renovación automática de certificados..."

# Verificar si crontab está disponible, si no instalarlo
if ! command -v crontab &> /dev/null; then
    echo "📦 Instalando cron service..."
    sudo yum update -y
    sudo yum install -y cronie
    sudo systemctl enable crond
    sudo systemctl start crond
fi

# Configurar renovación automática
(crontab -l 2>/dev/null; echo "0 12 */89 * * /usr/bin/certbot renew --quiet --deploy-hook 'docker-compose -f $PWD/docker/docker-compose-ssl.yaml restart courses-frontend'") | crontab -

# Verificar que todo funcione
sleep 10
echo ""
echo "🔍 Verificando configuración SSL..."

if curl -s -k https://localhost > /dev/null; then
    echo "✅ HTTPS local: Funcionando"
else
    echo "❌ HTTPS local: Error"
fi

if curl -s -k https://$DOMAIN > /dev/null; then
    echo "✅ HTTPS dominio: Funcionando"
else
    echo "❌ HTTPS dominio: Error (puede tardar unos minutos en propagarse)"
fi

# Mostrar información del certificado
echo ""
echo "📜 Información del certificado SSL:"
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    CERT_EXPIRY=$(sudo openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" -enddate -noout | cut -d= -f2)
    CERT_ISSUER=$(sudo openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" -issuer -noout | cut -d= -f2-)
    echo "   📅 Expira: $CERT_EXPIRY"
    echo "   🏢 Emisor: $CERT_ISSUER"
    echo "   📍 Ubicación: /etc/letsencrypt/live/$DOMAIN/"
else
    echo "   ⚠️  No se pudo acceder al certificado"
fi

echo ""
echo "🎉 Configuración SSL completada!"
echo "🌐 Tu aplicación está disponible en:"
echo "   🔒 HTTPS: https://$DOMAIN"
echo "   🌐 HTTP: http://$DOMAIN (redirige a HTTPS)"
echo ""
echo "📋 Información importante:"
echo "   - Certificado SSL configurado para: $DOMAIN"
echo "   - Renovación automática configurada"
echo "   - Configuración de seguridad aplicada"
echo ""
echo "🔧 Archivos creados:"
echo "   - docker/nginx-ssl.conf (configuración SSL completa)"
echo "   - docker/Dockerfile-ssl (Dockerfile para SSL)"
echo "   - docker/docker-compose-ssl.yaml (compose con SSL)"
echo "   - docker/nginx-original.conf (backup configuración original)"
echo ""
echo "⚠️  Para futuras actualizaciones usa:"
echo "   docker-compose -f docker/docker-compose-ssl.yaml up --build -d"
echo ""
echo "🔄 Para volver a HTTP sin SSL:"
echo "   docker-compose -f docker/docker-compose-ssl.yaml down"
echo "   docker-compose -f docker/docker-compose.yaml up -d"
