import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { defineConfig as defineVitestConfig } from 'vitest/config';

export default defineConfig(({ mode, command }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.NEO4J_URI': JSON.stringify(env.NEO4J_URI),
        'process.env.NEO4J_USER': JSON.stringify(env.NEO4J_USER),
        'process.env.NEO4J_PASSWORD': JSON.stringify(env.NEO4J_PASSWORD)
      },
      test: defineVitestConfig({
        test: {
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./tests/setup.ts'],
          include: ['./tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
          coverage: {
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
            exclude: ['node_modules', 'dist', '.kiro']
          }
        }
      }).test,
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
