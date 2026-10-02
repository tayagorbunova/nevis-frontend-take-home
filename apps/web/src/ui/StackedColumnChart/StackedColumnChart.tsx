import { useId, useLayoutEffect, useState } from "react";
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

import type { ChartSeries, ChartTotal } from "./chartTypes";
import { ColumnTooltip } from "./components/ColumnTooltip";
import { Swatch } from "./components/Swatch";
import { toCssColor } from "./palette";
import styles from "./StackedColumnChart.module.css";

type StackedColumnChartProps = {
  title: string;
  description: string;
  columnNames: readonly string[];
  series: readonly ChartSeries[];
  total?: ChartTotal;
  formatValue: (value: number | undefined) => string;
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

type PlotWidthReporterProps = { onChange: (width: number) => void };

function PlotWidthReporter({ onChange }: PlotWidthReporterProps) {
  const width = usePlotArea()?.width;

  useLayoutEffect(() => {
    if (width !== undefined) onChange(width);
  }, [width, onChange]);

  return null;
}

export function StackedColumnChart({
  title,
  description,
  columnNames,
  series,
  total,
  formatValue,
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
        key={columnNames.join()}
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
          content={
            <ColumnTooltip
              statusRegion={statusRegion}
              columnNames={columnNames}
              series={series}
              total={total}
              formatValue={formatValue}
            />
          }
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

      <ul className={styles.legend}>
        {series.map(({ id, name, color }) => (
          <li key={id} className={styles.legendItem}>
            <Swatch color={color} />
            {name}
          </li>
        ))}
      </ul>
    </figure>
  );
}
