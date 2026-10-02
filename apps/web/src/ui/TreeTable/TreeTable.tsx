import type { CSSProperties, ReactNode } from "react";
import {
  Cell,
  Collection,
  Column,
  Row as AriaRow,
  Table,
  TableBody,
  TableHeader,
  VisuallyHidden,
  type Key,
} from "react-aria-components";

import styles from "./TreeTable.module.css";

function Chevron() {
  return (
    <svg className={styles.chevron} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6.5 4.5L10 8L6.5 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

export type TreeTableColumn<Row> = {
  id: string;
  header: string;
  hideHeader?: boolean;
  isRowHeader?: boolean;
  align?: "start" | "end";
  cell: (row: Row) => ReactNode;
};

type TreeTableProps<Row> = {
  label: string;
  rows: readonly Row[];
  getRowId: (row: Row) => string;
  getChildren: (row: Row) => readonly Row[];
  openRowIds: ReadonlySet<string>;
  onRowOpenChange: (id: string, isOpen: boolean) => void;
  columns: readonly TreeTableColumn<Row>[];
};

export function TreeTable<Row>({
  label,
  rows,
  getRowId,
  getChildren,
  openRowIds,
  onRowOpenChange,
  columns,
}: TreeTableProps<Row>) {
  const dependencies = [columns, openRowIds];

  function handleExpandedChange(expandedKeys: Set<Key>) {
    for (const id of openRowIds) {
      if (!expandedKeys.has(id)) onRowOpenChange(id, false);
    }

    for (const key of expandedKeys) {
      if (typeof key === "string" && !openRowIds.has(key)) onRowOpenChange(key, true);
    }
  }

  function renderRow(row: Row) {
    const id = getRowId(row);
    const childRows = getChildren(row);
    const canOpen = childRows.length > 0;

    return (
      <AriaRow
        id={id}
        className={styles.row}
        onAction={canOpen ? () => onRowOpenChange(id, !openRowIds.has(id)) : undefined}
      >
        {columns.map((column, index) => (
          <Cell key={column.id} className={styles.cell} style={{ textAlign: column.align }}>
            {index === 0 ? (
              <div className={styles.name}>
                {canOpen ? <Chevron /> : <span className={styles.chevronSpace} />}
                {column.cell(row)}
              </div>
            ) : (
              column.cell(row)
            )}
          </Cell>
        ))}

        <Collection items={childRows} dependencies={dependencies}>
          {renderRow}
        </Collection>
      </AriaRow>
    );
  }

  return (
    <div className={styles.scroller}>
      <Table
        aria-label={label}
        className={styles.table}
        style={{ "--column-count": columns.length } as CSSProperties}
        treeColumn={columns[0]?.id}
        expandedKeys={openRowIds}
        onExpandedChange={handleExpandedChange}
      >
        <TableHeader>
          {columns.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              className={styles.column}
              style={{ textAlign: column.align }}
              isRowHeader={column.isRowHeader}
            >
              {column.hideHeader ? (
                <VisuallyHidden>{column.header}</VisuallyHidden>
              ) : (
                <span className={styles.columnLabel}>
                  <span>{column.header}</span>
                </span>
              )}
            </Column>
          ))}
        </TableHeader>

        <TableBody items={rows} dependencies={dependencies}>
          {renderRow}
        </TableBody>
      </Table>
    </div>
  );
}
