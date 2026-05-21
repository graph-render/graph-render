import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/index.ts',
        'src/**/types.ts',
        '**/*.{test,spec}.ts',
        '**/__tests__/**',
      ],
      thresholds: {
        lines: 80,
        functions: 85,
        branches: 80,
        statements: 80,
      },
    },
  },
});
