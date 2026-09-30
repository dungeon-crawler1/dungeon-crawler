const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJWT = require('../middlewares/authMiddleware');

// Ruta protegida mediante el middleware authenticateJWT
router.get('/profile', authenticateJWT, userController.getProfile);

module.exports = router;