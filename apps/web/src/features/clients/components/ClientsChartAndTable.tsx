import type { ClientCountsResponse } from "@nevis/contract";
import { memo, type Dispatch, type SetStateAction } from "react";

import { closeRow, openRow, pickRowForChart } from "../helpers/openedRows";
import { toClientTree } from "../helpers/toClientTree";

import { ClientsChart } from "./ClientsChart";
import { ClientsTable } from "./ClientsTable";

type ClientsChartAndTableProps = {
  clientCounts: ClientCountsResponse;
  openedRowIds: string[] | null;
  onOpenedRowIdsChange: Dispatch<SetStateAction<string[] | null>>;
};

export const ClientsChartAndTable = memo(function ClientsChartAndTable({
  clientCounts,
  openedRowIds,
  onOpenedRowIdsChange,
}: ClientsChartAndTableProps) {
  const tree = toClientTree(clientCounts.company);
  const openedIds = openedRowIds ?? [tree.id];

  function handleRowOpenChange(id: string, isOpen: boolean) {
    onOpenedRowIdsChange((current) => {
      const currentIds = current ?? [tree.id];

      return isOpen ? openRow(currentIds, id) : closeRow(currentIds, id);
    });
  }

  return (
    <>
      <ClientsChart rowForChart={pickRowForChart(tree, openedIds)} months={clientCounts.months} />

      <ClientsTable
        tree={tree}
        months={clientCounts.months}
        openedRowIds={openedIds}
        onRowOpenChange={handleRowOpenChange}
      />
    </>
  );
});
