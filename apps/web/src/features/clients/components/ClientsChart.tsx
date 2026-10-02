import { Card, StackedColumnChart } from "@ui";

import { chartModel } from "../model/chartModel";
import { formatCount, formatMonth } from "../model/format";
import type { ChartSubject } from "../model/openedRows";

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
