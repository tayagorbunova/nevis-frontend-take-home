import type { Period } from "@nevis/contract";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import type { DemoSettings } from "../../demo/demoSettings";

import { fetchClientCounts } from "./fetchClientCounts";

export function useClientCounts(period: Period, demoSettings: DemoSettings) {
  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ["client-counts", period],
    queryFn: ({ signal }) => fetchClientCounts({ period, demo: demoSettings, signal }),
    placeholderData: keepPreviousData,
  });

  const [hasLastRequestFailed, setHasLastRequestFailed] = useState(false);
  const hasFailed = error !== null;

  if (!isFetching && hasLastRequestFailed !== hasFailed) {
    setHasLastRequestFailed(hasFailed);
  }

  return { data, isFetching, hasLastRequestFailed, refetch };
}
