import Decimal from "decimal.js";
import { InvalidParameterError } from "@/lib/errors";

const minValue = new Decimal("0.01");
const maxValue = new Decimal("99999999.99");

const paramName = "amount";
const reason = [
  "Amount must be a finite number",
  "Amount cannot have more than 2 decimal places",
  "Must be greater than 0 (at least 0.01)",
  "Exceeds the maximum value",
  "Invalid amount format",
];

export const getAmount = (amount: string | number): string => {
  try {
    const decimal = new Decimal(amount);

    if (!decimal.isFinite())
      throw new InvalidParameterError(paramName, reason[0]);

    if (decimal.decimalPlaces() > 2)
      throw new InvalidParameterError(paramName, reason[1]);

    if (decimal.lt(minValue))
      throw new InvalidParameterError(paramName, reason[2]);

    if (decimal.gt(maxValue))
      throw new InvalidParameterError(paramName, reason[3]);

    return decimal.toFixed(2);
  } catch {
    throw new InvalidParameterError(paramName, reason[4]);
  }
};
