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

// Se exporta la app para poder testearla sin levantar el puerto
module.exports = app;

// Manejador genérico DBG=0: sólo escucha cuando se ejecuta como programa principal
if (require.main === module) {
  app.listen(port, () => {
    // Servidor en ejecución sin logs ruidosos en producción
  });
}