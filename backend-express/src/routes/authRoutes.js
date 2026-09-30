const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta pública para registro
router.post('/register', authController.register);

// Ruta pública para inicio de sesión
router.post('/login', authController.login);

module.exports = router;