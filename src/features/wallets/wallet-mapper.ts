import { pick } from "@/lib/util";

import { WalletEntity } from "./wallet-entity";

export type PublicWallet = {
  id: string;
  name: string;
  fgColor?: string;
  bgColor?: string;
  sortOrder?: number;
};

export const toPublicWallet = (entity: WalletEntity): PublicWallet =>
  pick(entity, ["id", "name", "fgColor", "bgColor", "sortOrder"]);
