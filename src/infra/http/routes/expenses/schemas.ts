import { z } from "zod";

import { numberHelper } from "@/infra/common";

export const createSchema = z.object({
  description: z.string(),
  amount: z.string().refine((val) => numberHelper.isValid(val)),
  date: z
    .string()
    .date()
    .refine((val) => !isNaN(Date.parse(val)))
    .transform((val) => new Date(val)),
});

export const updateSchema = createSchema
  .partial()
  .refine(({ description, amount, date }) => description || amount || date, {
    message:
      "At least one of 'description', 'amount', or 'date' must be provided",
  });
