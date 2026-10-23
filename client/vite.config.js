import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration for EcoTrack client.
 * - React plugin for JSX support and Fast Refresh.
 * - Proxy: all /api requests are forwarded to the Express backend on port 5000.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
