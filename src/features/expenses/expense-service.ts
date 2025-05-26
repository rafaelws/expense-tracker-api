import { InvalidParameterError, ResourceNotFoundError } from "@/lib/errors";
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
    const now = new Date();
    const entity: ExpenseEntity = {
      ...dto,
      id: uuid(),
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
  ): Promise<ExposableExpense> {
    const entity = await this.expenseRepository.findFirst(id, userId);
    if (!entity) throw new ResourceNotFoundError(`Expense#${id}`);

    const toUpdate = {
      ...dto,
      updatedAt: new Date(),
    };

    await this.expenseRepository.update(id, userId, toUpdate);
    return expose({ ...entity, ...toUpdate });
  }

  public async deleteExpense(id: string, userId: string): Promise<void> {
    const entity = await this.expenseRepository.findFirst(id, userId);
    if (!entity) throw new ResourceNotFoundError(`Expense#${id}`);

    await this.expenseRepository.remove(id, userId);
  }

  public async listExpenses(
    userId: string,
    { reference, period }: { reference: string; period: ExpensePeriod },
  ): Promise<ExposableExpense[]> {
    const result = calculateExpenseInterval(reference, period);
    if (result === null)
      throw new InvalidParameterError(
        "period",
        "Invalid period or time interval",
      );

    const results = await this.expenseRepository.findAll(
      userId,
      result.from,
      result.to,
    );

    return results.length > 0 ? results.map(expose) : [];
  }
}
