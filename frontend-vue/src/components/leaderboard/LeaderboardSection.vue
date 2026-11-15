<template>
  <section style="margin-top: 30px;">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
      <h2 style="margin: 0;">🏆 Tabla de Posiciones</h2>
      <div style="display: flex; gap: 8px;">
        <button :style="tabStyle(tab === 'global')" @click="tab = 'global'">🌍 Top Global</button>
        <button :style="tabStyle(tab === 'user')" @click="tab = 'user'">👤 Mis Partidas</button>
        <button :style="tabStyle(false)" @click="load">🔄 Actualizar</button>
      </div>
    </div>
    <p style="color: #aaa; font-size: 0.85em;">
      Tocá una partida para ver su línea de tiempo, enemigos, monedas, daño y jefes derrotados.
    </p>
    <LeaderboardTable
      :title="tab === 'global' ? 'Top 10 Global' : 'Mis Mejores 10 Partidas'"
      :entries="entries"
      :loading="loading"
      :error="error"
      @select="selectedRun = $event"
    />
    <TimelineModal v-if="selectedRun !== null" :run-id="selectedRun" @close="selectedRun = null" />
  </section>
</template>

<script setup lang="ts">
// =============================================================================
// SECCIÓN DE LEADERBOARD GLOBAL/PERSONAL + MODAL
// =============================================================================
import { computed, onMounted, ref } from 'vue';
import { fetchGlobalLeaderboard, fetchUserLeaderboard } from '../../services/leaderboardService';
import type { LeaderboardEntry } from '../../types/leaderboard';
import LeaderboardTable from './LeaderboardTable.vue';
import TimelineModal from './TimelineModal.vue';

type Tab = 'global' | 'user';

const tab = ref<Tab>('global');
const globalEntries = ref<LeaderboardEntry[]>([]);
const userEntries = ref<LeaderboardEntry[]>([]);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const selectedRun = ref<number | null>(null);
const entries = computed(() => (tab.value === 'global' ? globalEntries.value : userEntries.value));

async function load(): Promise<void> {
  loading.value = true;
  error.value = null;
  try {
    const [globalResult, userResult] = await Promise.allSettled([fetchGlobalLeaderboard(), fetchUserLeaderboard()]);
    if (globalResult.status === 'fulfilled') globalEntries.value = globalResult.value.data ?? [];
    else error.value = globalResult.reason instanceof Error ? globalResult.reason.message : 'No se pudo cargar el top global';
    if (userResult.status === 'fulfilled') userEntries.value = userResult.value.data ?? [];
    else error.value = userResult.reason instanceof Error ? userResult.reason.message : 'No se pudo cargar tu historial';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => { await load(); });

function tabStyle(active: boolean) {
  return {
    padding: '8px 14px',
    background: active ? '#ffd166' : '#343a40',
    color: active ? '#111' : '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  };
}
</script>
