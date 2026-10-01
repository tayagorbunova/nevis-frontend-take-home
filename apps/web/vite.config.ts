import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  css: {
    // Lightning CSS turns newer CSS syntax into what Vite's default browser targets
    // understand: Chrome and Edge 111+, Firefox 114+, Safari 16.4+ (design §5.8).
    transformer: 'lightningcss',
  },
  server: {
    // Sends API requests to the local API server, whose port is set in
    // apps/api/src/server.ts. `vite preview` reuses this proxy.
    proxy: { '/api': 'http://localhost:3210' },
  },
});
