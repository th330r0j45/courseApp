# Aplicación de Gestión de Cursos - Angular

Una aplicación moderna de Angular para la gestión y visualización de cursos educativos.

## Características

### 🎯 Página Pública de Cursos
- **Vista de catálogo**: Tarjetas atractivas que muestran la información esencial de cada curso
- **Búsqueda avanzada**: Filtrado por título, instructor, descripción y categoría
- **Filtros por categoría**: Organización eficiente del contenido
- **Diseño responsivo**: Optimizado para dispositivos móviles y desktop
- **Información detallada**: Precio, duración, nivel, calificación y número de estudiantes

### ⚙️ Panel de Administración
- **Dashboard intuitivo**: Estadísticas generales y métricas clave
- **CRUD completo**: Crear, leer, actualizar y eliminar cursos
- **Gestión de cursos**: Lista completa con funciones de búsqueda y filtrado
- **Formularios validados**: Validación robusta de datos de entrada
- **Estados de curso**: Activar/desactivar cursos fácilmente

## 🛠️ Tecnologías Utilizadas

- **Angular 19**: Framework principal
- **TypeScript**: Lenguaje de programación
- **RxJS**: Manejo de programación reactiva
- **Angular Reactive Forms**: Formularios reactivos con validación
- **CSS3**: Estilos modernos con Flexbox y Grid
- **Angular Router**: Navegación entre componentes

## 🚀 Instalación y Uso

### Instalación
```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start
# o
ng serve

# La aplicación estará disponible en http://localhost:4200
```

### Rutas disponibles
- `/courses` - Página pública de cursos
- `/admin/dashboard` - Panel de administración
- `/admin/courses` - Gestión de cursos
- `/admin/courses/new` - Crear nuevo curso

## 📊 Configuración del Backend

Actualiza la URL del backend en `src/app/services/course.service.ts`:

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
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
