# Building a Node.js application with Docker
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --verbose
COPY . .
RUN npm run build

#Nginx
FROM nginx:1.27-alpine
COPY --from=builder /app/dist/shop /usr/share/nginx/html
EXPOSE 80
#Init Nginx principal service not deamon
CMD ["nginx", "-g", "daemon off;"]