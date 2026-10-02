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

  const lines = (
    <>
      <div className={styles.columnName}>{columnNames[columnIndex]}</div>

      {total && (
        <div className={styles.line}>
          {total.name}
          <span className={styles.value}>{formatValue(total.values[columnIndex])}</span>
        </div>
      )}

      {series.map(({ id, name, color, values }) => (
        <div key={id} className={styles.line}>
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
        {lines}
      </div>

      {statusRegion && createPortal(lines, statusRegion)}
    </>
  );
}
