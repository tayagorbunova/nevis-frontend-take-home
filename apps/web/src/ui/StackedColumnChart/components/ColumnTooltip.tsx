import { createPortal } from "react-dom";

import type { ChartSeries, ChartTotal } from "../chartTypes";

import styles from "./ColumnTooltip.module.css";
import { Swatch } from "./Swatch";

type ColumnTooltipProps = {
  active?: boolean;
  activeIndex?: string | null;
  statusRegion: HTMLElement | null;
  columnNames: readonly string[];
  series: readonly ChartSeries[];
  total?: ChartTotal;
  formatValue: (value: number | undefined) => string;
};

export function ColumnTooltip({
  active,
  activeIndex,
  statusRegion,
  columnNames,
  series,
  total,
  formatValue,
}: ColumnTooltipProps) {
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
      <div className={styles.tooltip} aria-hidden="true">
        {rows}
      </div>

      {statusRegion && createPortal(rows, statusRegion)}
    </>
  );
}
