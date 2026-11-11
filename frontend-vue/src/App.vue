<template>
  <router-view />
</template>

<script setup lang="ts">
// Componente raíz de renderizado dinámico de rutas
</script>
EOF

# Escribir main.ts
cat << 'EOF' > frontend-vue/src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');