import React, { useState } from 'react';
import { GameState } from '../types/game';
import { selectHeroClass, chooseDoor, executeCombatAction, buyShopItem, resolveEventOption } from '../services/gameService';
import { ClassSelector } from '../components/game/ClassSelector';
import { HealthManaBar } from '../components/game/HealthManaBar';
import { CombatUI } from '../components/game/CombatUI';
import { DoorSelector } from '../components/game/DoorSelector';
import { MerchantModal } from '../components/game/MerchantModal';
import { EventModal } from '../components/game/EventModal';

export const GamePage: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    hero: null,
    currentRoom: 1,
    inCombat: false,
    enemy: null,
    availableDoors: [],
    merchantItems: [],
    currentEvent: null,
    logs: ['Bienvenido a la Mazmorra.'],
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleSelectClass = async (classId: string) => {
    setLoading(true);
    try {
      const res = await selectHeroClass(classId);
      setGameState(res);
    } catch {
      // Manejo estricto sin depuración residual
    } finally {
      setLoading(false);
    }
  };

  const handleDoor = async (doorId: string) => {
    setLoading(true);
    try {
      const res = await chooseDoor(doorId);
      setGameState(res);
    } catch {} finally { setLoading(false); }
  };

  const handleCombat = async (action: 'ATTACK' | 'DEFEND' | 'SPELL' | 'FLEE') => {
    setLoading(true);
    try {
      const res = await executeCombatAction(action);
      setGameState(res);
    } catch {} finally { setLoading(false); }
  };

  const handleBuy = async (itemId: string) => {
    try {
      const res = await buyShopItem(itemId);
      setGameState(res);
    } catch {}
  };

  const handleEvent = async (option: string) => {
    try {
      const res = await resolveEventOption(option);
      setGameState(res);
    } catch {}
  };

  if (!gameState.hero) {
    return <ClassSelector onSelect={handleSelectClass} disabled={loading} />;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
      <HealthManaBar hero={gameState.hero} />

      {gameState.inCombat && gameState.enemy && (
        <CombatUI enemy={gameState.enemy} onAction={handleCombat} disabled={loading} />
      )}

      {!gameState.inCombat && gameState.merchantItems.length > 0 && (
        <MerchantModal
          items={gameState.merchantItems}
          playerGold={gameState.hero.gold}
          onBuy={handleBuy}
          onClose={() => setGameState({ ...gameState, merchantItems: [] })}
        />
      )}

      {!gameState.inCombat && gameState.currentEvent && (
        <EventModal event={gameState.currentEvent} onResolve={handleEvent} />
      )}

      {!gameState.inCombat && gameState.availableDoors.length > 0 && (
        <DoorSelector doors={gameState.availableDoors} onChoose={handleDoor} disabled={loading} />
      )}
    </div>
  );
};