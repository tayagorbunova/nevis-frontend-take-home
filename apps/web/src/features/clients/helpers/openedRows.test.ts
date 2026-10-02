import { describe, expect, it } from "vitest";

import { toChartContent } from "./chartContent";
import { closeRow, openRow, pickRowForChart } from "./openedRows";
import { toClientTree } from "./toClientTree";

const TREE = toClientTree({
  id: "company",
  name: "Company",
  values: [],
  branches: [
    {
      id: "branch-1",
      name: "Branch 1",
      values: [],
      employees: [
        {
          id: "anna",
          name: "Anna Blackwood",
          values: [],
          channels: [{ id: "existing-clients", name: "Existing clients", values: [] }],
        },
      ],
    },
    { id: "branch-2", name: "Branch 2", values: [] },
  ],
});

function captionFor(openedIds: readonly string[]) {
  return toChartContent(pickRowForChart(TREE, openedIds), []).caption;
}

describe("what the chart shows", () => {
  it("follows the row opened last, and falls back when it closes", () => {
    let openedIds = ["company"];
    expect(captionFor(openedIds)).toBe("Company by branch");

    openedIds = openRow(openedIds, "branch-1");
    expect(captionFor(openedIds)).toBe("Branch 1 by advisor");

    openedIds = openRow(openedIds, "anna");
    expect(captionFor(openedIds)).toBe("Anna Blackwood by channel");

    openedIds = closeRow(openedIds, "anna");
    expect(captionFor(openedIds)).toBe("Branch 1 by advisor");

    openedIds = openRow(closeRow(openedIds, "company"), "company");
    expect(captionFor(openedIds)).toBe("Company by branch");
  });

  it("shows the plain company when the open branch is hidden inside a closed company", () => {
    const openedIds = closeRow(["company", "branch-1"], "company");

    expect(captionFor(openedIds)).toBe("Company");
  });

  it("ignores a row with nothing inside", () => {
    const openedIds = openRow(["company"], "branch-2");

    expect(captionFor(openedIds)).toBe("Company by branch");
  });
});
