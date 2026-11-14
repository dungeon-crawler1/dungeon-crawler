// Limpieza común entre tests
import { afterEach, vi } from 'vitest';

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
