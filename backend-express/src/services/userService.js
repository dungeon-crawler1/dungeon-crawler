// Servicio de información de usuario
const userRepository = require('../repositories/userRepository');

async function getProfile(userId) {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  return user;
}

module.exports = { getProfile };