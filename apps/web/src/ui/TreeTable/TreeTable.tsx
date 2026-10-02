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

import { Icon } from "../Icon/Icon";

import styles from "./TreeTable.module.css";

export type TreeTableColumn<Row> = {
  id: string;
  header: string;
  hideHeader?: boolean;
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
  emptyMessage?: string;
};

export function TreeTable<Row>({
  label,
  rows,
  getRowId,
  getChildren,
  openRowIds,
  onRowOpenChange,
  columns,
  emptyMessage,
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
                {canOpen ? (
                  <span className={styles.chevron}>
                    <Icon name="chevronRight" />
                  </span>
                ) : (
                  <span className={styles.chevronSpace} />
                )}
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
    <div className={styles.scroller} tabIndex={-1}>
      <Table
        aria-label={label}
        className={styles.table}
        style={{ "--column-count": columns.length } as CSSProperties}
        treeColumn={columns[0]?.id}
        expandedKeys={openRowIds}
        onExpandedChange={handleExpandedChange}
      >
        <TableHeader>
          {columns.map((column, index) => (
            <Column
              key={column.id}
              id={column.id}
              className={styles.column}
              style={{ textAlign: column.align }}
              isRowHeader={index === 0}
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

        <TableBody
          className={styles.body}
          items={rows}
          dependencies={dependencies}
          renderEmptyState={() => <div className={styles.emptyMessage}>{emptyMessage}</div>}
        >
          {renderRow}
        </TableBody>
      </Table>
    </div>
  );
}
