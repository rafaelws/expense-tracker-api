import {
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";

export const EXPENSE_PERIODS = [
  "15d",
  "30d",
  "45d",
  "90d",
  "1m",
  "2m",
  "3m",
] as const;
export type ExpensePeriod = (typeof EXPENSE_PERIODS)[number];

export function isValidExpensePeriod(period: ExpensePeriod) {
  return EXPENSE_PERIODS.includes(period);
}

const toString = (date: Date) => format(date, "yyyy-MM-dd");

export function calculateExpenseInterval(reference: string, period: string) {
  const amount = parseInt(period);
  if (isNaN(amount) || amount <= 0) return null;

  const refDate = parseISO(reference);

  const unit = period[period.length - 1];
  if (unit === "d") {
    return {
      from: toString(subDays(refDate, amount)),
      to: toString(refDate),
    };
  } else if (unit === "m") {
    return {
      from: toString(startOfMonth(subMonths(refDate, amount - 1))),
      to: toString(endOfMonth(refDate)),
    };
  }

  return null;
}
