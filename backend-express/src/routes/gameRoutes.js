// Rutas de la API del juego
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authenticateJWT = require('../middlewares/authMiddleware');

router.post('/start', authenticateJWT, gameController.startRun);
router.post('/door', authenticateJWT, gameController.selectDoor);
router.post('/turn', authenticateJWT, gameController.turnAction);
router.post('/retire', authenticateJWT, gameController.retireRun);

// Exportación directa requerida por Express (NO usar { router })
module.exports = router;