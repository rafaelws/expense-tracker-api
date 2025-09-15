import { z } from "zod/v4";

import type { WalletEntity } from "./wallet-entity";

export const publicWalletSchema = z.object({
  id: z.uuid().meta({ example: "e8434b44-5e82-4fb9-896e-67337eae2c6b" }),
  name: z.string().meta({ example: "Main Wallet" }),
  fgColor: z.string().optional().nullable().meta({ example: "#FFFFFF" }),
  bgColor: z.string().optional().nullable().meta({ example: "rgb(72,72,78)" }),
  sortOrder: z.number().int().min(1).optional().nullable().meta({
    description:
      "Optional manual order index. Must be a positive integer starting from 1.",
    example: 1,
  }),
});

export type PublicWallet = z.infer<typeof publicWalletSchema>;

export const toPublicWallet = (entity: WalletEntity): PublicWallet =>
  z.parse(publicWalletSchema, entity);
