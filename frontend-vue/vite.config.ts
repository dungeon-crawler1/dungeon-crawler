import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

const apiTarget = process.env.VITE_API_TARGET || 'http://localhost:3000';
const proxy = { '/api': { target: apiTarget, changeOrigin: true } };

export default defineConfig({
  plugins: [vue()],
  server: { port: 5174, host: true, proxy },
  preview: { port: 5174, host: true, proxy },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      reportsDirectory: 'coverage',
      exclude: [
        '**/*.test.*',
        '**/*.spec.*',
        'src/vite-end.d.ts',
        'src/main.ts',
        'src/test/**',
        'src/types/**',
      ],
    },
  },
});
