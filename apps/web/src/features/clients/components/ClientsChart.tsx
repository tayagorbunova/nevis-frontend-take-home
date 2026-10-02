import { Card, StackedColumnChart } from "@ui";

import { toChartContent } from "../helpers/chartContent";
import { formatCount, formatMonth } from "../helpers/format";
import type { RowForChart } from "../helpers/openedRows";

type ClientsChartProps = {
  rowForChart: RowForChart;
  months: readonly string[];
};

export function ClientsChart({ rowForChart, months }: ClientsChartProps) {
  const { caption, description, series, total } = toChartContent(rowForChart, months);

  return (
    <Card>
      <StackedColumnChart
        title={caption}
        description={description}
        columnNames={months.map(formatMonth)}
        series={series}
        total={total}
        formatValue={formatCount}
      />
    </Card>
  );
}
