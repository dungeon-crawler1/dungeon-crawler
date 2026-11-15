<template>
  <div v-if="!game.state.hero" class="dungeon-game">
    <div class="dungeon-content">
    <div
      v-if="game.error"
      style="padding: 12px; margin-bottom: 15px; background: #5c1a1a; color: #ffd6d6; border-radius: 6px;"
    >
      ⚠️ {{ game.error }}
    </div>
    <ClassSelector :disabled="game.loading" @select="game.selectClass" />
    </div>
  </div>

  <div v-else-if="game.state.isFinished" class="dungeon-game">
    <GameSummary
      :reason="game.state.finishReason"
      :score="game.state.score"
      :gold="hero.gold"
      @restart="game.resetRun"
      @go-home="goHome"
    />
  </div>

  <div v-else class="dungeon-game">
    <div class="dungeon-content">
    <LeaveConfirmModal
      v-if="game.state.showLeaveConfirm"
      @confirm="goHome"
      @cancel="game.closeLeaveConfirm"
    />

    <HealthManaBar
      :hero="hero"
      :room="game.state.currentRoom"
      :score="game.state.score"
      :disabled="game.loading"
      @forfeit="game.forfeitRun"
      @request-leave="game.openLeaveConfirm"
    />

    <CombatUI
      v-if="game.state.inCombat && enemies.length > 0"
      :hero="hero"
      :enemies="enemies"
      :target-index="game.state.targetIndex ?? 0"
      :disabled="game.loading"
      @select-target="game.selectTarget"
      @attack="game.attackEnemy"
      @use-potion="game.usePotion"
      @cast-spell="game.castSpell"
    />

    <MerchantModal
      v-if="!game.state.inCombat && game.state.merchantItems.length > 0"
      :items="game.state.merchantItems"
      :is-luxury="game.state.isLuxuryMerchant"
      :player-gold="hero.gold"
      :disabled="game.loading"
      @buy="game.buyItem"
      @close="game.closeMerchant"
    />

    <EventModal
      v-if="!game.state.inCombat && game.state.currentEvent"
      :event="game.state.currentEvent"
      @resolve="game.resolveEvent"
    />

    <DoorSelector
      v-if="!game.state.inCombat && game.state.merchantItems.length === 0 && !game.state.currentEvent"
      :doors="game.state.availableDoors"
      :disabled="game.loading"
      @choose="game.chooseDoor"
    />

    <GameLog :logs="game.state.logs" />
    </div>
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// VISTA PRINCIPAL DE GAMEPLAY EN VUE (< 150 LÍNEAS)
// =============================================================================
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/gameStore';
import type { Enemy, Hero } from '../types/game';

import ClassSelector from '../components/game/ClassSelector.vue';
import HealthManaBar from '../components/game/HealthManaBar.vue';
import CombatUI from '../components/game/CombatUI.vue';
import DoorSelector from '../components/game/DoorSelector.vue';
import MerchantModal from '../components/game/MerchantModal.vue';
import EventModal from '../components/game/EventModal.vue';
import GameSummary from '../components/game/GameSummary.vue';
import GameLog from '../components/game/GameLog.vue';
import LeaveConfirmModal from '../components/game/LeaveConfirmModal.vue';

const router = useRouter();
const game = useGameStore();
const hero = computed(() => game.state.hero as Hero);
const enemies = computed<Enemy[]>(() => game.state.enemies ?? (game.state.enemy ? [game.state.enemy] : []));

function goHome(): void {
  router.push('/dashboard');
}
</script>
