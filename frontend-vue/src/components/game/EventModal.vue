<template>
  <div style="border: 2px solid #17a2b8; padding: 20px; border-radius: 8px; background: #15282e; color: #fff; margin-top: 15px; text-align: center;">
    <h3>✨ Evento Misterioso: {{ event.title }}</h3>
    <p>{{ event.description }}</p>
    <div style="display: flex; justify-content: center; gap: 15px; margin-top: 15px;">
      <button
        type="button"
        style="padding: 8px 16px; background: #17a2b8; color: #fff; border: none; border-radius: 4px; cursor: pointer;"
        @click="$emit('resolve', 'ACCEPT')"
      >
        Interactuar
      </button>
      <button
        type="button"
        style="padding: 8px 16px; background: #6c757d; color: #fff; border: none; border-radius: 4px; cursor: pointer;"
        @click="$emit('resolve', 'IGNORE')"
      >
        Ignorar y Seguir
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// MODAL DE EVENTOS ESPECIALES
// =============================================================================
import type { GameEvent } from '../../types/game';

defineProps<{ event: GameEvent }>();
defineEmits<{ resolve: [option: string] }>();
</script>
