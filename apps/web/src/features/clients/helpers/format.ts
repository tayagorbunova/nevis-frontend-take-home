const LOCALE = "en-US";
const EM_DASH = "—";

const monthFormat = new Intl.DateTimeFormat(LOCALE, {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const countFormat = new Intl.NumberFormat(LOCALE);

export function formatMonth(month: string) {
  return monthFormat.format(new Date(month));
}

export function formatCount(value: number | undefined) {
  return value === undefined ? EM_DASH : countFormat.format(value);
}
