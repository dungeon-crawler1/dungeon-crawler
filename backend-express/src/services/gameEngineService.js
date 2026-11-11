// =============================================================================
// SERVICIO DE NEGOCIO DEL MOTOR DE JUEGO ROGUELIKE
// =============================================================================
const gameRepository = require('../repositories/gameRepository');
const { generateRooms } = require('../utils/gameUtils');

// Mapeo de estadísticas base según la clase seleccionada
const CLASES_STATS = {
  CABALLERO: { vida: 100, ataque: 15, defensa: 10 },
  BARBARO: { vida: 120, ataque: 20, defensa: 5 },
  PICARO: { vida: 80, ataque: 18, defensa: 8 },
  MAGO: { vida: 70, ataque: 25, defensa: 4 }
};

// Iniciar una partida asignando vida y atributos base
async function startRun(usuarioId, clase) {
  const stats = CLASES_STATS[clase.toUpperCase()] || CLASES_STATS.CABALLERO;
  const estadoInicial = {
    habitaciones_superadas: 0,
    historial_habitaciones: [],
    opciones_puertas: generateRooms(0)
  };
  return await gameRepository.createRun(usuarioId, clase, stats.vida, stats.vida, stats.ataque, stats.defensa, estadoInicial);
}

// Procesar un turno de la partida y actualizar el estado
async function playTurn(runId, usuarioId, accion) {
  const puntuacion = 10;
  const estadoActualizado = { 
    habitaciones_superadas: 1, 
    historial_habitaciones: [{ habitacion: 1, evento: 'COMBATE_NORMAL', resultado: 'VICTORIA' }],
    opciones_puertas: generateRooms(1) 
  };
  return await gameRepository.updateRun(runId, 90, 15, puntuacion, 'EN_PROGRESO', estadoActualizado);
}

// Obtener el Top 10 global
async function getLeaderboard() {
  return await gameRepository.getTop10Global();
}

// Obtener el Top 10 del usuario actual
async function getUserLeaderboard(userId) {
  return await gameRepository.getTop10User(userId);
}

// Recuperar la línea de tiempo de la partida
async function getRunTimeline(runId, userId) {
  const run = await gameRepository.getRunTimeline(runId, userId);
  if (!run) {
    throw new Error('Partida no encontrada o acceso no autorizado');
  }
  return run;
}

module.exports = { 
  startRun, 
  playTurn, 
  getLeaderboard, 
  getUserLeaderboard, 
  getRunTimeline 
};