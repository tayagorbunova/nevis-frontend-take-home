import { serve } from '@hono/node-server';
import { createApp } from './app';

// Local runs always have demo mode on (design §2.3).
const app = createApp({ demoMode: true });

// The web app's proxy in apps/web/vite.config.ts points at this port.
serve({ fetch: app.fetch, port: 3210 }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});
