// Capa de Lógica de Negocio: Motor del Juego Procedural
const GameRepository = require('../repositories/gameRepository');
const { CLASSES, getRandomInt, checkProbability } = require('../utils/gameUtils');

class GameEngineService {
  static async startNewRun(userId, clase) {
    if (!CLASSES[clase]) {
      return { success: false, message: 'Clase no válida. Elija entre Caballero, Barbaro, Picaro o Mago.' };
    }

    const activeRun = await GameRepository.getActiveRunByUserId(userId);
    if (activeRun) {
      return { success: false, message: 'Ya tiene una partida en progreso. Debe finalizarla o retirarse primero.' };
    }

    const baseStats = CLASSES[clase];
    const initialDoors = this.generateDoors(0);
    const estadoInicial = { stage: 'DOOR_SELECTION', doors: initialDoors, activeCombat: null };

    const run = await GameRepository.createRun(userId, clase, { ...baseStats, estadoInicial });
    return { success: true, data: run };
  }

  static generateDoors(currentScore) {
    const nextRoom = currentScore + 1;
    // Jefes aparecen tras 20 habitaciones superadas, cada 10 habitaciones
    if (nextRoom >= 20 && (nextRoom === 20 || (nextRoom - 20) % 10 === 0)) {
      return [{ type: 'COMBATE_JEFE', icon: '👑', label: 'Enfrentamiento contra Jefe Final' }];
    }

    const pool = [
      { type: 'COMBATE_NORMAL', icon: '⚔️', label: 'Combate Normal' },
      { type: 'COMBATE_ELITE', icon: '💀', label: 'Enemigo Élite' },
      { type: 'MERCADER', icon: '🛒', label: 'Mercader Ambulante' },
      { type: 'FUENTE_DESEOS', icon: '⛲', label: 'Fuente de los Deseos' },
      { type: 'ESTATUA_SAGRADA', icon: '🗿', label: 'Estatua Sagrada' },
      { type: 'SALA_AYUDA', icon: '⛺', label: 'Zona de Descanso' },
      { type: 'TESORO', icon: '💎', label: 'Cámara del Tesoro' }
    ];

    const doorCount = getRandomInt(2, 3);
    const selected = [];
    while (selected.length < doorCount) {
      const option = pool[getRandomInt(0, pool.length - 1)];
      if (!selected.find(d => d.type === option.type)) {
        selected.push(option);
      }
    }
    return selected;
  }

  static async selectDoor(userId, doorIndex) {
    const run = await GameRepository.getActiveRunByUserId(userId);
    if (!run) return { success: false, message: 'No hay ninguna partida activa.' };

    const state = run.estado_run;
    if (state.stage !== 'DOOR_SELECTION' || !state.doors[doorIndex]) {
      return { success: false, message: 'Selección de puerta no válida.' };
    }

    const door = state.doors[doorIndex];
    const nextRoomNum = run.puntuacion + 1;

    if (door.type.startsWith('COMBATE_')) {
      const enemy = this.createEnemy(door.type);
      state.stage = 'IN_COMBAT';
      state.activeCombat = enemy;
      await GameRepository.updateRunState(run.id, { ...run, estado_run: state });
      await GameRepository.addRoomLog(run.id, nextRoomNum, door.type, { enemy: enemy.name }, 'INICIADO');
      return { success: true, message: `Has entrado en combate con ${enemy.name}`, combat: enemy, run };
    }

    return await this.resolveEvent(run, door.type, nextRoomNum);
  }

  static createEnemy(type) {
    if (type === 'COMBATE_JEFE') return { name: 'Señor de las Sombras', hp: 200, maxHp: 200, atk: 25, def: 8, coins: 50, type };
    if (type === 'COMBATE_ELITE') return { name: 'Guardián Maldito', hp: 100, maxHp: 100, atk: 18, def: 6, coins: 25, type };
    return { name: 'Esqueleto Guerrero', hp: 50, maxHp: 50, atk: 12, def: 3, coins: 10, type };
  }

