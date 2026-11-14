const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { once } = require('node:events');

process.env.JWT_SECRET = 'clave-de-prueba';

const db = require('../src/config/db');
const app = require('../src/index');
const { createStore, queryHandler } = require('./helpers');

const originalQuery = db.query;
let server;
let baseUrl;
let token;

before(async () => {
  db.query = queryHandler(createStore());
  server = app.listen(0);
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  db.query = originalQuery;
  server.close();
});

async function call(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  return { status: response.status, body: await response.json() };
}

test('registro y login end-to-end', async () => {
  const payload = { email: 'hero@example.com', password: 'clave123' };
  assert.strictEqual((await call('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) })).status, 201);
  const login = await call('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });
  assert.strictEqual(login.status, 200);
  token = login.body.data.token;
  assert.ok(token);
});

test('el login invalido responde 401', async () => {
  const payload = { email: 'hero@example.com', password: 'mala' };
  const response = await call('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });
  assert.strictEqual(response.status, 401);
});

test('el perfil requiere token', async () => {
  assert.strictEqual((await call('/api/users/profile')).status, 401);
});

test('el perfil devuelve el usuario autenticado', async () => {
  const response = await call('/api/users/profile', { headers: { Authorization: `Bearer ${token}` } });
  assert.strictEqual(response.body.data.email, 'hero@example.com');
});

test('iniciar partida y ejecutar un turno', async () => {
  const headers = { Authorization: `Bearer ${token}` };
  const started = await call('/api/game/start', {
    method: 'POST', headers, body: JSON.stringify({ clase: 'MAGO' }),
  });
  assert.strictEqual(started.status, 201);
  const turn = await call(`/api/game/run/${started.body.data.id}/turn`, {
    method: 'POST', headers, body: JSON.stringify({ accion: 'ATACAR' }),
  });
  assert.strictEqual(turn.status, 200);
});

test('leaderboard global, personal y timeline', async () => {
  const headers = { Authorization: `Bearer ${token}` };
  assert.strictEqual((await call('/api/game/leaderboard')).status, 200);
  assert.strictEqual((await call('/api/game/leaderboard/user', { headers })).status, 200);
  const runs = await call('/api/game/leaderboard/user', { headers });
  const runId = runs.body.data[0].id;
  assert.strictEqual((await call(`/api/game/run/${runId}/timeline`, { headers })).status, 200);
});
