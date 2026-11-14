const test = require('node:test');
const assert = require('node:assert');
const userRepository = require('../src/repositories/userRepository');
const userService = require('../src/services/userService');

const original = { ...userRepository };

test('getProfile devuelve el usuario existente', async (t) => {
  t.after(() => Object.assign(userRepository, original));
  userRepository.findUserById = async () => ({ id: 2, email: 'a@example.com' });
  assert.strictEqual((await userService.getProfile(2)).email, 'a@example.com');
});

test('getProfile falla si el usuario no existe', async (t) => {
  t.after(() => Object.assign(userRepository, original));
  userRepository.findUserById = async () => null;
  await assert.rejects(() => userService.getProfile(9), /Usuario no encontrado/);
});
