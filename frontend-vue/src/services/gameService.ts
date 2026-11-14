// =============================================================================
// API DEL JUEGO: CONTENIDO COMPARTIDO + LLAMADAS AL BACKEND
// =============================================================================
import request from './apiService';
import { createRunApi } from '../../../shared/game/runApi';

export { CLASS_CONFIG, EMPTY_BATTLE_BUFFS, generateProceduralDoors, spawnEnemyForRoom } from '../../../shared/game/gameContent';

const api = createRunApi(request);
export const startGameRun = api.startGameRun;
export const syncRunTurn = api.syncRunTurn;
