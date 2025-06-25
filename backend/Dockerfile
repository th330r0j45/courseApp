# Dockerfile para el Backend Node.js
FROM node:22-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el código fuente
COPY . .

# Crear directorio para la base de datos si no existe
RUN mkdir -p /app/data

# Exponer el puerto
EXPOSE 3001

# Comando para inicializar la BD e iniciar el servidor
CMD ["sh", "-c", "npm run init-db && npm start"]
