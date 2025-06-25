const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta a la base de datos
const dbPath = path.join(__dirname, '..', 'courses.db');

// Datos iniciales para los cursos
const initialCourses = [
    {
        "id": 10,
        "title": "AWS Cloud Practitioner",
        "description": "asgasgaasgasgaasgasgaasgasgaasgasga",
        "instructor": "Instructor 1",
        "duration": 50,
        "level": "Avanzado",
        "price": 650000,
        "imageUrl": "https://wallpaperaccess.com/full/624185.jpg",
        "category": "Nube",
        "rating": 0,
        "studentsCount": 0,
        "isActive": true,
        "createdAt": "2025-06-25T04:42:54.000Z",
        "updatedAt": "2025-06-25T05:39:04.000Z"
    },
    {
        "id": 9,
        "title": "AWS EC2",
        "description": "Introducción a Amazon EC2, aprende a lanzar y administrar instancias en la nube.",
        "instructor": "Instructor 2",
        "duration": 50,
        "level": "Principiante",
        "price": 650000,
        "imageUrl": "https://wallpaperaccess.com/full/624185.jpg",
        "category": "Nube",
        "rating": 0,
        "studentsCount": 0,
        "isActive": true,
        "createdAt": "2025-06-25T02:02:41.000Z",
        "updatedAt": "2025-06-25T05:39:23.000Z"
    },
    {
        "id": 1,
        "title": "Introducción a Angular",
        "description": "Aprende los fundamentos de Angular desde cero. Este curso te guiará a través de los conceptos básicos, componentes, servicios y routing.",
        "instructor": "María González",
        "duration": 40,
        "level": "Principiante",
        "price": 150000,
        "imageUrl": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop",
        "category": "Programación",
        "rating": 4.8,
        "studentsCount": 1247,
        "isActive": true,
        "createdAt": "2025-06-25T01:45:59.000Z",
        "updatedAt": "2025-06-25T01:45:59.000Z"
    },
    {
        "id": 2,
        "title": "JavaScript Avanzado",
        "description": "Domina JavaScript con conceptos avanzados como closures, promises, async/await y programación funcional.",
        "instructor": "Carlos Mendoza",
        "duration": 60,
        "level": "Avanzado",
        "price": 220000,
        "imageUrl": "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop",
        "category": "Programación",
        "rating": 4.9,
        "studentsCount": 856,
        "isActive": true,
        "createdAt": "2025-06-25T01:45:59.000Z",
        "updatedAt": "2025-06-25T01:45:59.000Z"
    },
    {
        "id": 3,
        "title": "Diseño UX/UI con Figma",
        "description": "Aprende a crear interfaces de usuario atractivas y funcionales utilizando Figma y principios de UX.",
        "instructor": "Ana Martínez",
        "duration": 35,
        "level": "Intermedio",
        "price": 180000,
        "imageUrl": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop",
        "category": "Diseño",
        "rating": 4.7,
        "studentsCount": 643,
        "isActive": true,
        "createdAt": "2025-06-25T01:45:59.000Z",
        "updatedAt": "2025-06-25T01:45:59.000Z"
    },
    {
        "id": 4,
        "title": "Marketing Digital Completo",
        "description": "Estrategias de marketing digital, SEO, SEM, redes sociales y análisis de métricas para hacer crecer tu negocio.",
        "instructor": "Roberto Silva",
        "duration": 50,
        "level": "Intermedio",
        "price": 190000,
        "imageUrl": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
        "category": "Marketing",
        "rating": 4.6,
        "studentsCount": 924,
        "isActive": true,
        "createdAt": "2025-06-25T01:45:59.000Z",
        "updatedAt": "2025-06-25T01:45:59.000Z"
    },
    {
        "id": 5,
        "title": "React para Principiantes",
        "description": "Domina React desde los conceptos básicos hasta la creación de aplicaciones web completas y modernas.",
        "instructor": "Luis Fernández",
        "duration": 45,
        "level": "Principiante",
        "price": 160000,
        "imageUrl": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
        "category": "Programación",
        "rating": 4.8,
        "studentsCount": 1156,
        "isActive": true,
        "createdAt": "2025-06-25T01:45:59.000Z",
        "updatedAt": "2025-06-25T01:45:59.000Z"
    },
    {
        "id": 6,
        "title": "Inglés de Negocios",
        "description": "Mejora tu inglés profesional para comunicarte efectivamente en el mundo empresarial internacional.",
        "instructor": "Sarah Johnson",
        "duration": 30,
        "level": "Intermedio",
        "price": 120000,
        "imageUrl": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
        "category": "Idiomas",
        "rating": 4.5,
        "studentsCount": 789,
        "isActive": true,
        "createdAt": "2025-06-25T01:45:59.000Z",
        "updatedAt": "2025-06-25T01:45:59.000Z"
    },
    {
        "id": 7,
        "title": "Python para Data Science",
        "description": "Aprende Python aplicado a ciencia de datos, análisis estadístico y machine learning con pandas, numpy y scikit-learn.",
        "instructor": "Diego Ramírez",
        "duration": 70,
        "level": "Avanzado",
        "price": 280000,
        "imageUrl": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop",
        "category": "Programación",
        "rating": 4.9,
        "studentsCount": 567,
        "isActive": true,
        "createdAt": "2025-06-25T01:45:59.000Z",
        "updatedAt": "2025-06-25T01:45:59.000Z"
    },
    {
        "id": 8,
        "title": "Gestión de Proyectos Ágiles",
        "description": "Metodologías ágiles, Scrum, Kanban y herramientas para la gestión efectiva de proyectos de software.",
        "instructor": "Patricia López",
        "duration": 25,
        "level": "Intermedio",
        "price": 140000,
        "imageUrl": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
        "category": "Negocios",
        "rating": 4.4,
        "studentsCount": 421,
        "isActive": true,
        "createdAt": "2025-06-25T01:45:59.000Z",
        "updatedAt": "2025-06-25T01:45:59.000Z"
    }
];

