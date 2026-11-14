const test = require('node:test');
const assert = require('node:assert');
const authService = require('../src/services/authService');
const authController = require('../src/controllers/authController');
const { fakeResponse } = require('./helpers');

const original = { ...authService };

function request(body = {}) {
  return { body };
}

test('register responde 201 con el usuario', async (t) => {
  t.after(() => Object.assign(authService, original));
  authService.register = async () => ({ id: 1, email: 'a@example.com' });
  const res = fakeResponse();
  await authController.register(request({ email: 'a@example.com', password: 'x' }), res);
  assert.strictEqual(res.statusCode, 201);
  assert.strictEqual(res.body.status, 'success');
});

test('register responde 400 ante error', async (t) => {
  t.after(() => Object.assign(authService, original));
  authService.register = async () => { throw new Error('El usuario ya existe'); };
  const res = fakeResponse();
  await authController.register(request(), res);
  assert.strictEqual(res.statusCode, 400);
});

test('login responde 200 con token', async (t) => {
  t.after(() => Object.assign(authService, original));
  authService.login = async () => ({ token: 'abc' });
  const res = fakeResponse();
  await authController.login(request(), res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.data.token, 'abc');
});

test('login responde 401 ante credenciales invalidas', async (t) => {
  t.after(() => Object.assign(authService, original));
  authService.login = async () => { throw new Error('Credenciales inválidas'); };
  const res = fakeResponse();
  await authController.login(request(), res);
  assert.strictEqual(res.statusCode, 401);
});
