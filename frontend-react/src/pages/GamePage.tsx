// =============================================================================
// VISTA PRINCIPAL DE GAMEPLAY (< 150 LÍNEAS)
// =============================================================================
import React from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { ClassSelector } from '../components/game/ClassSelector';
import { HealthManaBar } from '../components/game/HealthManaBar';
import { CombatUI } from '../components/game/CombatUI';
import { DoorSelector } from '../components/game/DoorSelector';
import { MerchantModal } from '../components/game/MerchantModal';
import { EventModal } from '../components/game/EventModal';
import { GameSummary } from '../components/game/GameSummary';
import { GameLog } from '../components/game/GameLog';

export const GamePage: React.FC = () => {
  const {
    state, loading, error, selectClass, chooseDoor, attackEnemy,
    usePotion, castSpell, buyItem, closeMerchant, resolveEvent, forfeitRun, resetRun,
  } = useGameEngine();

  if (!state.hero) {
    return (
      <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
        {error && <div style={{ padding: '12px', marginBottom: '15px', background: '#5c1a1a', color: '#ffd6d6', borderRadius: '6px' }}>⚠️ {error}</div>}
        <ClassSelector onSelect={selectClass} disabled={loading} />
      </div>
    );
  }

  if (state.isFinished) {
    return <GameSummary reason={state.finishReason} score={state.score} gold={state.hero.gold} onRestart={resetRun} />;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
      <HealthManaBar hero={state.hero} room={state.currentRoom} score={state.score} onForfeit={forfeitRun} disabled={loading} />

      {state.inCombat && state.enemy && (
        <CombatUI hero={state.hero} enemy={state.enemy} onAttack={attackEnemy} onUsePotion={usePotion} onCastSpell={castSpell} disabled={loading} />
      )}

      {!state.inCombat && state.merchantItems.length > 0 && (
        <MerchantModal items={state.merchantItems} playerGold={state.hero.gold} onBuy={buyItem} onClose={closeMerchant} disabled={loading} />
      )}

      {!state.inCombat && state.currentEvent && (
        <EventModal event={state.currentEvent} onResolve={resolveEvent} />
      )}

      {!state.inCombat && state.merchantItems.length === 0 && !state.currentEvent && (
        <DoorSelector doors={state.availableDoors} onChoose={chooseDoor} disabled={loading} />
      )}

      <GameLog logs={state.logs} />
    </div>
  );
};