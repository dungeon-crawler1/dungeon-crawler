<template>
  <div style="border: 2px solid #dc3545; padding: 20px; border-radius: 8px; background: #2b1b1d; color: #fff; margin-top: 15px;">
    <h3>⚔️ COMBATE ({{ enemies.filter((enemy) => enemy.hp > 0).length }} enemigo(s) en pie)</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px; margin-bottom: 12px;">
      <EnemyCard
        v-for="(enemy, index) in enemies"
        :key="enemy.id ?? index"
        :enemy="enemy"
        :active="index === targetIndex"
        :disabled="disabled"
        @select="$emit('select-target', index)"
      />
    </div>

    <div v-if="hasEffects" style="padding: 6px 10px; background: #1c2b1e; border-radius: 4px; margin-bottom: 12px; font-size: 0.82em; color: #8ce99a;">
      ✨ Efectos activos: {{ statusText }}
      <span v-if="damageBoostPercent > 0"> [Daño +{{ Math.round(damageBoostPercent * 100) }} %]</span>
      <span v-if="evasionBonus > 0"> [Evasión +{{ Math.round(evasionBonus * 100) }} %]</span>
      <span v-if="defenseBonus > 0"> [Defensa +{{ Math.round(defenseBonus * 100) }} %]</span>
      <span v-if="blockCharges > 0"> [Bloqueo: {{ blockCharges }}]</span>
    </div>

    <button type="button" :disabled="disabled || statuses.stunTurns > 0" :style="buttonStyle('#dc3545')" @click="$emit('attack')">
      ⚔️ Atacar ({{ physicalDamage }} daño)
    </button>

    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #555;">
      <small style="display: block; margin-bottom: 8px;">🧪 Inventario de Pociones:</small>
      <span v-if="hero.inventory.length === 0" style="font-size: 0.85em; color: #aaa;">No tenés pociones guardadas.</span>
      <div v-else style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px;">
        <div v-for="potion in hero.inventory" :key="potion.id" style="background: #181818; border: 1px solid #444; border-radius: 6px; padding: 8px;">
          <strong>{{ potion.name }} (x{{ potion.quantity }})</strong>
          <div style="font-size: 0.78em; color: #ffd166;">⏱️ {{ potion.durationLabel }}</div>
          <p style="font-size: 0.78em; margin: 4px 0 8px; color: #ccc;">{{ potion.description }}</p>
          <button type="button" :disabled="disabled" :style="buttonStyle('#28a745')" @click="$emit('use-potion', potion.id)">Usar Poción</button>
        </div>
      </div>
    </div>

    <div v-if="hero.heroClass === 'MAGO'" style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #555;">
      <small style="display: block; margin-bottom: 8px;">✨ Grimorio del Mago (Maná: {{ hero.mana }}/{{ hero.maxMana }}):</small>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button
          v-for="spell in spells"
          :key="spell.id"
          type="button"
          :disabled="disabled || hero.mana < spellCost(hero, spell.id)"
          :style="buttonStyle(spell.color)"
          @click="$emit('cast-spell', spell.id)"
        >
          {{ spell.label }} ({{ spellCost(hero, spell.id) }} MP)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// INTERFAZ DE COMBATE POR TURNOS CON GRUPOS, ESTADOS E INVENTARIO
// =============================================================================
import { computed } from 'vue';
import type { Enemy, Hero, SpellId } from '../../types/game';
import { calculateHeroPhysicalDamage, heroStatuses, spellCost } from '../../utils/combatLogic';
import EnemyCard from './EnemyCard.vue';

const props = defineProps<{ hero: Hero; enemies: Enemy[]; targetIndex: number; disabled: boolean }>();
defineEmits<{ attack: []; 'select-target': [index: number]; 'use-potion': [potionId: string]; 'cast-spell': [spell: SpellId] }>();

const spells: Array<{ id: SpellId; label: string; color: string }> = [
  { id: 'BOLA_FUEGO', label: '🔥 Bola de Fuego', color: '#007bff' },
  { id: 'RAYO', label: '⚡ Rayo', color: '#6610f2' },
  { id: 'ESCUDO', label: '🛡️ Escudo 2 Golpes', color: '#17a2b8' },
  { id: 'EVASION', label: '💨 Evasión 3 turnos', color: '#20c997' },
  { id: 'FUERZA', label: '💪 Fuerza 5 turnos', color: '#e83e8c' },
  { id: 'ESCAPE', label: '🌀 Escape Arcano', color: '#fd7e14' },
];

const statuses = computed(() => heroStatuses(props.hero));
const damageBoostPercent = computed(() => props.hero.battleBuffs.damageBoostPercent);
const evasionBonus = computed(() => props.hero.battleBuffs.evasionBonus);
const defenseBonus = computed(() => props.hero.battleBuffs.defenseBonus);
const blockCharges = computed(() => props.hero.battleBuffs.blockCharges);
const physicalDamage = computed(() => calculateHeroPhysicalDamage(props.hero));
const statusText = computed(() => [
  statuses.value.stunTurns > 0 ? 'Aturdido' : '',
  statuses.value.evasionTurns > 0 ? `Evasión ${statuses.value.evasionTurns}t` : '',
  statuses.value.strengthTurns > 0 ? `Fuerza ${statuses.value.strengthTurns}t` : '',
  statuses.value.burnTurns > 0 ? `Quemadura ${statuses.value.burnTurns}t` : '',
  statuses.value.acidTurns > 0 ? `Ácido ${statuses.value.acidTurns}t` : '',
].filter(Boolean).join(' | '));
const hasEffects = computed(() => Boolean(statusText.value) || damageBoostPercent.value > 0 || evasionBonus.value > 0 || defenseBonus.value > 0 || blockCharges.value > 0);

function buttonStyle(background: string) {
  return { padding: '8px 12px', background, color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' };
}
</script>
