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

    const from = this.calculateFrom(reference, period);
    if (from === null) return null;

    return this.repo.get(userId, from, reference);
  }

  private isValidPeriod(period: Period) {
    return PERIODS.includes(period);
  }

  private calculateFrom(to: Date, period: Period): Date | null {
    const amount = parseInt(period);
    if (isNaN(amount)) return null;

    const from = new Date(to);
    const unit = period[period.length - 1];
    if (unit === "d") {
      from.setDate(to.getDate() - amount);
    } else if (unit === "m") {
      from.setMonth(to.getMonth() - amount);
    } else {
      return null;
    }
    return from;
  }
}
