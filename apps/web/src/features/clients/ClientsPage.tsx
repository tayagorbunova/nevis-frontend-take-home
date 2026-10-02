import type { Period } from "@nevis/contract";
import type { Dispatch, SetStateAction } from "react";

import { Spinner } from "@ui";

import type { DemoSettings } from "../demo/demoSettings";

import { useClientCounts } from "./api/useClientCounts";
import styles from "./ClientsPage.module.css";
import { ClientsChartAndTable } from "./components/ClientsChartAndTable";
import { ClientsPlaceholder } from "./components/ClientsPlaceholder";
import { ErrorCard } from "./components/ErrorCard";
import { PeriodSelect } from "./components/PeriodSelect";

type ClientsPageProps = {
  period: Period;
  onPeriodChange: (period: Period) => void;
  openedRowIds: string[] | null;
  onOpenedRowIdsChange: Dispatch<SetStateAction<string[] | null>>;
  demoSettings: DemoSettings;
};

export function ClientsPage({
  period,
  onPeriodChange,
  openedRowIds,
  onOpenedRowIdsChange,
  demoSettings,
}: ClientsPageProps) {
  const { clientCounts, isFetching, hasLastRequestFailed, refetch } = useClientCounts(
    period,
    demoSettings,
  );

  const isRefreshing = !hasLastRequestFailed && clientCounts !== undefined && isFetching;

  function renderContent() {
    if (hasLastRequestFailed) {
      return <ErrorCard isRetrying={isFetching} onRetry={() => void refetch()} />;
    }

    if (clientCounts === undefined) return <ClientsPlaceholder />;

    return (
      <div className={isRefreshing ? styles.refreshingCards : styles.cards}>
        <ClientsChartAndTable
          clientCounts={clientCounts}
          openedRowIds={openedRowIds}
          onOpenedRowIdsChange={onOpenedRowIdsChange}
        />
      </div>
    );
  }

  return (
    <div className={styles.clients}>
      <title>Clients · Nevis home task</title>

      <div className={styles.titleRow}>
        <h1>Clients</h1>

        <div className={styles.controls}>
          <PeriodSelect value={period} onChange={onPeriodChange} />
          {isRefreshing && <Spinner label="Loading" />}
        </div>
      </div>

      {renderContent()}
    </div>
  );
}
