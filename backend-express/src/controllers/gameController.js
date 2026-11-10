// Handlers del Motor de Juego
const gameEngineService = require('../services/gameEngineService');
const { successResponse, errorResponse } = require('../utils/formatters');

async function startRun(req, res) {
  try {
    const { clase } = req.body;
    const run = await gameEngineService.startRun(req.user.id, clase);
    return res.status(201).json(successResponse(run, 'Partida iniciada'));
  } catch (error) {
    return res.status(400).json(errorResponse(error.message));
  }
}

async function playTurn(req, res) {
  try {
    const { id } = req.params;
    const { accion } = req.body;
    const run = await gameEngineService.playTurn(parseInt(id, 10), req.user.id, accion);
    return res.status(200).json(successResponse(run, 'Turno procesado'));
  } catch (error) {
    return res.status(400).json(errorResponse(error.message));
  }
}

async function getLeaderboard(req, res) {
  try {
    const leaderboard = await gameEngineService.getLeaderboard();
    return res.status(200).json(successResponse(leaderboard));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message));
  }
}

module.exports = { startRun, playTurn, getLeaderboard };