<template>
  <div style="max-width: 400px; margin: 50px auto; padding: 25px; border: 1px solid #ccc; border-radius: 8px;">
    <h2>Roguelike (Vue) - Crear Cuenta</h2>
    <div v-if="error" style="color: red; margin-bottom: 12px;">{{ error }}</div>
    <div v-if="success" style="color: green; margin-bottom: 12px;">Registro completado con éxito. Redirigiendo...</div>
    <form @submit.prevent="handleSubmit">
      <div style="margin-bottom: 15px;">
        <label for="vue-reg-email">Correo Electrónico:</label>
        <input
          id="vue-reg-email"
          type="email"
          v-model="email"
          required
          style="width: 100%; padding: 8px; margin-top: 5px;"
        />
      </div>
      <div style="margin-bottom: 15px;">
        <label for="vue-reg-password">Contraseña:</label>
        <input
          id="vue-reg-password"
          type="password"
          v-model="password"
          required
          style="width: 100%; padding: 8px; margin-top: 5px;"
        />
      </div>
      <button
        type="submit"
        :disabled="isSubmitting"
        style="width: 100%; padding: 10px; background: #28a745; color: #fff; border: none; border-radius: 4px;"
      >
        {{ isSubmitting ? 'Creando cuenta...' : 'Registrar' }}
      </button>
    </form>
    <p style="margin-top: 15px;">
      ¿Ya posees una cuenta? <router-link to="/login">Inicia sesión</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
// =============================================================================
// VISTA DE REGISTRO EN VUE 3
// =============================================================================
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { registerUser } from '../services/authService';

const email = ref<string>('');
const password = ref<string>('');
const error = ref<string | null>(null);
const success = ref<boolean>(false);
const isSubmitting = ref<boolean>(false);

const router = useRouter();

async function handleSubmit(): Promise<void> {
  error.value = null;
  isSubmitting.value = true;

  try {
    await registerUser({ email: email.value, password: password.value });
    success.value = true;
    setTimeout(() => router.push('/login'), 1500);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al registrar cuenta';
  } finally {
    isSubmitting.value = false;
  }
}
</script>