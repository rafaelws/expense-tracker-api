export type Expense = {
  id: string;
  amount: number;
  date: Date;
  description: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ChangeableExpense = Pick<
  Expense,
  "amount" | "date" | "description"
>;
export type ReadableExpense = Omit<
  Expense,
  "userId" | "createdAt" | "updatedAt"
>;

export interface ExpenseRepo {
  create(userId: string, expense: ChangeableExpense): Promise<ReadableExpense>;
  remove(id: string, userId: string): Promise<void>;
  update(
    id: string,
    userId: string,
    expense: Partial<ChangeableExpense>,
  ): Promise<ReadableExpense>;
  get(userId: string, from: Date, to: Date): Promise<ReadableExpense[]>;
}
