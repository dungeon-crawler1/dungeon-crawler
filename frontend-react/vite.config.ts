import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration de Vite para React y soporte de SPA fallback
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});