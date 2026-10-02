import type { ChartColor } from "./palette";

export type ChartSeries = {
  id: string;
  name: string;
  color: ChartColor;
  values: readonly number[];
};

export type ChartTotal = {
  name: string;
  values: readonly number[];
};
