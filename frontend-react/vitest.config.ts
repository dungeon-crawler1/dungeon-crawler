import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Configuración de pruebas unitarias y de integración con cobertura V8.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      reportsDirectory: 'coverage',
      exclude: [
        '**/*.test.*',
        '**/*.spec.*',
        'src/vite-env.d.ts',
        'src/main.tsx',
        'src/test/**',
        'vitest.config.ts',
      ],
    },
  },
});
