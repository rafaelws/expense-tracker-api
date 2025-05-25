import { pick } from "@/lib/util";
import { uuid } from "@/lib/uuid";

import { ExpenseEntity } from "./expense-entity";
import { calculateExpenseInterval, ExpensePeriod } from "./expense-interval";
import { ExpenseRepository } from "./expense-repository";
import { CreateExpenseDTO, UpdateExpenseDTO } from "./expense-schema";

const exposableExpenseFields: (keyof ExpenseEntity)[] = [
  "id",
  "amount",
  "title",
  "description",
  "occurredAt",
  "status",
] as const;

export type ExposableExpense = Pick<
  ExpenseEntity,
  (typeof exposableExpenseFields)[number]
>;

const expose = (entity: ExpenseEntity) => pick(entity, exposableExpenseFields);

export class ExpenseService {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  public async createExpense(
    userId: string,
    dto: CreateExpenseDTO,
  ): Promise<ExposableExpense> {
    const { amount, ...expense } = dto;

    const now = new Date();
    const entity: ExpenseEntity = {
      ...expense,
      id: uuid(),
      amount: amount.toString(),
      createdAt: now,
      updatedAt: now,
      userId,
    };

    await this.expenseRepository.create(entity);

    return expose(entity);
  }

  public async updateExpense(
    id: string,
    userId: string,
    dto: UpdateExpenseDTO,
  ): Promise<ExposableExpense | null> {
    const entity = await this.expenseRepository.findFirst(id, userId);
    if (!entity) return null;

    const toUpdate = {
      ...dto,
      updatedAt: new Date(),
    };

    await this.expenseRepository.update(id, userId, toUpdate);
    return expose({ ...entity, ...toUpdate });
  }

  public async deleteExpense(id: string, userId: string) {
    const entity = await this.expenseRepository.findFirst(id, userId);
    if (!entity) return null;

    await this.expenseRepository.remove(id, userId);
  }

  public async listExpenses(
    userId: string,
    { reference, period }: { reference: string; period: ExpensePeriod },
  ): Promise<ExposableExpense[] | null> {
    const result = calculateExpenseInterval(reference, period);
    if (result === null) return null;

    const results = await this.expenseRepository.findAll(
      userId,
      result.from,
      result.to,
    );

    return results.length > 0 ? results.map(expose) : [];
  }
}
