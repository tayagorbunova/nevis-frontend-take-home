import {
  DEMO_HEADER,
  apiErrorBodySchema,
  clientCountsResponseSchema,
  type ApiErrorCode,
  type ClientCountsResponse,
  type Period,
} from "@nevis/contract";

import type { DemoSettings } from "../../demo/demoSettings";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: ApiErrorCode;

  constructor(status: number, code?: ApiErrorCode) {
    super(`The server answered with status ${status}`);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export class InvalidResponseError extends Error {
  constructor() {
    super("The server's answer doesn't match the contract");

    this.name = "InvalidResponseError";
  }
}

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

  const body = await readJson(response);

  if (!response.ok) {
    const parsedError = apiErrorBodySchema.safeParse(body);
    const code = parsedError.success ? parsedError.data.error.code : undefined;

    throw new ApiError(response.status, code);
  }

  const parsedCounts = clientCountsResponseSchema.safeParse(body);

  if (!parsedCounts.success) throw new InvalidResponseError();

  return parsedCounts.data;
}

function toDemoHeaders(demo: DemoSettings): Record<string, string> {
  const flags: string[] = [];

  if (demo.slow) flags.push("slow");
  if (demo.fail) flags.push("fail");

  return flags.length > 0 ? { [DEMO_HEADER]: flags.join(",") } : {};
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}
