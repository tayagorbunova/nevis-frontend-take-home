import type { ApiCompany, ClientCountsResponse, Period } from "@nevis/contract";

const MONTHS_IN_PERIOD: Record<Period, number> = {
  "last-12-months": 12,
  "last-6-months": 6,
  "last-3-months": 3,
  "last-month": 1,
};

export function selectPeriod(
  company: ApiCompany,
  firstMonth: string,
  period: Period,
): ClientCountsResponse {
  const allMonths = company.values.map((_, index) => addMonths(firstMonth, index));
  const months = allMonths.slice(-MONTHS_IN_PERIOD[period]);

  const trimmedCompany = structuredClone(company);

  for (const row of listRows(trimmedCompany)) {
    row.values = row.values.slice(-months.length);
  }

  return { months, company: trimmedCompany };
}

function addMonths(month: string, count: number) {
  const date = new Date(month);
  date.setUTCMonth(date.getUTCMonth() + count);
  return date.toISOString().slice(0, 7);
}

function listRows(company: ApiCompany) {
  const branches = company.branches ?? [];
  const employees = branches.flatMap((branch) => branch.employees ?? []);
  const channels = employees.flatMap((employee) => employee.channels ?? []);
  return [company, ...branches, ...employees, ...channels];
}
