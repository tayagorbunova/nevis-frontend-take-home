import { serve } from '@hono/node-server';
import { createApp } from './app';

const app = createApp({ demoMode: true });

serve({ fetch: app.fetch, port: 3210 }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});
