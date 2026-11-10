import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['modules/*/src/**/*.test.ts', 'modules/*/desktop/**/*.test.mjs'],
    environment: 'node',
  },
});
