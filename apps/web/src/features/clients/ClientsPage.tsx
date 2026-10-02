import type { Period } from "@nevis/contract";
import type { Dispatch, SetStateAction } from "react";

import { Spinner } from "@ui";

import type { DemoSettings } from "../demo/demoSettings";

import { useClientCounts } from "./api/useClientCounts";
import styles from "./ClientsPage.module.css";
import { ClientsChart } from "./components/ClientsChart";
import { ClientsPlaceholder } from "./components/ClientsPlaceholder";
import { ClientsTable } from "./components/ClientsTable";
import { ErrorCard } from "./components/ErrorCard";
import { PeriodSelect } from "./components/PeriodSelect";
import { chartSubject, closeRow, openRow } from "./model/openedRows";
import { toClientTree } from "./model/toClientTree";

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
  const { data, isFetching, hasLastRequestFailed, refetch } = useClientCounts(period, demoSettings);

  const isRefreshing = !hasLastRequestFailed && data !== undefined && isFetching;

  function renderContent() {
    if (hasLastRequestFailed) {
      return <ErrorCard isBusy={isFetching} onRetry={() => void refetch()} />;
    }

    if (data === undefined) return <ClientsPlaceholder />;

    const tree = toClientTree(data.company);
    const openedIds = openedRowIds ?? [tree.id];

    function handleRowOpenChange(id: string, isOpen: boolean) {
      onOpenedRowIdsChange((current) => {
        const currentIds = current ?? [tree.id];

        return isOpen ? openRow(currentIds, id) : closeRow(currentIds, id);
      });
    }

    return (
      <div className={isRefreshing ? styles.refreshingCards : styles.cards}>
        <ClientsChart subject={chartSubject(tree, openedIds)} months={data.months} />

        <ClientsTable
          tree={tree}
          months={data.months}
          openedRowIds={openedIds}
          onRowOpenChange={handleRowOpenChange}
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
