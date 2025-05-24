import { describe, expect, it, vi } from "vitest";

import { ExpenseEntity } from "@/features/expenses/expense-entity";
import { ExpenseRepository } from "@/features/expenses/expense-repository";
import {
  ExpenseService,
  ExposableExpense,
} from "@/features/expenses/expense-service";
import { uuid } from "@/lib/uuid";

describe("ExpenseService.update", () => {
  it("should update an Expense with valid data", async () => {
    const repository = {
      findFirst: vi.fn(async (id: string, userId: string) => ({ id, userId })),
      update: vi.fn(
        async (id: string, _: string, expense: Partial<ExpenseEntity>) => ({
          ...expense,
          id,
        }),
      ),
    } as unknown as ExpenseRepository;

    const userId = uuid();
    const expenseId = uuid();

    const service = new ExpenseService(repository);

    let result: Partial<ExposableExpense> | null;

    result = await service.updateExpense(expenseId, userId, {
      amount: "102.0",
    });
    expect(repository.findFirst).toHaveBeenCalledWith(expenseId, userId);
    expect(result?.id).toBe(expenseId);
    expect(result?.amount).toBe("102.0");
    expect(result).not.toHaveProperty("userId");
    expect(result).not.toHaveProperty("createdAt");
    expect(result).not.toHaveProperty("created_at");

    result = await service.updateExpense(expenseId, userId, {
      occurredAt: new Date(2024, 2, 22),
    });
    expect(result?.id).toBe(expenseId);
    expect(result?.occurredAt).toEqual(new Date(2024, 2, 22));
    expect(result).not.toHaveProperty("updatedAt");
    expect(result).not.toHaveProperty("updated_at");

    result = await service.updateExpense(expenseId, userId, {
      description: "foobar",
    });
    expect(result?.id).toBe(expenseId);
    expect(result?.description).toBe("foobar");

    result = await service.updateExpense(expenseId, userId, {
      description: "foobar",
      occurredAt: new Date(2024, 2, 22),
    });
    expect(result?.id).toBe(expenseId);
    expect(result?.description).toBe("foobar");
    expect(result?.occurredAt).toEqual(new Date(2024, 2, 22));
    expect(repository.findFirst).toHaveBeenCalledTimes(4);

    result = await service.updateExpense(expenseId, userId, {
      amount: "101.0",
      description: "foobar",
      occurredAt: new Date(2024, 2, 22),
    });
    expect(result?.id).toBe(expenseId);
    expect(result?.amount).toBe("101.0");
    expect(result?.description).toBe("foobar");
    expect(result?.occurredAt).toEqual(new Date(2024, 2, 22));
  });

  it("should not update Expense if not found", async () => {
    const repository = {
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
    } as unknown as ExpenseRepository;

    const expenseId = uuid();
    const userId = uuid();

    const service = new ExpenseService(repository);
    const result = await service.updateExpense(expenseId, userId, {
      amount: "222.22",
    });

    expect(result).toBe(null);
    expect(repository.findFirst).toHaveBeenCalledWith(expenseId, userId);
    expect(repository.update).not.toHaveBeenCalled();
  });
});
