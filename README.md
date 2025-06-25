# Aplicación de Gestión de Cursos - Angular + Node.js

Una aplicación fullstack moderna para la gestión y visualización de cursos educativos, con frontend en Angular y backend en Node.js con SQLite.

## Características

### 🎯 Página Pública de Cursos
- **Vista de catálogo**: Tarjetas atractivas que muestran la información esencial de cada curso
- **Búsqueda avanzada**: Filtrado por título, instructor, descripción y categoría
- **Filtros por categoría y nivel**: Organización eficiente del contenido
- **Diseño responsivo**: Optimizado para dispositivos móviles y desktop
- **Información detallada**: Precio, duración, nivel, calificación y número de estudiantes
- **Paginación**: Navegación eficiente de grandes catálogos de cursos

### ⚙️ Panel de Administración
- **Dashboard intuitivo**: Estadísticas generales y métricas clave
- **CRUD completo**: Crear, leer, actualizar y eliminar cursos
- **Gestión de cursos**: Lista completa con funciones de búsqueda y filtrado
- **Formularios validados**: Validación robusta de datos de entrada
- **Estados de curso**: Activar/desactivar cursos fácilmente
- **Control de visibilidad**: Gestión de cursos activos/inactivos

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Angular 19**: Framework principal
- **TypeScript**: Lenguaje de programación
- **RxJS**: Manejo de programación reactiva
- **Angular Reactive Forms**: Formularios reactivos con validación
- **CSS3**: Estilos modernos con Flexbox y Grid
- **Angular Router**: Navegación entre componentes
- **HTTP Client**: Comunicación con la API REST

### Backend
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web para Node.js
- **SQLite3**: Base de datos ligera y embebida
- **CORS**: Soporte para peticiones cross-origin
- **Body Parser**: Manejo de datos JSON y URL-encoded

## 🚀 Instalación y Uso

### Instalación Frontend
```bash
# Instalar dependencias del frontend
npm install

# Ejecutar en modo desarrollo
npm start
# o
ng serve

# La aplicación estará disponible en http://localhost:4200
```

### Instalación Backend
```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias
npm install

# Inicializar la base de datos (opcional)
npm run init-db

# Ejecutar servidor en modo desarrollo
npm run dev
# o en modo producción
npm start

# El servidor estará disponible en http://localhost:3001
```

### Usando Docker
```bash
# Construir y ejecutar todos los servicios
cd docker
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Rutas disponibles
- `/courses` - Página pública de cursos
- `/admin/dashboard` - Panel de administración
- `/admin/courses` - Gestión de cursos
- `/admin/courses/new` - Crear nuevo curso

### Configuración de Entorno

El backend utiliza las siguientes variables de entorno:
- `PORT`: Puerto del servidor (por defecto: 3001)

Actualiza la URL del backend en `src/app/config/environment.config.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api'
};
```

## 📊 Modelo de Datos - Propiedades de los Cursos

Cada curso en la aplicación contiene las siguientes propiedades:

### Propiedades Principales
- **id**: Identificador único del curso (generado automáticamente)
- **title**: Título del curso (requerido)
- **description**: Descripción detallada del curso
- **instructor**: Nombre del instructor (por defecto: "No especificado")
- **duration**: Duración en horas (número entero)
- **level**: Nivel de dificultad ("Principiante", "Intermedio", "Avanzado")
- **price**: Precio del curso (número decimal)
- **imageUrl**: URL de la imagen del curso (opcional)
- **category**: Categoría del curso (por defecto: "General")

### Propiedades de Evaluación y Estado
- **rating**: Calificación promedio (0.0 - 5.0)
- **studentsCount**: Número de estudiantes inscritos
- **isActive**: Estado activo/inactivo del curso (boolean)

### Propiedades de Auditoría
- **createdAt**: Fecha de creación (automática)
- **updatedAt**: Fecha de última actualización (automática)

## 🗄️ Backend API

### Arquitectura del Backend
- **Framework**: Express.js con Node.js
- **Base de datos**: SQLite3 (archivo local `courses.db`)
- **Puerto**: 3001 (configurable via variable de entorno)
- **Middleware**: CORS habilitado, Body Parser para JSON

### Endpoints Disponibles

#### Endpoints Públicos
- `GET /api/courses/public` - Obtener todos los cursos activos ordenados por rating
- `GET /api/courses/:id` - Obtener curso específico por ID
- `GET /health` - Verificar estado del servidor

#### Endpoints de Administración
- `GET /api/courses` - Obtener cursos con paginación y filtros
  - Query params: `page`, `limit`, `category`, `level`
- `POST /api/courses` - Crear nuevo curso
- `PUT /api/courses/:id` - Actualizar curso existente
- `DELETE /api/courses/:id` - Eliminar curso permanentemente

### Funcionalidades del Backend
- **Paginación**: Control de límite y offset para grandes catálogos
- **Filtrado**: Por categoría y nivel de dificultad
- **Validación**: Campos requeridos y tipos de datos
- **Manejo de errores**: Respuestas consistentes y logging
- **Health Check**: Endpoint para monitoreo del servidor

## 🐳 Docker Support

La aplicación incluye soporte completo para Docker:

### Servicios Docker
- **courses-backend**: Servidor Node.js en puerto 3001
- **courses-frontend**: Aplicación Angular servida por Nginx en puerto 80

### Características Docker
- **Health checks**: Verificación automática del estado del backend
- **Volumes persistentes**: Los datos de la base de datos se mantienen
- **Auto-restart**: Los contenedores se reinician automáticamente
- **Dependencias**: El frontend espera a que el backend esté saludable

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
# Build frontend
ng build

# Build backend (no build step needed, direct Node.js)
# Los archivos están listos para producción

# Build with Docker
docker-compose build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## 🧪 Testing

### Frontend Testing
```bash
# Ejecutar tests unitarios
ng test

# Ejecutar tests e2e
ng e2e
```

### Backend Testing
```bash
cd backend

# Test de conectividad del servidor
curl http://localhost:3001/health

# Test de la API
curl http://localhost:3001/api/courses/public
```

## 📁 Estructura del Proyecto

```
📦 courses/
├── 📁 src/                    # Código fuente Angular
│   ├── 📁 app/
│   │   ├── 📁 components/     # Componentes de la aplicación
│   │   ├── 📁 services/       # Servicios para API calls
│   │   ├── 📁 models/         # Interfaces y tipos TypeScript
│   │   ├── 📁 config/         # Configuración de entornos
│   │   └── 📁 utils/          # Utilidades y helpers
│   └── 📄 styles.css          # Estilos globales
├── 📁 backend/                # Servidor Node.js
│   ├── 📄 server.js           # Servidor Express principal
│   ├── 📄 package.json        # Dependencias del backend
│   ├── 📄 courses.db          # Base de datos SQLite
│   └── 📁 scripts/            # Scripts de inicialización
├── 📁 docker/                 # Configuración Docker
│   ├── 📄 docker-compose.yaml # Orquestación de servicios
│   ├── 📄 Dockerfile          # Imagen del frontend
│   └── 📄 nginx.conf          # Configuración Nginx
└── 📄 README.md               # Este archivo
```

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
