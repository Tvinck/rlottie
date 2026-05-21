import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Vite configuration for BAZZAR frontend.
 *
 * Multi-page app: каждый HTML-файл — отдельная точка входа.
 * В dev-режиме прокси /api/* → backend Fastify (порт 3000).
 */
export default defineConfig({
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
      input: {
        index:      resolve(__dirname, 'index.html'),
        home:       resolve(__dirname, 'home.html'),
        project:    resolve(__dirname, 'project.html'),
        'ai-tools': resolve(__dirname, 'ai-tools.html'),
        messages:   resolve(__dirname, 'messages.html'),
        employees:  resolve(__dirname, 'employees.html'),
        tasks:      resolve(__dirname, 'tasks.html'),
        salaries:   resolve(__dirname, 'salaries.html'),
        invoices:   resolve(__dirname, 'invoices.html'),
        analytics:  resolve(__dirname, 'analytics.html'),
        settings:   resolve(__dirname, 'settings.html'),
      },
    },
  },

  server: {
    port: 5173,
    proxy: {
      // Все /api/* запросы идут на backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // WebSocket для чата
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    },
  },
});
