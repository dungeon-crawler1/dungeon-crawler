// Punto de entrada del Servidor Express
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Registro de endpoints con sufijos correspondientes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/game', gameRoutes);

// Manejador genérico DBG=0
app.listen(port, () => {
  // Servidor en ejecución sin logs ruidosos en producción
});