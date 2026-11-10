// Capa de Negocio del Motor de Juego Roguelike por Turnos
const gameRepository = require('../repositories/gameRepository');
const { generateRooms } = require('../utils/gameUtils');

// Definición de estadísticas por clase de personaje
const CLASES_STATS = {
  CABALLERO: { vida: 100, ataque: 15, defensa: 10 },
  BARBARO: { vida: 120, ataque: 20, defensa: 5 },
  PICARO: { vida: 80, ataque: 18, defensa: 8 },
  MAGO: { vida: 70, ataque: 25, defensa: 4 }
};

// Iniciar nueva partida roguelike
async function startRun(usuarioId, clase) {
  const stats = CLASES_STATS[clase.toUpperCase()] || CLASES_STATS.CABALLERO;
  const estadoInicial = {
    habitaciones_superadas: 0,
    enemigo_actual: null,
    opciones_puertas: generateRooms(0)
  };
  return await gameRepository.createRun(usuarioId, clase, stats.vida, stats.vida, stats.ataque, stats.defensa, estadoInicial);
}

// Ejecutar un turno o acción en la partida
async function playTurn(runId, usuarioId, accion) {
  // Lógica simplificada de turno con actualización persistente
  const puntuacion = 10;
  const estadoActualizado = { habitaciones_superadas: 1, opciones_puertas: generateRooms(1) };
  return await gameRepository.updateRun(runId, 90, 15, puntuacion, 'EN_PROGRESO', estadoActualizado);
}

// Obtener tabla global de clasificación
async function getLeaderboard() {
  return await gameRepository.getTop10Global();
}

module.exports = { startRun, playTurn, getLeaderboard };