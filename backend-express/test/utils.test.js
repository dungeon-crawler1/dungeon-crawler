const test = require('node:test');
const assert = require('node:assert');
const { successResponse, errorResponse } = require('../src/utils/formatters');
const { generateRooms } = require('../src/utils/gameUtils');
const { getJwtSecret } = require('../src/config/auth');

test('successResponse usa mensaje por defecto', () => {
  assert.deepStrictEqual(successResponse([1]), {
    status: 'success', message: 'Operación exitosa', data: [1],
  });
});

test('successResponse acepta mensaje personalizado', () => {
  assert.strictEqual(successResponse({}, 'Hecho').message, 'Hecho');
});

test('errorResponse usa valores por defecto', () => {
  assert.deepStrictEqual(errorResponse(), { status: 'error', message: 'Error interno' });
});

test('errorResponse acepta estado personalizado', () => {
  assert.deepStrictEqual(errorResponse('Falla', 'fallo'), { status: 'fallo', message: 'Falla' });
});

test('generateRooms devuelve dos puertas', () => {
  const rooms = generateRooms(0);
  assert.strictEqual(rooms.length, 2);
  assert.strictEqual(rooms[1].tipo, 'COMBATE_NORMAL');
});

test('getJwtSecret devuelve la variable de entorno', () => {
  process.env.JWT_SECRET = 'clave-de-prueba';
  assert.strictEqual(getJwtSecret(), 'clave-de-prueba');
});

test('getJwtSecret falla si no esta configurado', () => {
  const original = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  assert.throws(() => getJwtSecret(), /JWT_SECRET no está configurado/);
  process.env.JWT_SECRET = original;
});
