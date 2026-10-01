import { Hono } from "hono";

export function createApp() {
  const app = new Hono();

  app.get("/api/client-counts", (c) => c.json({ ok: true }));

  return app;
}
