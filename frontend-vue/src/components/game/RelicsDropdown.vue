<template>
  <div style="position: relative; margin-top: 10px;">
    <button
      type="button"
      :style="{ padding: '6px 12px', background: '#2c3035', color: '#ffd166', border: '1px solid #555', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85em', fontWeight: 'bold' }"
      @click="isOpen = !isOpen"
    >
      🏺 Artefactos Equipados ({{ relics.length }}) {{ isOpen ? '▲' : '▼' }}
    </button>

    <div
      v-if="isOpen"
      style="margin-top: 8px; padding: 10px 12px; background: #16181b; border: 1px solid #555; border-radius: 6px; font-size: 0.84em;"
    >
      <span v-if="relics.length === 0" style="color: #aaa;">
        Aún no posees ningún artefacto o reliquia en esta partida.
      </span>
      <ul v-else style="margin: 0 0 0 16px; padding: 0; line-height: 1.6;">
        <li v-for="relic in relics" :key="relic.id">
          <strong style="color: #ffd166;">{{ relic.name }}</strong> —
          <span style="color: #8ce99a;">{{ relic.effectSummary }}</span>
          <span style="color: #bbb;"> ({{ relic.description }})</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// DESPLEGABLE DE RELIQUIAS EQUIPADAS
// =============================================================================
import { ref } from 'vue';
import type { EquippedRelic } from '../../types/game';

defineProps<{ relics: EquippedRelic[] }>();
const isOpen = ref<boolean>(false);
</script>
