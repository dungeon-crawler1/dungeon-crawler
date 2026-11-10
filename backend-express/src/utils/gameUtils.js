// Utilidades de motor de juego: Generador procedural de habitaciones
function generateRooms(habitacionesSuperadas) {
  const tipos = ['COMBATE_NORMAL', 'MERCADER', 'FUENTE_DESEOS', 'ESTATUA_SAGRADA', 'SALA_TESORO'];
  const habitacionTipo = tipos[Math.floor(Math.random() * tipos.length)];
  return [
    { id: 1, tipo: habitacionTipo, descripcion: 'Puerta Izquierda' },
    { id: 2, tipo: 'COMBATE_NORMAL', descripcion: 'Puerta Derecha' }
  ];
}

module.exports = { generateRooms };