// Utilidades compartidas por la suite: base de datos en memoria y dobles de HTTP.
const NOW = '2026-01-01T00:00:00';

function createStore() {
  return { users: [], runs: [], userSeq: 0, runSeq: 0 };
}

function publicUser(user) {
  return { id: user.id, email: user.email, created_at: user.created_at };
}

function insertUser(store, params) {
  const user = {
    id: ++store.userSeq,
    email: params[0],
    password_hash: params[1],
    created_at: NOW,
  };
  store.users.push(user);
  return { rows: [publicUser(user)] };
}

function insertRun(store, params) {
  const run = {
    id: ++store.runSeq,
    usuario_id: params[0],
    clase: params[1],
    vida_actual: params[2],
    vida_maxima: params[3],
    ataque: params[4],
    defensa: params[5],
    monedas_actuales: 0,
    puntuacion: 0,
    resultado: 'EN_PROGRESO',
    estado_run: params[6],
    created_at: NOW,
  };
  store.runs.push(run);
  return { rows: [run] };
}

function updateRun(store, params) {
  const run = store.runs.find((item) => item.id === params[5]);
  if (!run) return { rows: [] };
  Object.assign(run, {
    vida_actual: params[0],
    monedas_actuales: params[1],
    puntuacion: params[2],
    resultado: params[3],
    estado_run: params[4],
  });
  return { rows: [run] };
}

function userQuery(store, sql, params) {
  if (sql.startsWith('insert into usuarios')) return insertUser(store, params);
  if (sql.includes('from usuarios where email')) {
    const user = store.users.find((item) => item.email === params[0]);
    return { rows: user ? [user] : [] };
  }
  if (sql.includes('from usuarios where id')) {
    const user = store.users.find((item) => item.id === params[0]);
    return { rows: user ? [publicUser(user)] : [] };
  }
  return null;
}

function runQuery(store, sql, params) {
  if (sql.startsWith('insert into partidas')) return insertRun(store, params);
  if (sql.startsWith('update partidas')) return updateRun(store, params);
  if (sql.includes('join usuarios')) {
    return { rows: store.runs.map((run) => ({ ...run, usuario: 'hero@example.com' })) };
  }
  if (sql.includes('where usuario_id = $1')) {
    return { rows: store.runs.filter((run) => run.usuario_id === params[0]) };
  }
  if (sql.includes('where id = $1 and usuario_id = $2')) {
    return { rows: store.runs.filter((run) => run.id === params[0] && run.usuario_id === params[1]) };
  }
  return null;
}

function queryHandler(store) {
  return async (text, params = []) => {
    const sql = String(text).replace(/\s+/g, ' ').trim().toLowerCase();
    return userQuery(store, sql, params) || runQuery(store, sql, params) || { rows: [] };
  };
}

function fakeResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

function restore(object, method, original) {
  object[method] = original;
}

module.exports = { createStore, queryHandler, fakeResponse, restore, NOW };
