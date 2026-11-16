import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration de Vite para React y soporte de SPA fallback
const apiTarget = process.env.VITE_API_TARGET || 'http://localhost:3000';
const proxy = { '/api': { target: apiTarget, changeOrigin: true } };

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true, proxy },
  preview: { port: 5173, host: true, proxy },
});