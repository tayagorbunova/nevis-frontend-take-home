import { Avatar, Card, TreeTable, type TreeTableColumn } from "@ui";

import styles from "./ClientsTable.module.css";
import { formatCount, formatMonth } from "./format";
import type { ClientRow } from "./model/toClientTree";

type RowNameProps = { row: ClientRow };

function RowName({ row }: RowNameProps) {
  return (
    <span className={row.level === "channel" ? styles.channelName : styles.name}>
      {row.level === "advisor" && <Avatar name={row.name} src={row.avatarUrl} />}
      {row.name}
    </span>
  );
}

type ClientsTableProps = {
  tree: ClientRow;
  months: readonly string[];
  openedRowIds: readonly string[];
  onRowOpenChange: (id: string, isOpen: boolean) => void;
};

export function ClientsTable({ tree, months, openedRowIds, onRowOpenChange }: ClientsTableProps) {
  const columns: TreeTableColumn<ClientRow>[] = [
    {
      id: "name",
      header: "Name",
      hideHeader: true,
      isRowHeader: true,
      cell: (row) => <RowName row={row} />,
    },
    ...months.map((month, index): TreeTableColumn<ClientRow> => ({
      id: month,
      header: formatMonth(month),
      align: "end",
      cell: (row) => formatCount(row.values[index]),
    })),
  ];

  return (
    <Card variant="unpadded">
      <TreeTable
        label="Client counts per month"
        rows={[tree]}
        getRowId={(row) => row.id}
        getChildren={(row) => row.children}
        openRowIds={new Set(openedRowIds)}
        onRowOpenChange={onRowOpenChange}
        columns={columns}
      />
    </Card>
  );
}
