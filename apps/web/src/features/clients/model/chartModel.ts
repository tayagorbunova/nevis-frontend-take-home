import { CHART_PALETTE, type ChartSeries, type ChartTotal } from "@ui";

import { formatMonth } from "../format";

import type { ChartSubject } from "./openedRows";
import type { ClientRow } from "./toClientTree";

export type ChartModel = {
  caption: string;
  description: string;
  series: ChartSeries[];
  total?: ChartTotal;
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
    total: isSplit ? { name: row.name, values: row.values } : undefined,
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
