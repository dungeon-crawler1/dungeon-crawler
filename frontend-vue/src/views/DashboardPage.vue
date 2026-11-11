<template>
  <div style="max-width: 800px; margin: 40px auto; padding: 20px;">
    <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ddd; padding-bottom: 10px;">
      <h1>Panel Principal - Roguelike Game (Vue)</h1>
      <button @click="handleLogout" style="padding: 8px 16px; background: #dc3545; color: #fff; border: none; border-radius: 4px; cursor: pointer;">
        Cerrar Sesión
      </button>
    </header>
    <main style="margin-top: 20px;">
      <h2>Bienvenido al Calabozo</h2>
      <p>Usuario autenticado: <strong>{{ userEmail }}</strong></p>
      <div style="padding: 15px; background: #e9ecef; border-radius: 6px; margin-top: 20px;">
        <h3>Estado del Frontend Vue 3 (Issue 10)</h3>
        <ul>
          <li>Autenticación con JWT + Pinia Store: Configurada y persistida</li>
          <li>Enrutamiento Protegido: Activo en /dashboard vía Vue Router Guard</li>
          <li>Separación de Capas: Peticiones HTTP aisladas en /services</li>
        </ul>
      </div>
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

const router = useRouter();
const authStore = useAuthStore();

const userEmail = computed(() => authStore.user?.email || 'Jugador');

function handleLogout(): void {
  authStore.logout();
  router.push('/login');
}
</script>