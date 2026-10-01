import { serve } from '@hono/node-server';
import { createApp } from './app';

const app = createApp();

serve({ fetch: app.fetch, port: 3001 }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});
