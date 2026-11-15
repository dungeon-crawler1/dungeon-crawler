<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>⚔ Entrada a la Mazmorra (Vue)</h2>
      <div v-if="error" class="form-error" style="margin-bottom: 12px;">{{ error }}</div>
      <form @submit.prevent="handleSubmit">
        <div>
          <label for="vue-login-email">Correo Electrónico</label>
          <input id="vue-login-email" type="email" class="dungeon-input" v-model="email" required />
        </div>
        <div>
          <label for="vue-login-password">Contraseña</label>
          <input id="vue-login-password" type="password" class="dungeon-input" v-model="password" required />
        </div>
        <button type="submit" class="dungeon-button" :disabled="isSubmitting">
          {{ isSubmitting ? 'Iniciando sesión...' : 'Ingresar' }}
        </button>
      </form>
      <p>¿No tienes cuenta? <router-link to="/register">Regístrate aquí</router-link></p>
    </div>
  </div>
</template>
<script setup lang="ts">
// =============================================================================
// VISTA DE LOGIN EN VUE 3 (COMPOSITION API - CERO PETICIONES DIRECTAS)
// =============================================================================
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser } from '../services/authService';
import { useAuthStore } from '../stores/authStore';

const email = ref<string>('');
const password = ref<string>('');
const error = ref<string | null>(null);
const isSubmitting = ref<boolean>(false);

const router = useRouter();
const authStore = useAuthStore();

async function handleSubmit(): Promise<void> {
  error.value = null;
  isSubmitting.value = true;

  try {
    const response = await loginUser({ email: email.value, password: password.value });
    const token = response.data?.token || response.token;
    const user = response.data?.user || { id: 1, email: email.value };

    if (token) {
      authStore.setAuthData(token, user);
      router.push('/dashboard');
    } else {
      error.value = 'El servidor no retornó un token válido.';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al procesar inicio de sesión';
  } finally {
    isSubmitting.value = false;
  }
}
</script>