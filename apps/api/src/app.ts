import {
  DEFAULT_PERIOD,
  DEMO_HEADER,
  PERIODS,
  periodSchema,
  type ApiErrorBody,
} from "@nevis/contract";
import { Hono } from "hono";
import clientCounts from "./data/client-counts.json";
import { FIRST_MONTH } from "./data/firstMonth";
import { selectPeriod } from "./selectPeriod";

const DEMO_DELAY_MS = 2000;

export function createApp() {
  const app = new Hono();

  app.use(async (c, next) => {
    await next();
    c.header("Cache-Control", "no-store");
  });

  app.get("/api/client-counts", async (c) => {
    // Demo only: the page's "Slow responses" and "Fail requests" switches send this header,
    // so reviewers can see the loading and error states.
    const demo = c.req.header(DEMO_HEADER) ?? "";

    if (demo.includes("slow")) {
      await new Promise((resolve) => setTimeout(resolve, DEMO_DELAY_MS));
    }

    if (demo.includes("fail")) {
      return c.json(
        {
          error: { code: "internal_error", message: "Simulated failure (demo)" },
        } satisfies ApiErrorBody,
        500,
      );
    }

    const requestedPeriod = c.req.query("period") ?? DEFAULT_PERIOD;
    const parsedPeriod = periodSchema.safeParse(requestedPeriod);

    if (!parsedPeriod.success) {
      return c.json(
        {
          error: {
            code: "invalid_period",
            message: `Unknown period "${requestedPeriod}". Use one of: ${PERIODS.join(", ")}.`,
          },
        } satisfies ApiErrorBody,
        400,
      );
    }

    return c.json(selectPeriod(clientCounts, FIRST_MONTH, parsedPeriod.data));
  });

  app.onError((error, c) => {
    console.error(error);
    return c.json(
      {
        error: { code: "internal_error", message: "Internal server error" },
      } satisfies ApiErrorBody,
      500,
    );
  });

  return app;
}
