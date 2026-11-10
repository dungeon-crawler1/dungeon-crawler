// Definición de Rutas del Juego
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/start', authMiddleware, gameController.startRun);
router.post('/run/:id/turn', authMiddleware, gameController.playTurn);
router.get('/leaderboard', gameController.getLeaderboard);

module.exports = router;