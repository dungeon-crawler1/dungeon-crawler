const test = require('node:test');
const assert = require('node:assert');
const gameEngineService = require('../src/services/gameEngineService');
const gameController = require('../src/controllers/gameController');
const { fakeResponse } = require('./helpers');

const original = { ...gameEngineService };

function restore() {
  Object.assign(gameEngineService, original);
}

function request(overrides = {}) {
  return { body: {}, params: { id: '5' }, user: { id: 1 }, ...overrides };
}

test('startRun responde 201', async (t) => {
  t.after(restore);
  gameEngineService.startRun = async () => ({ id: 3 });
  const res = fakeResponse();
  await gameController.startRun(request({ body: { clase: 'MAGO' } }), res);
  assert.strictEqual(res.statusCode, 201);
});

test('startRun responde 400 ante error', async (t) => {
  t.after(restore);
  gameEngineService.startRun = async () => { throw new Error('clase inválida'); };
  const res = fakeResponse();
  await gameController.startRun(request(), res);
  assert.strictEqual(res.statusCode, 400);
});

test('playTurn responde 200', async (t) => {
  t.after(restore);
  gameEngineService.playTurn = async () => ({ id: 5 });
  const res = fakeResponse();
  await gameController.playTurn(request(), res);
  assert.strictEqual(res.statusCode, 200);
});

test('playTurn responde 400 ante error', async (t) => {
  t.after(restore);
  gameEngineService.playTurn = async () => { throw new Error('turno inválido'); };
  const res = fakeResponse();
  await gameController.playTurn(request(), res);
  assert.strictEqual(res.statusCode, 400);
});

test('getLeaderboard responde 200', async (t) => {
  t.after(restore);
  gameEngineService.getLeaderboard = async () => [];
  const res = fakeResponse();
  await gameController.getLeaderboard(request(), res);
  assert.strictEqual(res.statusCode, 200);
});

test('getLeaderboard responde 500 ante error', async (t) => {
  t.after(restore);
  gameEngineService.getLeaderboard = async () => { throw new Error('db caída'); };
  const res = fakeResponse();
  await gameController.getLeaderboard(request(), res);
  assert.strictEqual(res.statusCode, 500);
});

test('getUserLeaderboard responde 200', async (t) => {
  t.after(restore);
  gameEngineService.getUserLeaderboard = async () => [];
  const res = fakeResponse();
  await gameController.getUserLeaderboard(request(), res);
  assert.strictEqual(res.statusCode, 200);
});

test('getUserLeaderboard responde 500 ante error', async (t) => {
  t.after(restore);
  gameEngineService.getUserLeaderboard = async () => { throw new Error('db caída'); };
  const res = fakeResponse();
  await gameController.getUserLeaderboard(request(), res);
  assert.strictEqual(res.statusCode, 500);
});

test('getRunTimeline responde 200', async (t) => {
  t.after(restore);
  gameEngineService.getRunTimeline = async () => ({ id: 5 });
  const res = fakeResponse();
  await gameController.getRunTimeline(request(), res);
  assert.strictEqual(res.statusCode, 200);
});

test('getRunTimeline responde 404 ante error', async (t) => {
  t.after(restore);
  gameEngineService.getRunTimeline = async () => { throw new Error('no encontrada'); };
  const res = fakeResponse();
  await gameController.getRunTimeline(request(), res);
  assert.strictEqual(res.statusCode, 404);
});
