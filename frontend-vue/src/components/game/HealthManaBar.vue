<template>
  <div style="padding: 15px; background: #222; color: #fff; border-radius: 8px; margin-bottom: 20px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
      <div>
        <strong>{{ hero.name }}</strong> | 🚪 Sala #{{ room }} | 🏆 Puntos: <strong>{{ score }}</strong> |
        🪙 Monedas: <strong>{{ hero.gold }}</strong> | 🧪 Pociones: <strong>{{ totalPotions }}</strong>
      </div>
      <div style="display: flex; gap: 8px;">
        <button type="button" :disabled="disabled" :style="buttonStyle('#dc3545')" @click="$emit('forfeit')">
          🏳️ Terminar Partida
        </button>
        <button type="button" :disabled="disabled" :style="buttonStyle('#495057')" @click="$emit('request-leave')">
          🏠 Volver al Inicio
        </button>
      </div>
    </div>

    <div :style="{ marginBottom: hero.maxMana > 0 ? '8px' : '0', position: 'relative' }">
      <small>
        Vida ({{ hero.hp }} / {{ hero.maxHp }}) | ⚔️ Ataque: {{ hero.attack }} | 🛡️ Reducción: {{ totalReductionPct }} %
        <span
          style="display: inline-block; padding: 0 6px; margin-left: 4px; background: #3a3f45; color: #ffd166; border-radius: 4px; cursor: help; font-weight: bold; letter-spacing: 1px;"
          @mouseenter="showModifiers = true"
          @mouseleave="showModifiers = false"
        >
          ...
        </span>
      </small>

      <div
        v-if="showModifiers"
        style="position: absolute; top: 22px; left: 120px; z-index: 50; background: #111315; border: 1px solid #ffd166; border-radius: 6px; padding: 10px 14px; min-width: 280px; font-size: 0.8em; box-shadow: 0 4px 12px rgba(0,0,0,0.6);"
      >
        <strong style="color: #ffd166; display: block; margin-bottom: 6px;">📊 Modificadores y Porcentajes del Jugador</strong>
        <div>❤️ Vida Base: {{ hero.baseMaxHp }} (+{{ hero.flatMaxHpBonus }} suma) | Bono Vida: +{{ totalMaxHpPct }} %</div>
        <div>⚔️ Daño Base: {{ hero.baseAttack }} (+{{ hero.flatAttackBonus }} suma) | Daño Extra: +{{ totalDamagePct }} %</div>
        <div>🛡️ Reducción de Daño: {{ totalReductionPct }} %</div>
        <div>💨 Prob. Evasión: {{ totalEvasionPct }} %</div>
        <div>🪙 Monedas Extra: +{{ extraGoldPct }} %</div>
        <div>🏷️ Descuento en Mercaderes: -{{ discountPct }} %</div>
      </div>

      <div style="background: #555; height: 14px; border-radius: 4px; overflow: hidden; margin-top: 4px;">
        <div :style="{ width: `${hpPercent}%`, background: '#dc3545', height: '100%', transition: 'width 0.3s' }"></div>
      </div>
    </div>

    <div v-if="hero.maxMana > 0">
      <small>Maná ({{ hero.mana }} / {{ hero.maxMana }})</small>
      <div style="background: #555; height: 14px; border-radius: 4px; overflow: hidden;">
        <div :style="{ width: `${manaPercent}%`, background: '#007bff', height: '100%', transition: 'width 0.3s' }"></div>
      </div>
    </div>

    <RelicsDropdown :relics="hero.relics" />
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// HUD SUPERIOR: ESTADÍSTICAS, TOOLTIP Y RELIQUIAS
// =============================================================================
import { computed, ref } from 'vue';
import type { Hero } from '../../types/game';
import RelicsDropdown from './RelicsDropdown.vue';

const props = defineProps<{ hero: Hero; room: number; score: number; disabled: boolean }>();
defineEmits<{ forfeit: []; 'request-leave': [] }>();

const showModifiers = ref<boolean>(false);
const hpPercent = computed(() => Math.max(0, Math.min(100, (props.hero.hp / props.hero.maxHp) * 100)));
const manaPercent = computed(() => (props.hero.maxMana > 0 ? Math.max(0, Math.min(100, (props.hero.mana / props.hero.maxMana) * 100)) : 0));
const totalPotions = computed(() => props.hero.inventory.reduce((sum, potion) => sum + potion.quantity, 0));
const totalDamagePct = computed(() => Math.round((props.hero.percentAttackBonus + props.hero.battleBuffs.damageBoostPercent) * 100));
const totalMaxHpPct = computed(() => Math.round(props.hero.percentMaxHpBonus * 100));
const totalReductionPct = computed(() => Math.round(Math.min(0.85, props.hero.damageReduction + props.hero.battleBuffs.defenseBonus) * 100));
const totalEvasionPct = computed(() => Math.round((props.hero.evasionChance + props.hero.battleBuffs.evasionBonus) * 100));
const extraGoldPct = computed(() => Math.round((props.hero.goldMultiplier - 1) * 100));
const discountPct = computed(() => Math.round(props.hero.shopDiscount * 100));

function buttonStyle(background: string) {
  return { padding: '6px 12px', background, color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
}
</script>
