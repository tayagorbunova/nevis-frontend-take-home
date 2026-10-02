import { CHART_PALETTE, type ChartSeries } from "@ui";

import { formatMonth } from "../format";

import type { ChartSubject } from "./openedRows";
import type { ClientRow } from "./toClientTree";

export type ChartModel = {
  caption: string;
  description: string;
  series: ChartSeries[];
  totals: number[];
};

export function chartModel(subject: ChartSubject, months: readonly string[]): ChartModel {
  const { row, isSplit } = subject;

  const [firstChild] = row.children;
  const caption = isSplit && firstChild ? `${row.name} by ${firstChild.level}` : row.name;

  const parts = isSplit ? row.children : [row];

  return {
    caption,
    description: `${caption}, ${describeMonths(months)}. Exact numbers are in the table below.`,
    series: parts.map(toSeries),
    totals: row.values,
  };
}

function toSeries(part: ClientRow, index: number): ChartSeries {
  return {
    id: part.id,
    name: part.name,
    color: CHART_PALETTE[index] ?? "grey",
    values: part.values,
  };
}

function describeMonths(months: readonly string[]) {
  const firstAndLast = months.filter((_, index) => index === 0 || index === months.length - 1);

  return firstAndLast.map(formatMonth).join(" to ");
}
