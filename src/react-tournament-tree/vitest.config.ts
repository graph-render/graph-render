import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Provides a minimal jsPDF stub so dynamic import('jspdf') resolves in tests.
      // jspdf is an optional peer dependency; real integration tests should install it.
      jspdf: path.resolve(__dirname, 'src/__mocks__/jspdf.ts'),
    },
  },
  benchmark: {
    include: ['src/**/*.bench.ts'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/index.ts',
        'src/**/types.ts',
        'src/**/index.tsx',
        '**/*.{test,spec}.{ts,tsx}',
        '**/__tests__/**',
      ],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 70,
        statements: 75,
      },
    },
  },
});
