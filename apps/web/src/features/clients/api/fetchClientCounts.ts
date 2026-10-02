import {
  DEMO_HEADER,
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
  const response = await fetch(`/api/client-counts?period=${period}`, {
    headers: toDemoHeaders(demo),
    signal,
  });

  if (!response.ok) throw new Error(`The server answered with status ${response.status}`);

  return clientCountsResponseSchema.parse(await response.json());
}

function toDemoHeaders(demo: DemoSettings): Record<string, string> {
  const flags: string[] = [];

  if (demo.slow) flags.push("slow");
  if (demo.fail) flags.push("fail");

  return flags.length > 0 ? { [DEMO_HEADER]: flags.join(",") } : {};
}
