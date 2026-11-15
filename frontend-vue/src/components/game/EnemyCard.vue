<template>
  <button
    type="button"
    :disabled="disabled || enemy.hp <= 0"
    :style="{ textAlign: 'left', padding: '10px', borderRadius: '8px', cursor: enemy.hp <= 0 ? 'default' : 'pointer', border: active ? '2px solid #ffd166' : '1px solid #555', background: enemy.hp <= 0 ? '#222' : active ? '#2b2312' : '#181818', color: enemy.hp <= 0 ? '#777' : '#fff' }"
    @click="$emit('select')"
  >
    <strong>{{ enemy.hp <= 0 ? '☠️' : enemy.isBoss ? '👑' : enemy.isElite ? '💀' : '⚔️' }} {{ enemy.name }}</strong>
    <div style="font-size: 0.78em; color: #ccc;">{{ enemy.hp }} / {{ enemy.maxHp }} HP | Daño {{ enemy.attack }} | 🪙 {{ enemy.goldReward }}</div>
    <div v-if="enemy.ability" style="font-size: 0.72em; color: #ffd166;">{{ abilityLabels[enemy.ability] ?? enemy.ability }}</div>
    <div v-if="enemy.statuses && (enemy.statuses.stunTurns > 0 || enemy.statuses.acidTurns > 0)" style="font-size: 0.72em; color: #8ce99a;">
      {{ enemy.statuses.stunTurns > 0 ? 'Aturdido ' : '' }}{{ enemy.statuses.acidTurns > 0 ? 'Ácido ' : '' }}
    </div>
    <div style="background: #444; height: 8px; border-radius: 4px; overflow: hidden; margin-top: 6px;">
      <div :style="{ width: `${hpPercent}%`, background: '#ff4d4d', height: '100%' }"></div>
    </div>
    <div v-if="active && enemy.hp > 0" style="font-size: 0.7em; color: #ffd166; margin-top: 4px;">🎯 Objetivo actual</div>
  </button>
</template>

<script setup lang="ts">
// =============================================================================
// TARJETA DE ENEMIGO CON VIDA, HABILIDAD Y ESTADOS
// =============================================================================
import { computed } from 'vue';
import type { Enemy } from '../../types/game';

const props = defineProps<{ enemy: Enemy; active: boolean; disabled: boolean }>();
defineEmits<{ select: [] }>();

const hpPercent = computed(() => Math.max(0, Math.min(100, (props.enemy.hp / props.enemy.maxHp) * 100)));
const abilityLabels: Record<string, string> = {
  REVIVE: 'Revive una vez', STUN: 'Puede aturdir', DOUBLE_ATTACK: 'Doble golpe', KAMIKAZE: 'Kamikaze',
  CRITICAL: 'Crítico', EVADE: 'Esquiva', HARD_SKIN: '-30 % daño', ACID: 'Ácido', FIRE: 'Fuego',
  DRAIN: 'Drena vida', ROCKS: 'Rocas', CHARGE: 'Carga eléctrica', REGEN: 'Regenera',
};
</script>
