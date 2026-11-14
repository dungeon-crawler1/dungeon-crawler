<template>
  <div style="margin-top: 20px; text-align: center;">
    <h3>🚪 Elige tu Siguiente Camino ({{ doors.length }} puertas disponibles)</h3>
    <div style="display: flex; justify-content: center; gap: 18px; margin-top: 15px; flex-wrap: wrap;">
      <div
        v-for="door in doors"
        :key="door.id"
        style="border: 2px dashed #ffc107; padding: 16px; border-radius: 8px; width: 220px; background: #332b12; color: #fff;"
      >
        <div style="font-size: 2em; margin-bottom: 6px;">{{ door.icon }}</div>
        <h4>{{ door.title }}</h4>
        <p style="font-size: 0.85em; min-height: 42px;">{{ door.description }}</p>
        <button
          type="button"
          :disabled="disabled"
          style="padding: 8px 14px; background: #ffc107; color: #000; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;"
          @click="$emit('choose', door)"
        >
          Cruzar Puerta
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// SELECTOR PROCEDURAL DE 2 A 3 PUERTAS
// =============================================================================
import type { Door } from '../../types/game';

defineProps<{ doors: Door[]; disabled: boolean }>();
defineEmits<{ choose: [door: Door] }>();
</script>
