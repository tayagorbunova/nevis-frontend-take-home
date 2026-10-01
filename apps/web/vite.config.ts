import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  css: {
    transformer: 'lightningcss',
  },
  server: {
    proxy: { '/api': 'http://localhost:3210' },
  },
});
