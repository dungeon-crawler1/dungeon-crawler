<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>⚔ Forjar un Nuevo Héroe (Vue)</h2>
      <div v-if="error" class="form-error" style="margin-bottom: 12px;">{{ error }}</div>
      <div v-if="success" class="form-success" style="margin-bottom: 12px;">Registro completado con éxito. Redirigiendo...</div>
      <form @submit.prevent="handleSubmit">
        <div>
          <label for="vue-reg-email">Correo Electrónico</label>
          <input id="vue-reg-email" type="email" class="dungeon-input" v-model="email" required />
        </div>
        <div>
          <label for="vue-reg-password">Contraseña</label>
          <input id="vue-reg-password" type="password" class="dungeon-input" v-model="password" required />
        </div>
        <button type="submit" class="dungeon-button" :disabled="isSubmitting">
          {{ isSubmitting ? 'Creando cuenta...' : 'Registrar' }}
        </button>
      </form>
      <p>¿Ya posees una cuenta? <router-link to="/login">Inicia sesión</router-link></p>
    </div>
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