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

export function calculateExpenseInterval(
  reference: Date,
  period: ExpensePeriod,
) {
  const amount = parseInt(period);
  if (isNaN(amount) || amount <= 0) return null;

  const year = reference.getFullYear();
  const month = reference.getMonth();

  const unit = period[period.length - 1];
  if (unit === "d") {
    const date = reference.getDate();
    return {
      from: new Date(year, month, date - amount),
      to: new Date(year, month, date),
    };
  } else if (unit === "m") {
    // includes the reference month
    return {
      from: new Date(year, month - amount + 1, 1),
      to: new Date(year, month + 1, 0),
    };
  } else {
    return null;
  }
}
