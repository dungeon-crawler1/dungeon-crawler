const test = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'clave-de-prueba';

const authenticateToken = require('../src/middlewares/authMiddleware');
const { fakeResponse } = require('./helpers');

function requestWith(authorization) {
  return { headers: authorization ? { authorization } : {} };
}

test('rechaza peticiones sin token', () => {
  const res = fakeResponse();
  authenticateToken(requestWith(null), res, () => assert.fail('no debe continuar'));
  assert.strictEqual(res.statusCode, 401);
});

test('rechaza token con firma invalida', () => {
  const res = fakeResponse();
  const token = jwt.sign({ id: 1 }, 'otra-clave');
  authenticateToken(requestWith(`Bearer ${token}`), res, () => assert.fail('no debe continuar'));
  assert.strictEqual(res.statusCode, 403);
});

test('acepta token valido y adjunta el usuario', () => {
  const req = requestWith(`Bearer ${jwt.sign({ id: 5 }, 'clave-de-prueba')}`);
  let called = false;
  authenticateToken(req, fakeResponse(), () => { called = true; });
  assert.strictEqual(called, true);
  assert.strictEqual(req.user.id, 5);
});
