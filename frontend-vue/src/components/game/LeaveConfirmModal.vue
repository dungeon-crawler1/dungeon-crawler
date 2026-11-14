<template>
  <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.78); display: flex; align-items: center; justify-content: center; z-index: 1000;">
    <div style="background: #1e1e1e; border: 2px solid #dc3545; border-radius: 8px; padding: 24px; max-width: 460px; color: #fff; text-align: center;">
      <h3>⚠️ Advertencia de Salida</h3>
      <p style="margin: 12px 0 20px; color: #f8d7da; font-size: 0.95em;">
        Si regresas al menú principal ahora, se descartará la partida actual sin registrar tu puntuación.
      </p>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button
          type="button"
          style="padding: 10px 14px; background: #dc3545; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;"
          @click="$emit('confirm')"
        >
          ¿Seguro que quieres volver a la pantalla de inicio? Perderás tu progreso y no será guardado
        </button>
        <button
          type="button"
          style="padding: 8px 14px; background: #6c757d; color: #fff; border: none; border-radius: 5px; cursor: pointer;"
          @click="$emit('cancel')"
        >
          Cancelar y Seguir Jugando
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// CONFIRMACIÓN DE SALIDA SIN GUARDAR
// =============================================================================
defineEmits<{ confirm: []; cancel: [] }>();
</script>
