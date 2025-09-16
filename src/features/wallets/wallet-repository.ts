import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { walletsTable } from "@/db/schema";
import { toUpdatableWallet, type WalletEntity } from "./wallet-entity";

const defaultWhere = (id: string, userId: string) =>
  and(eq(walletsTable.id, id), eq(walletsTable.userId, userId));

export class WalletRepository {
  public async create(entity: WalletEntity): Promise<WalletEntity> {
    await db.insert(walletsTable).values(entity);
    return entity;
  }

  public async remove(id: string, userId: string): Promise<void> {
    await db.delete(walletsTable).where(defaultWhere(id, userId));
  }

  public async update(
    id: string,
    userId: string,
    entity: Partial<WalletEntity>,
  ): Promise<Partial<WalletEntity>> {
    await db
      .update(walletsTable)
      .set(toUpdatableWallet(entity))
      .where(defaultWhere(id, userId));

    return entity;
  }

  public async findFirst(
    id: string,
    userId: string,
  ): Promise<WalletEntity | null> {
    const wallet = await db.query.walletsTable.findFirst({
      where: defaultWhere(id, userId),
    });
    return wallet ?? null;
  }

  public async allWallets(userId: string): Promise<Array<WalletEntity>> {
    const wallets = await db.query.walletsTable.findMany({
      where: eq(walletsTable.userId, userId),
    });
    return wallets;
  }
}
