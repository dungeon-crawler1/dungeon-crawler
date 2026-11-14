const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../src/repositories/userRepository');
const authService = require('../src/services/authService');

process.env.JWT_SECRET = 'clave-de-prueba';
const original = { ...userRepository };

function restore() {
  Object.assign(userRepository, original);
}

test('register crea el usuario con hash', async (t) => {
  t.after(restore);
  let savedHash = null;
  userRepository.findUserByEmail = async () => null;
  userRepository.createUser = async (email, hash) => {
    savedHash = hash;
    return { id: 1, email };
  };
  const user = await authService.register('nuevo@example.com', 'clave123');
  assert.strictEqual(user.email, 'nuevo@example.com');
  assert.strictEqual(await bcrypt.compare('clave123', savedHash), true);
});

test('register rechaza email duplicado', async (t) => {
  t.after(restore);
  userRepository.findUserByEmail = async () => ({ id: 1 });
  await assert.rejects(() => authService.register('dup@example.com', 'x'), /ya existe/);
});

test('login devuelve token firmado', async (t) => {
  t.after(restore);
  const hash = await bcrypt.hash('clave123', 4);
  userRepository.findUserByEmail = async () => ({ id: 3, email: 'a@example.com', password_hash: hash });
  const data = await authService.login('a@example.com', 'clave123');
  assert.strictEqual(jwt.verify(data.token, 'clave-de-prueba').id, 3);
});

test('login rechaza usuario inexistente', async (t) => {
  t.after(restore);
  userRepository.findUserByEmail = async () => null;
  await assert.rejects(() => authService.login('no@example.com', 'x'), /Credenciales inválidas/);
});

test('login rechaza clave incorrecta', async (t) => {
  t.after(restore);
  const hash = await bcrypt.hash('correcta', 4);
  userRepository.findUserByEmail = async () => ({ id: 3, email: 'a@example.com', password_hash: hash });
  await assert.rejects(() => authService.login('a@example.com', 'mala'), /Credenciales inválidas/);
});
