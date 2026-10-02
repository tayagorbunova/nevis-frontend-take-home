import { Card, StackedColumnChart } from "@ui";

import { formatCount, formatMonth } from "./format";
import { chartModel } from "./model/chartModel";
import type { ChartSubject } from "./model/openedRows";

type ClientsChartProps = {
  subject: ChartSubject;
  months: readonly string[];
};

export function ClientsChart({ subject, months }: ClientsChartProps) {
  const { caption, description, series, total } = chartModel(subject, months);

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
