<template>
  <div style="max-width: 400px; margin: 50px auto; padding: 25px; border: 1px solid #ccc; border-radius: 8px;">
    <h2>Roguelike (Vue) - Iniciar Sesión</h2>
    <div v-if="error" style="color: red; margin-bottom: 12px;">{{ error }}</div>
    <form @submit.prevent="handleSubmit">
      <div style="margin-bottom: 15px;">
        <label for="vue-login-email">Correo Electrónico:</label>
        <input
          id="vue-login-email"
          type="email"
          v-model="email"
          required
          style="width: 100%; padding: 8px; margin-top: 5px;"
        />
      </div>
      <div style="margin-bottom: 15px;">
        <label for="vue-login-password">Contraseña:</label>
        <input
          id="vue-login-password"
          type="password"
          v-model="password"
          required
          style="width: 100%; padding: 8px; margin-top: 5px;"
        />
      </div>
      <button
        type="submit"
        :disabled="isSubmitting"
        style="width: 100%; padding: 10px; background: #007bff; color: #fff; border: none; border-radius: 4px;"
      >
        {{ isSubmitting ? 'Iniciando sesión...' : 'Ingresar' }}
      </button>
    </form>
    <p style="margin-top: 15px;">
      ¿No tienes cuenta? <router-link to="/register">Regístrate aquí</router-link>
    </p>
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