import { createApp } from "@nevis/api";
import { http } from "msw";
import { setupServer } from "msw/node";

const API_REQUESTS = "*/api/*";

const app = createApp();

export const server = setupServer(http.all(API_REQUESTS, ({ request }) => app.fetch(request)));

export function failNextRequest() {
  server.use(http.all(API_REQUESTS, () => new Response(null, { status: 500 }), { once: true }));
}
