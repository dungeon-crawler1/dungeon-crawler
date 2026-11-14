const test = require('node:test');
const assert = require('node:assert');
const userService = require('../src/services/userService');
const userController = require('../src/controllers/userController');
const { fakeResponse } = require('./helpers');

const original = { ...userService };
const request = () => ({ user: { id: 1 } });

test('getProfile responde 200', async (t) => {
  t.after(() => Object.assign(userService, original));
  userService.getProfile = async () => ({ id: 1 });
  const res = fakeResponse();
  await userController.getProfile(request(), res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.data.id, 1);
});

test('getProfile responde 404 si no existe', async (t) => {
  t.after(() => Object.assign(userService, original));
  userService.getProfile = async () => { throw new Error('Usuario no encontrado'); };
  const res = fakeResponse();
  await userController.getProfile(request(), res);
  assert.strictEqual(res.statusCode, 404);
});
