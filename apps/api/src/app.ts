import { Hono } from 'hono';

export function createApp({ demoMode }: { demoMode: boolean }) {
  const app = new Hono();

  // Stub answer until the real client counts are served.
  app.get('/api/client-counts', (c) => c.json({ demoMode }));

  return app;
}
