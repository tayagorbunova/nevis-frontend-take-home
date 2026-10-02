import { describe, expect, it } from "vitest";

import { toChartContent } from "./chartContent";
import { toClientTree } from "./toClientTree";

const MONTHS = ["2024-02", "2024-03"];

const COMPANY = toClientTree({
  id: "company",
  name: "Company",
  values: [10, 20],
  branches: [
    { id: "branch-1", name: "Branch 1", values: [3, 5] },
    { id: "branch-2", name: "Branch 2", values: [4, 6] },
  ],
});

describe("the chart's bars and total", () => {
  it("splits a row into its children and shows the row's own total, not their sum", () => {
    const { series, total } = toChartContent({ row: COMPANY, isSplit: true }, MONTHS);

    expect(series).toMatchObject([
      { name: "Branch 1", values: [3, 5] },
      { name: "Branch 2", values: [4, 6] },
    ]);
    expect(total).toEqual({ name: "Company", values: [10, 20] });
  });

  it("draws a row that isn't split as one series, with no total", () => {
    const { series, total } = toChartContent({ row: COMPANY, isSplit: false }, MONTHS);

    expect(series).toMatchObject([{ name: "Company", values: [10, 20] }]);
    expect(total).toBeUndefined();
  });
});
