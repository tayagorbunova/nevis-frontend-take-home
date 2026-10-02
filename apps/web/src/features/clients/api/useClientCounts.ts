import type { Period } from "@nevis/contract";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { DemoSettings } from "../../demo/demoSettings";

import { fetchClientCounts } from "./fetchClientCounts";

export function useClientCounts(period: Period, demoSettings: DemoSettings) {
  return useQuery({
    queryKey: ["client-counts", period, demoSettings],
    queryFn: ({ signal }) => fetchClientCounts({ period, demo: demoSettings, signal }),
    placeholderData: keepPreviousData,
  });
}
