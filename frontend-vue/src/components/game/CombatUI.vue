<template>
  <div style="border: 2px solid #dc3545; padding: 20px; border-radius: 8px; background: #2b1b1d; color: #fff; margin-top: 15px;">
    <h3>⚔️ COMBATE: {{ enemy.name }} (Daño: {{ enemy.attack }} | Botín: 🪙 {{ enemy.goldReward }})</h3>
    <div style="margin-bottom: 12px;">
      <small>Vida del Enemigo ({{ enemy.hp }} / {{ enemy.maxHp }})</small>
      <div style="background: #444; height: 18px; border-radius: 4px; overflow: hidden;">
        <div :style="{ width: `${enemyHpPercent}%`, background: '#ff4d4d', height: '100%', transition: 'width 0.3s' }"></div>
      </div>
    </div>

    <div
      v-if="damageBoostPercent > 0 || evasionBonus > 0 || defenseBonus > 0 || blockCharges > 0"
      style="padding: 6px 10px; background: #1c2b1e; border-radius: 4px; margin-bottom: 12px; font-size: 0.82em; color: #8ce99a;"
    >
      ✨ Efectos activos en batalla:
      <span v-if="damageBoostPercent > 0"> [Daño +{{ Math.round(damageBoostPercent * 100) }} %]</span>
      <span v-if="evasionBonus > 0"> [Evasión +{{ Math.round(evasionBonus * 100) }} %]</span>
      <span v-if="defenseBonus > 0"> [Defensa +{{ Math.round(defenseBonus * 100) }} %]</span>
      <span v-if="blockCharges > 0"> [Bloqueo: {{ blockCharges }} ataque(s)]</span>
    </div>

    <button type="button" :disabled="disabled" :style="buttonStyle('#dc3545')" @click="$emit('attack')">
      ⚔️ Atacar ({{ effectiveAttackDamage }} daño)
    </button>

    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #555;">
      <small style="display: block; margin-bottom: 8px;">🧪 Inventario de Pociones:</small>
      <span v-if="hero.inventory.length === 0" style="font-size: 0.85em; color: #aaa;">
        No tienes pociones guardadas en tu inventario.
      </span>
      <div v-else style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px;">
        <div
          v-for="potion in hero.inventory"
          :key="potion.id"
          style="background: #181818; border: 1px solid #444; border-radius: 6px; padding: 8px;"
        >
          <strong>{{ potion.name }} (x{{ potion.quantity }})</strong>
          <div style="font-size: 0.78em; color: #ffd166;">⏱️ Duración: {{ potion.durationLabel }}</div>
          <p style="font-size: 0.78em; margin: 4px 0 8px; color: #ccc;">{{ potion.description }}</p>
          <button type="button" :disabled="disabled" :style="buttonStyle('#28a745')" @click="$emit('use-potion', potion.id)">
            Usar Poción
          </button>
        </div>
      </div>
    </div>

    <div v-if="hero.heroClass === 'MAGO'" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #555;">
      <small style="display: block; margin-bottom: 8px;">✨ Grimorio del Mago (Maná: {{ hero.mana }}/{{ hero.maxMana }}):</small>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button type="button" :disabled="disabled || hero.mana < 30" :style="buttonStyle('#007bff')" @click="$emit('cast-spell', 'BOLA_FUEGO')">🔥 Bola de Fuego (30 MP)</button>
        <button type="button" :disabled="disabled || hero.mana < 55" :style="buttonStyle('#6610f2')" @click="$emit('cast-spell', 'RAYO')">⚡ Rayo (55 MP)</button>
        <button type="button" :disabled="disabled || hero.mana < 40" :style="buttonStyle('#17a2b8')" @click="$emit('cast-spell', 'ESCUDO')">🛡️ Escudo 2 Golpes (40 MP)</button>
        <button type="button" :disabled="disabled || hero.mana < 60" :style="buttonStyle('#fd7e14')" @click="$emit('cast-spell', 'ESCAPE')">🌀 Escape Arcano (60 MP)</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// INTERFAZ DE COMBATE POR TURNOS
// =============================================================================
import { computed } from 'vue';
import type { Enemy, Hero, SpellId } from '../../types/game';
import { calculateHeroPhysicalDamage } from '../../utils/combatLogic';

const props = defineProps<{ hero: Hero; enemy: Enemy; disabled: boolean }>();
defineEmits<{ attack: []; 'use-potion': [potionId: string]; 'cast-spell': [spell: SpellId] }>();

const enemyHpPercent = computed(() => Math.max(0, Math.min(100, (props.enemy.hp / props.enemy.maxHp) * 100)));
const damageBoostPercent = computed(() => props.hero.battleBuffs.damageBoostPercent);
const evasionBonus = computed(() => props.hero.battleBuffs.evasionBonus);
const defenseBonus = computed(() => props.hero.battleBuffs.defenseBonus);
const blockCharges = computed(() => props.hero.battleBuffs.blockCharges);
const effectiveAttackDamage = computed(() => calculateHeroPhysicalDamage(props.hero));

function buttonStyle(background: string) {
  return { padding: '8px 12px', background, color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' };
}
</script>
