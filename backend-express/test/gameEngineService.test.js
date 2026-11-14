const test = require('node:test');
const assert = require('node:assert');
const gameRepository = require('../src/repositories/gameRepository');
const gameEngineService = require('../src/services/gameEngineService');

const original = { ...gameRepository };

function restore() {
  Object.assign(gameRepository, original);
}

test('startRun asigna estadisticas de la clase', async (t) => {
  t.after(restore);
  let captured = null;
  gameRepository.createRun = async (...args) => {
    captured = args;
    return { id: 10 };
  };
  const run = await gameEngineService.startRun(7, 'mago');
  assert.strictEqual(run.id, 10);
  assert.deepStrictEqual(captured.slice(0, 6), [7, 'mago', 70, 70, 25, 4]);
  assert.strictEqual(captured[6].opciones_puertas.length, 2);
});

test('startRun usa caballero ante clase desconocida', async (t) => {
  t.after(restore);
  let captured = null;
  gameRepository.createRun = async (...args) => { captured = args; return {}; };
  await gameEngineService.startRun(1, 'DRAGON');
  assert.strictEqual(captured[2], 100);
});

test('playTurn actualiza vida y puntuacion', async (t) => {
  t.after(restore);
  let captured = null;
  gameRepository.updateRun = async (...args) => { captured = args; return { id: 1 }; };
  await gameEngineService.playTurn(1, 7, 'ATACAR');
  assert.deepStrictEqual(captured.slice(1, 5), [90, 15, 10, 'EN_PROGRESO']);
  assert.strictEqual(captured[0], 1);
});

test('getLeaderboard delega en el repositorio', async (t) => {
  t.after(restore);
  gameRepository.getTop10Global = async () => [{ id: 1 }];
  assert.deepStrictEqual(await gameEngineService.getLeaderboard(), [{ id: 1 }]);
});

test('getUserLeaderboard delega en el repositorio', async (t) => {
  t.after(restore);
  gameRepository.getTop10User = async (id) => [{ usuario_id: id }];
  assert.deepStrictEqual(await gameEngineService.getUserLeaderboard(4), [{ usuario_id: 4 }]);
});

test('getRunTimeline devuelve la partida encontrada', async (t) => {
  t.after(restore);
  gameRepository.getRunTimeline = async () => ({ id: 2 });
  assert.deepStrictEqual(await gameEngineService.getRunTimeline(2, 1), { id: 2 });
});

test('getRunTimeline falla si la partida no existe', async (t) => {
  t.after(restore);
  gameRepository.getRunTimeline = async () => null;
  await assert.rejects(() => gameEngineService.getRunTimeline(2, 1), /no encontrada/);
});
