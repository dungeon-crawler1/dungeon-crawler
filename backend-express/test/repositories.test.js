const test = require('node:test');
const assert = require('node:assert');
const db = require('../src/config/db');
const userRepository = require('../src/repositories/userRepository');
const gameRepository = require('../src/repositories/gameRepository');
const { createStore, queryHandler } = require('./helpers');

const originalQuery = db.query;

function install() {
  const store = createStore();
  db.query = queryHandler(store);
  return store;
}

test('createUser y findUserByEmail', async (t) => {
  t.after(() => { db.query = originalQuery; });
  install();
  const created = await userRepository.createUser('a@example.com', 'hash');
  assert.strictEqual(created.email, 'a@example.com');
  const found = await userRepository.findUserByEmail('a@example.com');
  assert.strictEqual(found.password_hash, 'hash');
});

test('findUserByEmail inexistente devuelve null', async (t) => {
  t.after(() => { db.query = originalQuery; });
  install();
  assert.strictEqual(await userRepository.findUserByEmail('no@example.com'), null);
});

test('findUserById omite el hash', async (t) => {
  t.after(() => { db.query = originalQuery; });
  install();
  const created = await userRepository.createUser('b@example.com', 'hash');
  const found = await userRepository.findUserById(created.id);
  assert.strictEqual(found.password_hash, undefined);
});

test('findUserById inexistente devuelve null', async (t) => {
  t.after(() => { db.query = originalQuery; });
  install();
  assert.strictEqual(await userRepository.findUserById(99), null);
});

test('createRun guarda la partida', async (t) => {
  t.after(() => { db.query = originalQuery; });
  install();
  const run = await gameRepository.createRun(1, 'MAGO', 70, 70, 25, 4, { sala: 0 });
  assert.strictEqual(run.clase, 'MAGO');
});

test('updateRun modifica la partida', async (t) => {
  t.after(() => { db.query = originalQuery; });
  install();
  const run = await gameRepository.createRun(1, 'MAGO', 70, 70, 25, 4, {});
  const updated = await gameRepository.updateRun(run.id, 60, 15, 30, 'EN_PROGRESO', {});
  assert.strictEqual(updated.puntuacion, 30);
});

test('getTop10Global devuelve filas', async (t) => {
  t.after(() => { db.query = originalQuery; });
  install();
  await gameRepository.createRun(1, 'MAGO', 70, 70, 25, 4, {});
  assert.strictEqual((await gameRepository.getTop10Global()).length, 1);
});

test('getTop10User filtra por usuario', async (t) => {
  t.after(() => { db.query = originalQuery; });
  install();
  await gameRepository.createRun(1, 'MAGO', 70, 70, 25, 4, {});
  await gameRepository.createRun(2, 'PICARO', 80, 80, 18, 8, {});
  assert.strictEqual((await gameRepository.getTop10User(2)).length, 1);
});

test('getRunTimeline devuelve la partida propia', async (t) => {
  t.after(() => { db.query = originalQuery; });
  install();
  const run = await gameRepository.createRun(1, 'MAGO', 70, 70, 25, 4, {});
  assert.strictEqual((await gameRepository.getRunTimeline(run.id, 1)).id, run.id);
});

test('getRunTimeline devuelve null para otra partida', async (t) => {
  t.after(() => { db.query = originalQuery; });
  install();
  const run = await gameRepository.createRun(1, 'MAGO', 70, 70, 25, 4, {});
  assert.strictEqual(await gameRepository.getRunTimeline(run.id, 2), null);
});
