// Cargar variables de entorno
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors()); // Habilitar CORS para permitir peticiones desde los Frontends
app.use(express.json()); // Middleware para parsear cuerpos de solicitudes en formato JSON

// Registro de rutas con prefijos
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Ruta base de prueba/salud de la API
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Express Backend API' });
});

// Manejador para rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Ruta no encontrada' });
});

// Iniciar servidor escuchando en el puerto configurado
app.listen(PORT, () => {
  console.log(`🚀 Servidor Express ejecutándose en el puerto ${PORT}`);
});