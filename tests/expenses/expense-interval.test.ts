import { describe, expect, it } from "vitest";

import {
  calculateExpenseInterval,
  ExpensePeriod,
} from "@/features/expenses/expense-interval";

describe("expense interval", () => {
  it.concurrent.each([
    {
      input: { ref: new Date(2024, 6, 27), period: "invalid period" },
      output: null,
    },
    {
      input: { ref: new Date(2024, 6, 27), period: "15s" },
      output: null,
    },
    {
      input: { ref: new Date(2024, 6, 27), period: "Infinityd" },
      output: null,
    },
    {
      input: { ref: new Date(2024, 6, 27), period: "15d" },
      output: { from: new Date(2024, 6, 12), to: new Date(2024, 6, 27) },
    },
    {
      input: { ref: new Date(2024, 6, 27), period: "30d" },
      output: { from: new Date(2024, 5, 27), to: new Date(2024, 6, 27) },
    },
    {
      input: { ref: new Date(2024, 6, 27), period: "45d" },
      output: { from: new Date(2024, 5, 12), to: new Date(2024, 6, 27) },
    },
    {
      input: { ref: new Date(2024, 6, 27), period: "90d" },
      output: { from: new Date(2024, 3, 28), to: new Date(2024, 6, 27) },
    },
    {
      input: { ref: new Date(2024, 6, 27), period: "1m" },
      output: { from: new Date(2024, 6, 1), to: new Date(2024, 6, 31) },
    },
    {
      input: { ref: new Date(2024, 6, 27), period: "2m" },
      output: { from: new Date(2024, 5, 1), to: new Date(2024, 6, 31) },
    },
    {
      input: { ref: new Date(2024, 6, 27), period: "3m" },
      output: { from: new Date(2024, 4, 1), to: new Date(2024, 6, 31) },
    },
  ])("should calculate interval for $input.period", ({ input, output }) => {
    expect(
      calculateExpenseInterval(input.ref, input.period as ExpensePeriod),
    ).toEqual(output);
  });
});
