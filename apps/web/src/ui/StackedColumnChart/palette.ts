export const CHART_PALETTE = ["lavender", "peach", "maroon", "sage", "mustard"] as const;

export type ChartColor = (typeof CHART_PALETTE)[number] | "grey";

export function toCssColor(color: ChartColor) {
  return `var(--color-chart-${color})`;
}