// Función principal de inicialización
function initializeDatabase() {
    console.log('🚀 Iniciando inicialización de la base de datos...');
    
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Error conectando a la base de datos:', err.message);
            return;
        }
        console.log('✅ Conectado a la base de datos SQLite');
    });

    db.serialize(() => {
        // Crear tabla si no existe
        db.run(`CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            instructor TEXT DEFAULT 'No especificado',
            duration INTEGER DEFAULT 0,
            level TEXT DEFAULT 'Principiante',
            price REAL DEFAULT 0.0,
            imageUrl TEXT,
            category TEXT DEFAULT 'General',
            rating REAL DEFAULT 0.0,
            studentsCount INTEGER DEFAULT 0,
            isActive BOOLEAN DEFAULT 1,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('❌ Error creando tabla:', err.message);
            } else {
                console.log('✅ Tabla courses creada o ya existía');
            }
        });

        // Limpiar datos existentes
        db.run('DELETE FROM courses', (err) => {
            if (err) {
                console.error('❌ Error limpiando tabla:', err.message);
            } else {
                console.log('🧹 Tabla courses limpiada');
            }
        });

        // Preparar statement para inserción
        const stmt = db.prepare(`INSERT INTO courses (
            id, title, description, instructor, duration, level, price,
            imageUrl, category, rating, studentsCount, isActive, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        // Insertar cursos
        let insertedCount = 0;
        initialCourses.forEach((course) => {
            stmt.run([
                course.id,
                course.title,
                course.description,
                course.instructor,
                course.duration,
                course.level,
                course.price,
                course.imageUrl,
                course.category,
                course.rating,
                course.studentsCount,
                course.isActive ? 1 : 0,
                course.createdAt,
                course.updatedAt
            ], function(err) {
                if (err) {
                    console.error(`❌ Error insertando curso "${course.title}":`, err.message);
                } else {
                    insertedCount++;
                    console.log(`✅ Curso insertado: "${course.title}" (ID: ${course.id})`);
                }
            });
        });

        stmt.finalize(() => {
            console.log(`🎉 Inicialización completada. ${insertedCount} cursos insertados.`);
            
            // Verificar datos insertados
            db.all('SELECT COUNT(*) as total FROM courses', (err, rows) => {
                if (err) {
                    console.error('❌ Error verificando datos:', err.message);
                } else {
                    console.log(`📊 Total de cursos en la base de datos: ${rows[0].total}`);
                }
                
                // Cerrar conexión
                db.close((err) => {
                    if (err) {
                        console.error('❌ Error cerrando base de datos:', err.message);
                    } else {
                        console.log('✅ Base de datos cerrada correctamente');
                    }
                });
            });
        });
    });
}

// Ejecutar inicialización si el script se ejecuta directamente
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase, initialCourses };