import { db } from "@/db/client";

import {
  toUpdatableWalletDb,
  toWalletDb,
  toWalletEntity,
  type WalletDb,
  type WalletEntity,
} from "./wallet-entity";

const tableName = "wallets";

export class WalletRepository {
  public async create(entity: WalletEntity): Promise<WalletEntity> {
    await db(tableName).insert(toWalletDb(entity));
    return entity;
  }

  public async remove(id: string, userId: string): Promise<void> {
    await db(tableName)
      .delete()
      .where("id", "=", id)
      .andWhere("user_id", "=", userId);
  }

  public async update(
    id: string,
    userId: string,
    entity: Partial<WalletEntity>,
  ): Promise<Partial<WalletEntity>> {
    await db(tableName)
      .update(toUpdatableWalletDb(entity))
      .where("id", "=", id)
      .andWhere("user_id", "=", userId);

    return entity;
  }

  public async findFirst(
    id: string,
    userId: string,
  ): Promise<WalletEntity | null> {
    const result = await db<WalletDb>(tableName)
      .select()
      .where("user_id", "=", userId)
      .andWhere("id", "=", id)
      .first();

    return result === undefined ? null : toWalletEntity(result);
  }

  public async allWallets(userId: string): Promise<Array<WalletEntity>> {
    const result = await db<WalletDb>(tableName)
      .select()
      .where("user_id", "=", userId);

    return result.map(toWalletEntity);
  }
}
