import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Vite config для React SPA + Fastify backend.
 *
 * Dev:  vite dev-server (порт 5173) проксирует /api → Fastify (порт 3000)
 * Prod: vite build → dist/client, Fastify отдаёт как static
 */
export default defineConfig({
  plugins: [
    react({
      // Автоматический импорт JSX runtime (React 19)
      jsxRuntime: 'automatic',
    }),
  ],

  root: '.',

  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'shared'),
      '@client': resolve(__dirname, 'src/client'),
    },
  },

  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
    // Code splitting: React, Router, Charts в отдельные чанки
    chunkSizeWarningLimit: 600,
  },

  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/ws':  { target: 'ws://localhost:3000', ws: true },
    },
  },
});
