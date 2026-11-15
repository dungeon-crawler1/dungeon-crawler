<template>
  <section style="flex: 1 1 380px; background: #1c1c1c; color: #fff; border-radius: 8px; padding: 16px;">
    <h3 style="margin-top: 0;">{{ title }}</h3>
    <p v-if="loading">Cargando puntuaciones...</p>
    <p v-if="error" style="color: #ff8a8a;">{{ error }}</p>
    <table style="width: 100%; border-collapse: collapse; font-size: 0.88em;">
      <thead>
        <tr style="color: #ffd166; text-align: left;">
          <th>#</th><th>Jugador</th><th>Clase</th><th>Puntos</th><th>Resultado</th><th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!loading && !error && entries.length === 0">
          <td colspan="6" style="padding: 10px 0; color: #aaa;">Todavía no hay partidas registradas.</td>
        </tr>
        <tr
          v-for="(entry, index) in entries"
          :key="entry.id"
          style="cursor: pointer; border-top: 1px solid #333;"
          :style="{ background: index === 0 ? '#2b2312' : 'transparent' }"
          @click="$emit('select', entry.id)"
        >
          <td>{{ index + 1 }}</td>
          <td>{{ entry.usuario ?? 'Yo' }}</td>
          <td>{{ entry.clase }}</td>
          <td><strong>{{ entry.puntuacion }}</strong></td>
          <td>{{ entry.resultado }}</td>
          <td>{{ formatDate(entry.created_at) }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup lang="ts">
// =============================================================================
// TABLA REUTILIZABLE DEL TOP 10
// =============================================================================
import type { LeaderboardEntry } from '../../types/leaderboard';

defineProps<{ title: string; entries: LeaderboardEntry[]; loading: boolean; error: string | null }>();
defineEmits<{ select: [runId: number] }>();

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return value;
  }
}
</script>
