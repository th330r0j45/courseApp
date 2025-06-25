const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Base de datos SQLite
const dbPath = path.join(__dirname, 'courses.db');
const db = new sqlite3.Database(dbPath);

// Inicializar base de datos
db.serialize(() => {
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
  )`);
});

// RUTAS CRUD

// GET /api/courses - Obtener todos los cursos
app.get('/api/courses', (req, res) => {
  const { page = 1, limit = 10, category, level } = req.query;
  const offset = (page - 1) * limit;
  
  let sql = 'SELECT * FROM courses WHERE isActive = 1';
  let params = [];
  
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  
  if (level) {
    sql += ' AND level = ?';
    params.push(level);
  }
  
  sql += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Contar total de registros
    let countSql = 'SELECT COUNT(*) as total FROM courses WHERE isActive = 1';
    let countParams = [];
    
    if (category) {
      countSql += ' AND category = ?';
      countParams.push(category);
    }
    
    if (level) {
      countSql += ' AND level = ?';
      countParams.push(level);
    }
    
    db.get(countSql, countParams, (err, count) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        courses: rows.map(row => ({
          id: row.id,
          title: row.title,
          description: row.description,
          instructor: row.instructor,
          duration: row.duration,
          level: row.level,
          price: row.price,
          imageUrl: row.imageUrl,
          category: row.category,
          rating: row.rating,
          studentsCount: row.studentsCount,
          isActive: Boolean(row.isActive),
          createdAt: new Date(row.createdAt),
          updatedAt: new Date(row.updatedAt)
        })),
        total: count.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count.total / limit)
      });
    });
  });
});

// GET /api/courses/public - Obtener cursos públicos (activos)
app.get('/api/courses/public', (req, res) => {
  db.all('SELECT * FROM courses WHERE isActive = 1 ORDER BY rating DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json(rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      instructor: row.instructor,
      duration: row.duration,
      level: row.level,
      price: row.price,
      imageUrl: row.imageUrl,
      category: row.category,
      rating: row.rating,
      studentsCount: row.studentsCount,
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    })));
  });
});

// GET /api/courses/:id - Obtener curso por ID
app.get('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM courses WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    
    res.json({
      id: row.id,
      title: row.title,
      description: row.description,
      instructor: row.instructor,
      duration: row.duration,
      level: row.level,
      price: row.price,
      imageUrl: row.imageUrl,
      category: row.category,
      rating: row.rating,
      studentsCount: row.studentsCount,
      isActive: Boolean(row.isActive),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    });
  });
});

// POST /api/courses - Crear nuevo curso
app.post('/api/courses', (req, res) => {
  const {
    title,
    description,
    instructor = 'No especificado',
    duration = 0,
    level = 'Principiante',
    price = 0.0,
    imageUrl,
    category = 'General',
    rating = 0.0,
    studentsCount = 0
  } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'El título es requerido' });
  }
  
  const sql = `INSERT INTO courses (
    title, description, instructor, duration, level, price, 
    imageUrl, category, rating, studentsCount, createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`;
  
  db.run(sql, [
    title, description, instructor, duration, level, price,
    imageUrl, category, rating, studentsCount
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Obtener el curso recién creado
    db.get('SELECT * FROM courses WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.status(201).json({
        id: row.id,
        title: row.title,
        description: row.description,
        instructor: row.instructor,
        duration: row.duration,
        level: row.level,
        price: row.price,
        imageUrl: row.imageUrl,
        category: row.category,
        rating: row.rating,
        studentsCount: row.studentsCount,
        isActive: Boolean(row.isActive),
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      });
    });
  });
});

// PUT /api/courses/:id - Actualizar curso
app.put('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    instructor,
    duration,
    level,
    price,
    imageUrl,
    category,
    rating,
    studentsCount,
    isActive
  } = req.body;
  
  const sql = `UPDATE courses SET 
    title = COALESCE(?, title),
    description = COALESCE(?, description),
    instructor = COALESCE(?, instructor),
    duration = COALESCE(?, duration),
    level = COALESCE(?, level),
    price = COALESCE(?, price),
    imageUrl = COALESCE(?, imageUrl),
    category = COALESCE(?, category),
    rating = COALESCE(?, rating),
    studentsCount = COALESCE(?, studentsCount),
    isActive = COALESCE(?, isActive),
    updatedAt = datetime('now')
    WHERE id = ?`;
  
  db.run(sql, [
    title, description, instructor, duration, level, price,
    imageUrl, category, rating, studentsCount, isActive, id
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    
    // Obtener el curso actualizado
    db.get('SELECT * FROM courses WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        id: row.id,
        title: row.title,
        description: row.description,
        instructor: row.instructor,
        duration: row.duration,
        level: row.level,
        price: row.price,
        imageUrl: row.imageUrl,
        category: row.category,
        rating: row.rating,
        studentsCount: row.studentsCount,
        isActive: Boolean(row.isActive),
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      });
    });
  });
});
// DELETE /api/courses/:id - Eliminar curso (hard delete)
app.delete('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM courses WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    
    res.json({ message: 'Curso eliminado exitosamente' });
  });
});

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: ${dbPath}`);
});

// Cerrar base de datos al terminar proceso
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Base de datos cerrada.');
    process.exit(0);
  });
});
