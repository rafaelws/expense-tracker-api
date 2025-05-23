import { ExpenseRepo, ReadableExpense } from "./ExpenseRepo";

export const PERIODS = ["15d", "30d", "45d", "90d", "1m", "2m", "3m"] as const;
export type Period = (typeof PERIODS)[number];

export class GetExpense {
  constructor(private readonly repo: ExpenseRepo) {}

  async perform(
    userId: string,
    reference: Date,
    period: Period,
  ): Promise<ReadableExpense[] | null> {
    if (!this.isValidPeriod(period)) return null;

    const result = this.calculateInterval(reference, period);
    if (result === null) return null;

    return this.repo.get(userId, result.from, result.to);
  }

  private isValidPeriod(period: Period) {
    return PERIODS.includes(period);
  }

  public calculateInterval(reference: Date, period: Period) {
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
}
