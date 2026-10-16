// Capa de Lógica de Negocio (Services): Gestión de usuarios
const UserRepository = require('../repositories/userRepository');
const { formatUser } = require('../utils/formatters');

class UserService {
  static async getUserProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      return { success: false, message: 'Usuario no encontrado.' };
    }
    return { success: true, data: formatUser(user) };
  }
}

module.exports = UserService;