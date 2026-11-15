<template>
  <div style="margin-top: 20px; padding: 14px; background: #141414; border: 1px solid #333; color: #ddd; border-radius: 6px; font-size: 0.88em; max-height: 180px; overflow-y: auto;">
    <strong>📜 Bitácora de la Mazmorra (Eventos y Estadísticas):</strong>
    <ul style="margin: 8px 0 0 18px; line-height: 1.5;">
      <li v-for="(entry, idx) in logs" :key="idx" :style="{ color: idx === 0 ? '#ffd166' : '#bbb' }">{{ entry }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// BITÁCORA DETALLADA DE EVENTOS
// =============================================================================
defineProps<{ logs: string[] }>();
</script>