  static async takeCombatTurn(userId, action) {
    const run = await GameRepository.getActiveRunByUserId(userId);
    if (!run) return { success: false, message: 'No hay partida activa.' };

    const state = run.estado_run;
    if (state.stage !== 'IN_COMBAT' || !state.activeCombat) {
      return { success: false, message: 'No te encuentras en un combate activo.' };
    }

    const enemy = state.activeCombat;
    let playerDmg = Math.max(1, run.ataque - enemy.def);
    if (action === 'HABILIDAD') playerDmg = Math.floor(playerDmg * 1.5);

    enemy.hp -= playerDmg;
    run.danio_infligido += playerDmg;

    if (enemy.hp <= 0) {
      run.puntuacion += 1;
      run.monedas_actuales += enemy.coins;
      run.monedas_obtenidas += enemy.coins;
      run.enemigos_derrotados += 1;
      if (enemy.type === 'COMBATE_JEFE') run.jefes_derrotados += 1;

      state.stage = 'DOOR_SELECTION';
      state.activeCombat = null;
      state.doors = this.generateDoors(run.puntuacion);

      await GameRepository.updateRunState(run.id, { ...run, estado_run: state });
      await GameRepository.addRoomLog(run.id, run.puntuacion, enemy.type, { enemy: enemy.name }, 'VICTORIA');
      return { success: true, message: `¡Has derrotado a ${enemy.name}!`, run, newDoors: state.doors };
    }

    // Turno Enemigo: 20% probabilidad de habilidad especial
    const isSpecial = checkProbability(20);
    let enemyDmg = Math.max(1, (isSpecial ? enemy.atk * 1.3 : enemy.atk) - run.defensa);
    enemyDmg = Math.floor(enemyDmg);

    run.vida_actual -= enemyDmg;
    run.danio_recibido += enemyDmg;

    if (run.vida_actual <= 0) {
      run.vida_actual = 0;
      run.resultado = 'DERROTA';
      state.stage = 'GAME_OVER';
      await GameRepository.updateRunState(run.id, { ...run, estado_run: state });
      return { success: true, message: 'Has sido derrotado en combate. Fin de la partida.', run };
    }

    await GameRepository.updateRunState(run.id, { ...run, estado_run: state });
    return { success: true, message: `Atacaste causando ${playerDmg} de daño. Recibiste ${enemyDmg} de daño.`, enemy, run };
  }

  static async resolveEvent(run, eventType, roomNum) {
    const state = run.estado_run;
    let logMsg = '';

    if (eventType === 'FUENTE_DESEOS') {
      if (run.monedas_actuales >= 10) {
        run.monedas_actuales -= 10;
        run.monedas_gastadas += 10;
        if (checkProbability(5)) { // 5% probabilidad de reliquia legendaria
          run.ataque += 10;
          await GameRepository.addRelic(run.id, 'Bendición Legendaria', '+10 Ataque Permanente', roomNum);
          logMsg = '¡La fuente concedió un deseo legendario! (+10 Ataque)';
        } else {
          run.vida_actual = Math.min(run.vida_maxima, run.vida_actual + 20);
          logMsg = 'Lanzaste monedas a la fuente y recuperaste 20 HP.';
        }
      }
    } else if (eventType === 'SALA_AYUDA') {
      const heal = Math.floor(run.vida_maxima * 0.3);
      run.vida_actual = Math.min(run.vida_maxima, run.vida_actual + heal);
      logMsg = `Descansaste en el campamento recuperando ${heal} HP.`;
    } else if (eventType === 'TESORO') {
      const reward = getRandomInt(15, 30);
      run.monedas_actuales += reward;
      run.monedas_obtenidas += reward;
      logMsg = `Abriste el cofre del tesoro y encontraste ${reward} monedas.`;
    }

    run.puntuacion += 1;
    state.stage = 'DOOR_SELECTION';
    state.doors = this.generateDoors(run.puntuacion);

    await GameRepository.updateRunState(run.id, { ...run, estado_run: state });
    await GameRepository.addRoomLog(run.id, run.puntuacion, eventType, { details: logMsg }, 'COMPLETADO');
    return { success: true, message: logMsg, run, newDoors: state.doors };
  }

  static async retireRun(userId) {
    const run = await GameRepository.getActiveRunByUserId(userId);
    if (!run) return { success: false, message: 'No hay partida activa para retirar.' };

    run.resultado = 'RETIRO';
    run.estado_run.stage = 'GAME_OVER';
    const updated = await GameRepository.updateRunState(run.id, { ...run, estado_run: run.estado_run });
    return { success: true, message: 'Te has retirado de la partida exitosamente.', summary: updated };
  }
}

module.exports = GameEngineService;