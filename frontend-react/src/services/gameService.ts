import request from './apiService';
import { Hero, GameState } from '../types/game';

export async function fetchHeroClasses(): Promise<Hero[]> {
  return request<Hero[]>('/game/classes', { method: 'GET' });
}

export async function selectHeroClass(classId: string): Promise<GameState> {
  return request<GameState>('/game/select-hero', {
    method: 'POST',
    body: JSON.stringify({ classId }),
  });
}

export async function chooseDoor(doorId: string): Promise<GameState> {
  return request<GameState>('/game/choose-door', {
    method: 'POST',
    body: JSON.stringify({ doorId }),
  });
}

export async function executeCombatAction(action: 'ATTACK' | 'DEFEND' | 'SPELL' | 'FLEE'): Promise<GameState> {
  return request<GameState>('/game/combat-action', {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
}

export async function buyShopItem(itemId: string): Promise<GameState> {
  return request<GameState>('/game/shop-buy', {
    method: 'POST',
    body: JSON.stringify({ itemId }),
  });
}

export async function resolveEventOption(option: string): Promise<GameState> {
  return request<GameState>('/game/resolve-event', {
    method: 'POST',
    body: JSON.stringify({ option }),
  });
}