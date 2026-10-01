import { Hono } from 'hono';

export function createApp({ demoMode }: { demoMode: boolean }) {
  const app = new Hono();

  app.get('/api/client-counts', (c) => c.json({ demoMode }));

  return app;
}
