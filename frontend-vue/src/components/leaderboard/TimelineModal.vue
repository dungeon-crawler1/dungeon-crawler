<template>
  <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;">
    <div style="background: #1b1b1b; color: #fff; border: 2px solid #ffd166; border-radius: 10px; width: 100%; max-width: 760px; max-height: 85vh; overflow-y: auto; padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0;">📜 Línea de Tiempo — Partida #{{ runId }}</h3>
        <button style="padding: 6px 12px; background: #6c757d; color: #fff; border: none; border-radius: 4px; cursor: pointer;" @click="$emit('close')">Cerrar</button>
      </div>
      <p v-if="loading">Cargando estadísticas...</p>
      <p v-if="error" style="color: #ff8a8a;">{{ error }}</p>
      <template v-if="run">
        <p style="color: #ccc; font-size: 0.9em;">
          Clase: <strong>{{ run.clase }}</strong> | Resultado: <strong>{{ run.resultado }}</strong> | Puntos: <strong>{{ run.puntuacion }}</strong>
        </p>
        <div v-if="stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; margin: 12px 0; font-size: 0.85em;">
          <div>🪙 Monedas finales: <strong>{{ stats.monedas_finales ?? run.monedas_actuales }}</strong></div>
          <div>⚔️ Daño infligido: <strong>{{ stats.dano_infligido ?? 0 }}</strong></div>
          <div>💥 Daño recibido: <strong>{{ stats.dano_recibido ?? 0 }}</strong></div>
          <div>☠️ Enemigos derrotados: <strong>{{ stats.enemigos_derrotados ?? 0 }}</strong></div>
          <div>👑 Jefes derrotados: <strong>{{ stats.jefes_derrotados?.length ?? 0 }}</strong></div>
          <div>🏺 Reliquias: <strong>{{ stats.reliquias?.length ?? 0 }}</strong></div>
        </div>
        <p v-else style="color: #aaa;">Esta partida no tiene estadísticas detalladas guardadas.</p>
        <p v-if="stats?.jefes_derrotados && stats.jefes_derrotados.length > 0" style="font-size: 0.85em;">👑 Jefes: {{ stats.jefes_derrotados.join(', ') }}</p>
        <p v-if="stats?.reliquias && stats.reliquias.length > 0" style="font-size: 0.85em;">🏺 Reliquias: {{ stats.reliquias.join(', ') }}</p>
        <h4 style="margin-bottom: 6px;">Habitaciones superadas ({{ rooms.length }})</h4>
        <p v-if="rooms.length === 0" style="color: #aaa;">No hay habitaciones registradas.</p>
        <ol v-else style="margin: 0; padding-left: 22px; font-size: 0.86em; line-height: 1.6;">
          <li v-for="(room, index) in rooms" :key="`${room.habitacion}-${index}`">
            <strong>Sala #{{ room.habitacion }}</strong> — {{ room.evento }} — {{ room.resultado }}
            <div style="color: #bbb;">{{ room.detalle }}</div>
          </li>
        </ol>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// MODAL DE LÍNEA DE TIEMPO Y ESTADÍSTICAS
// =============================================================================
import { computed, onMounted, ref } from 'vue';
import { fetchRunTimeline } from '../../services/leaderboardService';
import type { RunTimeline } from '../../types/leaderboard';

const props = defineProps<{ runId: number }>();
defineEmits<{ close: [] }>();

const run = ref<RunTimeline | null>(null);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const stats = computed(() => run.value?.estado_run);
const rooms = computed(() => stats.value?.historial_habitaciones ?? []);

onMounted(async () => {
  try {
    const response = await fetchRunTimeline(props.runId);
    run.value = response.data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudo cargar la partida';
  } finally {
    loading.value = false;
  }
});
</script>
