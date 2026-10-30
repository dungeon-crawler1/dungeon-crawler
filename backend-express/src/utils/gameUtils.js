// Configuración de estadísticas base por clase y funciones probabilísticas

const CLASSES = {
  Caballero: { vida: 120, ataque: 15, defensa: 10, monedas: 20 },
  Barbaro: { vida: 150, ataque: 20, defensa: 5, monedas: 10 },
  Picaro: { vida: 90, ataque: 18, defensa: 6, monedas: 30 },
  Mago: { vida: 80, ataque: 25, defensa: 4, monedas: 25 }
};

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const checkProbability = (percent) => Math.random() * 100 < percent;

module.exports = { CLASSES, getRandomInt, checkProbability };