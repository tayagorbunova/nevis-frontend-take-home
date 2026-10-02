import { Card } from "../Card/Card";
import type { Examples, ExamplesMeta } from "../examples";

import { StackedColumnChart, type ChartSeries, type ChartTotal } from "./StackedColumnChart";

export const meta: ExamplesMeta = { title: "StackedColumnChart", wide: true };

const monthLabels = [
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

const series: ChartSeries[] = [
  {
    id: "existing",
    name: "Existing clients",
    color: "lavender",
    values: [140, 148, 155, 161, 170, 182, 190, 186, 195, 204, 212, 220],
  },
  {
    id: "organic",
    name: "New organic",
    color: "peach",
    values: [60, 64, 70, 73, 78, 84, 88, 85, 90, 95, 99, 104],
  },
  {
    id: "paid",
    name: "New paid",
    color: "maroon",
    values: [20, 22, 25, 27, 30, 33, 36, 34, 38, 41, 44, 48],
  },
];

const total: ChartTotal = {
  name: "All clients",
  values: [220, 234, 250, 261, 278, 299, 314, 305, 323, 340, 355, 372],
};

function Default() {
  return (
    <Card>
      <StackedColumnChart
        title="Example chart"
        description="Made-up client counts by channel, February 2024 to January 2025."
        columnNames={monthLabels}
        series={series}
        total={total}
        formatValue={String}
      />
    </Card>
  );
}

export const examples: Examples = { Default };
