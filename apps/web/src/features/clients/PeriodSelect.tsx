import { PERIODS, type Period } from "@nevis/contract";

import { Select } from "@ui";

const PERIOD_LABELS: Record<Period, string> = {
  "last-12-months": "Last 12 months",
  "last-6-months": "Last 6 months",
  "last-3-months": "Last 3 months",
  "last-month": "Last month",
};

const PERIOD_ITEMS = PERIODS.map((period) => ({ id: period, label: PERIOD_LABELS[period] }));

type PeriodSelectProps = {
  value: Period;
  onChange: (period: Period) => void;
};

export function PeriodSelect({ value, onChange }: PeriodSelectProps) {
  return <Select label="Period" hideLabel items={PERIOD_ITEMS} value={value} onChange={onChange} />;
}
