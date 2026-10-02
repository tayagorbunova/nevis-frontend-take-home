import { useState } from "react";

import type { Examples, ExamplesMeta } from "../exampleTypes";

import { TreeTable, type TreeTableColumn } from "./TreeTable";

export const meta: ExamplesMeta = { title: "TreeTable", wide: true };

type SampleRow = { id: string; name: string; values: number[]; children: SampleRow[] };

const company: SampleRow = {
  id: "company",
  name: "Company",
  values: [120, 126, 131, 138, 142, 150, 155, 149, 158, 163, 170, 176],
  children: [
    {
      id: "branch-1",
      name: "Branch 1",
      values: [80, 84, 87, 92, 95, 101, 104, 99, 106, 109, 114, 118],
      children: [
        {
          id: "anna",
          name: "Anna Blackwood",
          values: [45, 47, 49, 52, 54, 57, 59, 56, 60, 62, 65, 67],
          children: [],
        },
        {
          id: "james",
          name: "James Walker",
          values: [35, 37, 38, 40, 41, 44, 45, 43, 46, 47, 49, 51],
          children: [],
        },
      ],
    },
    {
      id: "branch-2",
      name: "Branch 2",
      values: [40, 42, 44, 46, 47, 49, 51, 50, 52, 54, 56, 58],
      children: [],
    },
  ],
};

const months = [
  "Feb 2024",
  "Mar 2024",
  "Apr 2024",
  "May 2024",
  "Jun 2024",
  "Jul 2024",
  "Aug 2024",
  "Sep 2024",
  "Oct 2024",
  "Nov 2024",
  "Dec 2024",
  "Jan 2025",
];

const columns: TreeTableColumn<SampleRow>[] = [
  { id: "name", header: "Name", hideHeader: true, isRowHeader: true, cell: (row) => row.name },
  ...months.map((month, index): TreeTableColumn<SampleRow> => ({
    id: month,
    header: month,
    align: "end",
    cell: (row) => row.values[index],
  })),
];

const doNothing = () => undefined;

function Default() {
  const [openRowIds, setOpenRowIds] = useState<ReadonlySet<string>>(() => new Set(["company"]));

  function handleRowOpenChange(id: string, isOpen: boolean) {
    setOpenRowIds((current) => {
      const next = new Set(current);

      if (isOpen) next.add(id);
      else next.delete(id);

      return next;
    });
  }

  return (
    <TreeTable
      label="Example table"
      rows={[company]}
      getRowId={(row) => row.id}
      getChildren={(row) => row.children}
      openRowIds={openRowIds}
      onRowOpenChange={handleRowOpenChange}
      columns={columns}
    />
  );
}

function Empty() {
  return (
    <TreeTable
      label="Example table without rows"
      rows={[]}
      getRowId={(row) => row.id}
      getChildren={(row) => row.children}
      openRowIds={new Set()}
      onRowOpenChange={doNothing}
      columns={columns}
      emptyMessage="No rows to show"
    />
  );
}

export const examples: Examples = { Default, Empty };
