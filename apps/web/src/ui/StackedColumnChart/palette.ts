export const CHART_PALETTE = ["lavender", "peach", "maroon", "sage", "mustard"] as const;

export type ChartColor = (typeof CHART_PALETTE)[number] | "grey";
