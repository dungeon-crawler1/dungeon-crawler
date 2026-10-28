// Capa de Presentación (Controllers): Endpoints HTTP del juego
const GameEngineService = require('../services/gameEngineService');
const { sendResponse } = require('../utils/formatters');

const startRun = async (req, res) => {
  try {
    const { clase } = req.body;
    const result = await GameEngineService.startNewRun(req.user.id, clase);
    if (!result.success) return sendResponse(res, 400, 'error', result.message);
    return sendResponse(res, 201, 'success', 'Partida iniciada.', { run: result.data });
  } catch (err) {
    return sendResponse(res, 500, 'error', 'Error interno al iniciar la partida.');
  }
};

const selectDoor = async (req, res) => {
  try {
    const { doorIndex } = req.body;
    const result = await GameEngineService.selectDoor(req.user.id, doorIndex);
    if (!result.success) return sendResponse(res, 400, 'error', result.message);
    return sendResponse(res, 200, 'success', result.message, result);
  } catch (err) {
    return sendResponse(res, 500, 'error', 'Error interno al seleccionar la puerta.');
  }
};

const turnAction = async (req, res) => {
  try {
    const { action } = req.body;
    const result = await GameEngineService.takeCombatTurn(req.user.id, action);
    if (!result.success) return sendResponse(res, 400, 'error', result.message);
    return sendResponse(res, 200, 'success', result.message, result);
  } catch (err) {
    return sendResponse(res, 500, 'error', 'Error interno al procesar el turno.');
  }
};

const retireRun = async (req, res) => {
  try {
    const result = await GameEngineService.retireRun(req.user.id);
    if (!result.success) return sendResponse(res, 400, 'error', result.message);
    return sendResponse(res, 200, 'success', result.message, { summary: result.summary });
  } catch (err) {
    return sendResponse(res, 500, 'error', 'Error interno al retirarse de la partida.');
  }
};

module.exports = { startRun, selectDoor, turnAction, retireRun };