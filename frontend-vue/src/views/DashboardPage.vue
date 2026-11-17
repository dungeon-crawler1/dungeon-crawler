<template>
  <div class="dungeon-dashboard">
    <header class="dungeon-header">
      <h1>⚔ Panel del Aventurero (Vue)</h1>
      <div class="dungeon-actions">
        <button class="dungeon-button" @click="handleLogout">Cerrar Sesión</button>
      </div>
    </header>
    <main>
      <div class="dungeon-panel" style="padding: 24px; text-align: center;">
        <h2 style="margin-top: 0;">Bienvenido al Calabozo</h2>
        <p>Usuario autenticado: <strong>{{ userEmail }}</strong></p>
        <p style="font-size: 0.9em; color: #c9b994;">
          Elegí tu clase, cruzá las puertas y sobreviví a los combates por turnos.
        </p>
        <button class="enter-game dungeon-button primary" style="margin-top: 8px; font-size: 1.05rem;" @click="goToGame">
          Entrar a la Mazmorra
        </button>
      </div>

      <LeaderboardSection />
    </main>
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// VISTA PRINCIPAL PROTEGIDA (DASHBOARD EN VUE 3)
// =============================================================================
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import LeaderboardSection from '../components/leaderboard/LeaderboardSection.vue';

const router = useRouter();
const authStore = useAuthStore();

const userEmail = computed(() => authStore.user?.email || 'Jugador');

function handleLogout(): void {
  authStore.logout();
  router.push('/login');
}

function goToGame(): void {
  router.push('/game');
}
</script>