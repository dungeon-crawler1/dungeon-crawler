<template>
  <div style="text-align: center; margin: 30px auto; max-width: 900px;">
    <h2>Selecciona tu Clase para Entrar a la Mazmorra</h2>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 20px;">
      <div
        v-for="c in classes"
        :key="c.heroClass"
        style="border: 2px solid #444; border-radius: 8px; padding: 14px; background: #1a1a1a; color: #fff;"
      >
        <h3>{{ c.name }}</h3>
        <p>❤️ Vida: {{ c.maxHp }}</p>
        <p>⚔️ Daño: {{ c.attack }}</p>
        <p v-if="c.maxMana > 0">💧 Maná: {{ c.maxMana }}</p>
        <p style="font-size: 0.8em; color: #ccc; min-height: 36px;">{{ classPerks[c.heroClass] }}</p>
        <button
          type="button"
          :disabled="disabled"
          :style="{ marginTop: '10px', padding: '8px 14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }"
          @click="$emit('select', c.heroClass)"
        >
          {{ disabled ? 'Iniciando...' : `Elegir ${c.name}` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// SELECCIÓN DE CLASE DE PERSONAJE (PARIDAD CON REACT)
// =============================================================================
import { CLASS_CONFIG } from '../../services/gameService';
import type { HeroClassId } from '../../types/game';

defineProps<{ disabled: boolean }>();
defineEmits<{ select: [classId: HeroClassId] }>();

const CLASS_PERKS: Record<HeroClassId, string> = {
  CABALLERO: '🛡️ -20% daño recibido y 20% bloqueo',
  BARBARO: '🔥 +40% daño al tener < 50% de vida',
  PICARO: '🪙 +25% monedas y 20% evasión',
  MAGO: '✨ Único con hechizos arcanos de maná',
};

const classes = Object.values(CLASS_CONFIG);
const classPerks = CLASS_PERKS;
</script>
