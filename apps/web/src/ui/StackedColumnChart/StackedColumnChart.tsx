import { useId, useLayoutEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { VisuallyHidden } from "react-aria-components";
import {
  Bar,
  BarChart,
  BarStack,
  CartesianGrid,
  Tooltip,
  usePlotArea,
  XAxis,
  YAxis,
} from "recharts";

import type { ChartColor } from "./palette";
import styles from "./StackedColumnChart.module.css";

export type ChartSeries = {
  id: string;
  name: string;
  color: ChartColor;
  values: readonly number[];
};

type StackedColumnChartProps = {
  title: string;
  description: string;
  columnNames: readonly string[];
  series: readonly ChartSeries[];
  renderLabel: (columnIndex: number) => ReactNode;
};

const MIN_SPACE_PER_COLUMN_FOR_HORIZONTAL_NAMES = 64;

const HORIZONTAL_COLUMN_NAMES = {
  height: 30,
  tickMargin: 16,
  interval: "preserveStartEnd",
} as const;

const TILTED_COLUMN_NAMES = {
  height: 64,
  tickMargin: 12,
  angle: -60,
  textAnchor: "end",
  fontSize: "0.6875rem",
  interval: 0,
} as const;

function toCssColor(color: ChartColor) {
  return `var(--color-chart-${color})`;
}

type PlotWidthReporterProps = { onChange: (width: number) => void };

function PlotWidthReporter({ onChange }: PlotWidthReporterProps) {
  const width = usePlotArea()?.width;

  useLayoutEffect(() => {
    if (width !== undefined) onChange(width);
  }, [width, onChange]);

  return null;
}

type ColumnLabelProps = {
  active?: boolean;
  activeIndex?: string | null;
  statusRegion: HTMLElement | null;
  renderLabel: (columnIndex: number) => ReactNode;
};

function ColumnLabel({ active, activeIndex, statusRegion, renderLabel }: ColumnLabelProps) {
  if (!active) return null;

  const content = renderLabel(Number(activeIndex));

  return (
    <>
      <div className={styles.label} aria-hidden="true">
        {content}
      </div>

      {statusRegion && createPortal(content, statusRegion)}
    </>
  );
}

export function StackedColumnChart({
  title,
  description,
  columnNames,
  series,
  renderLabel,
}: StackedColumnChartProps) {
  const captionId = useId();

  const [plotWidth, setPlotWidth] = useState(0);
  const [statusRegion, setStatusRegion] = useState<HTMLElement | null>(null);

  const spacePerColumn = plotWidth / columnNames.length;
  const isNarrow = spacePerColumn < MIN_SPACE_PER_COLUMN_FOR_HORIZONTAL_NAMES;

  const columns = columnNames.map((_, columnIndex) =>
    Object.fromEntries(series.map(({ id, values }) => [id, values[columnIndex]])),
  );

  return (
    <figure className={styles.chart}>
      <figcaption id={captionId}>{title}</figcaption>

      <BarChart
        className={styles.plot}
        responsive
        data={columns}
        aria-labelledby={captionId}
        desc={description}
        margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
        barCategoryGap={isNarrow ? 4 : 12}
        maxBarSize={88}
      >
        <PlotWidthReporter onChange={setPlotWidth} />

        <CartesianGrid vertical={false} stroke="var(--color-gridline)" strokeDasharray="1 6" />

        <XAxis
          {...(isNarrow ? TILTED_COLUMN_NAMES : HORIZONTAL_COLUMN_NAMES)}
          axisLine={false}
          tickLine={false}
          tickSize={0}
          tickFormatter={(columnIndex: number) => columnNames[columnIndex] ?? ""}
        />

        <YAxis
          width={38}
          axisLine={false}
          tickLine={false}
          tickSize={0}
          tickMargin={12}
          tickCount={5}
          niceTicks="snap125"
        />

        <Tooltip
          isAnimationActive={false}
          cursor={{ fill: "var(--color-row-hover)" }}
          offset={spacePerColumn / 2 + 8}
          position={{ y: 40 }}
          content={<ColumnLabel statusRegion={statusRegion} renderLabel={renderLabel} />}
        />

        <BarStack radius={4}>
          {series.map(({ id, color }) => (
            <Bar key={id} dataKey={id} fill={toCssColor(color)} />
          ))}
        </BarStack>
      </BarChart>

      <VisuallyHidden>
        <div ref={setStatusRegion} role="status" />
      </VisuallyHidden>

      {series.length > 1 && (
        <ul className={styles.legend}>
          {series.map(({ id, name, color }) => (
            <li key={id} className={styles.legendItem}>
              <span className={styles.swatch} style={{ background: toCssColor(color) }} />
              {name}
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
