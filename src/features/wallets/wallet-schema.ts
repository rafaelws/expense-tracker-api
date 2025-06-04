import { z } from "zod/v4";

export const createWalletSchema = z.object({
  name: z.string().max(255).trim().nonempty().meta({ example: "Main Wallet" }),
  fgColor: z
    .string()
    .max(50)
    .trim()
    .nonempty()
    .optional()
    .meta({ example: "#FFFFFF" }),
  bgColor: z
    .string()
    .max(50)
    .trim()
    .nonempty()
    .optional()
    .meta({ example: "rgb(72,72,78)" }),
  sortOrder: z.number().int().min(1).optional().meta({
    description:
      "Optional manual order index. Must be a positive integer starting from 1.",
    example: 1,
  }),
});

export type CreateWalletDTO = z.infer<typeof createWalletSchema>;

export const updateWalletSchema = createWalletSchema
  .partial()
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message:
      "At least one of these fields must be provided: name, fgColor, bgColor, sortOrder",
    path: [],
  });

export type UpdateWalletDTO = z.infer<typeof updateWalletSchema>;
