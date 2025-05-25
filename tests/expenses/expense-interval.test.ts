import { describe, expect, it } from "vitest";

import {
  calculateExpenseInterval,
  ExpensePeriod,
} from "@/features/expenses/expense-interval";

describe("expense interval", () => {
  it.concurrent.each([
    {
      input: { reference: "2024-07-27", period: "invalid period" },
      output: null,
    },
    {
      input: { reference: "2024-07-27", period: "15s" },
      output: null,
    },
    {
      input: { reference: "2024-07-27", period: "Infinityd" },
      output: null,
    },
    {
      input: { reference: "2024-07-27", period: "15d" },
      output: { from: "2024-07-12", to: "2024-07-27" },
    },
    {
      input: { reference: "2024-07-27", period: "30d" },
      output: { from: "2024-06-27", to: "2024-07-27" },
    },
    {
      input: { reference: "2024-07-27", period: "45d" },
      output: { from: "2024-06-12", to: "2024-07-27" },
    },
    {
      input: { reference: "2024-07-27", period: "90d" },
      output: { from: "2024-04-28", to: "2024-07-27" },
    },
    {
      input: { reference: "2024-07-27", period: "1m" },
      output: { from: "2024-07-01", to: "2024-07-31" },
    },
    {
      input: { reference: "2024-07-27", period: "2m" },
      output: { from: "2024-06-01", to: "2024-07-31" },
    },
    {
      input: { reference: "2024-07-27", period: "3m" },
      output: { from: "2024-05-01", to: "2024-07-31" },
    },
  ])("should calculate interval for $input.period", ({ input, output }) => {
    expect(
      calculateExpenseInterval(input.reference, input.period as ExpensePeriod),
    ).toEqual(output);
  });
});
