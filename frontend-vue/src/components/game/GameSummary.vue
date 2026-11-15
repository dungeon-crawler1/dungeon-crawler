<template>
  <div style="max-width: 600px; margin: 40px auto; padding: 24px; background: #1c1c1c; color: #fff; border-radius: 8px; text-align: center;">
    <h2>{{ reason === 'DERROTA' ? '💀 Has Caído en la Mazmorra' : '🏳️ Partida Finalizada por Retiro' }}</h2>
    <p style="font-size: 1.3em; margin: 15px 0;">🏆 Puntuación Final: <strong>{{ score }}</strong> habitaciones superadas</p>
    <p>🪙 Monedas acumuladas: {{ gold }}</p>
    <div style="display: flex; justify-content: center; gap: 12px; margin-top: 18px;">
      <button
        type="button"
        style="padding: 10px 18px; background: #28a745; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;"
        @click="$emit('restart')"
      >
        🔄 Jugar Nueva Partida
      </button>
      <button
        type="button"
        style="padding: 10px 18px; background: #007bff; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;"
        @click="$emit('go-home')"
      >
        🏠 Volver a la Pantalla de Inicio
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// PANTALLA DE FIN DE PARTIDA
// =============================================================================
defineProps<{ reason: 'VICTORIA_RETIRO' | 'DERROTA' | null; score: number; gold: number }>();
defineEmits<{ restart: []; 'go-home': [] }>();
</script>
