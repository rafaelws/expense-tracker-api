import { db } from "@/db/client";

import {
  TagDb,
  TagEntity,
  toTagDb,
  toTagEntity,
  toUpdatableTagDb,
} from "./tag-entity";

const tableName = "tags";

export class TagRepository {
  public async create(entity: TagEntity): Promise<TagEntity> {
    await db(tableName).insert(toTagDb(entity));
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
    entity: Partial<TagEntity>,
  ): Promise<Partial<TagEntity>> {
    await db(tableName)
      .update(toUpdatableTagDb(entity))
      .where("id", "=", id)
      .andWhere("user_id", "=", userId);

    return entity;
  }

  public async findFirst(
    id: string,
    userId: string,
  ): Promise<TagEntity | null> {
    const result = await db<TagDb>(tableName)
      .select()
      .where("user_id", "=", userId)
      .andWhere("id", "=", id)
      .first();

    return result === undefined ? null : toTagEntity(result);
  }

  public async allTags(userId: string): Promise<Array<TagEntity>> {
    const result = await db<TagDb>(tableName)
      .select()
      .where("user_id", "=", userId);

    return result.map(toTagEntity);
  }
}
