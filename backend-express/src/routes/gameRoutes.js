// =============================================================================
// RUTAS HTTP DEL MOTOR DE JUEGO Y LEADERBOARD (EXPRESS)
// =============================================================================
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middlewares/authMiddleware');

// Endpoints de gameplay
router.post('/start', authMiddleware, gameController.startRun);
router.post('/run/:id/turn', authMiddleware, gameController.playTurn);

// Endpoints de clasificaciones e historial (Issue 07)
router.get('/leaderboard', gameController.getLeaderboard);
router.get('/leaderboard/user', authMiddleware, gameController.getUserLeaderboard);
router.get('/run/:id/timeline', authMiddleware, gameController.getRunTimeline);

module.exports = router;