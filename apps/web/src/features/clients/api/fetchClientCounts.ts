import {
  CLIENT_COUNTS_PATH,
  DEMO_FAIL,
  DEMO_HEADER,
  DEMO_SLOW,
  clientCountsResponseSchema,
  type ClientCountsResponse,
  type Period,
} from "@nevis/contract";

import type { DemoSettings } from "../../demo/demoSettings";

export async function fetchClientCounts({
  period,
  demo,
  signal,
}: {
  period: Period;
  demo: DemoSettings;
  signal?: AbortSignal;
}): Promise<ClientCountsResponse> {
  const response = await fetch(`${CLIENT_COUNTS_PATH}?period=${period}`, {
    headers: toDemoHeaders(demo),
    signal,
  });

  if (!response.ok) throw new Error(`The server answered with status ${response.status}`);

  return clientCountsResponseSchema.parse(await response.json());
}

function toDemoHeaders(demo: DemoSettings): Record<string, string> {
  const flags: string[] = [];

  if (demo.slow) flags.push(DEMO_SLOW);
  if (demo.fail) flags.push(DEMO_FAIL);

  return flags.length > 0 ? { [DEMO_HEADER]: flags.join(",") } : {};
}
