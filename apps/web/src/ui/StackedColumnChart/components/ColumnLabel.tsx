import { createPortal } from "react-dom";

import type { ChartSeries, ChartTotal } from "../chartTypes";

import styles from "./ColumnLabel.module.css";
import { Swatch } from "./Swatch";

type ColumnLabelProps = {
  active?: boolean;
  activeIndex?: string | null;
  statusRegion: HTMLElement | null;
  columnNames: readonly string[];
  series: readonly ChartSeries[];
  total?: ChartTotal;
  formatValue: (value: number | undefined) => string;
};

export function ColumnLabel({
  active,
  activeIndex,
  statusRegion,
  columnNames,
  series,
  total,
  formatValue,
}: ColumnLabelProps) {
  if (!active) return null;

  const columnIndex = Number(activeIndex);

  const rows = (
    <>
      <div className={styles.columnName}>{columnNames[columnIndex]}</div>

      {total && (
        <div className={styles.row}>
          {total.name}
          <span className={styles.value}>{formatValue(total.values[columnIndex])}</span>
        </div>
      )}

      {series.map(({ id, name, color, values }) => (
        <div key={id} className={styles.row}>
          <Swatch color={color} />
          <span className={styles.seriesName}>{name}</span>
          <span className={styles.value}>{formatValue(values[columnIndex])}</span>
        </div>
      ))}
    </>
  );

  return (
    <>
      <div className={styles.label} aria-hidden="true">
        {rows}
      </div>

      {statusRegion && createPortal(rows, statusRegion)}
    </>
  );
}
