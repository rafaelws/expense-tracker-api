import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { tagsTable } from "@/db/schema";
import { type TagEntity, toUpdatableTag } from "./tag-entity";

const defaultWhere = (id: string, userId: string) =>
  and(eq(tagsTable.id, id), eq(tagsTable.userId, userId));

export class TagRepository {
  public async create(entity: TagEntity): Promise<TagEntity> {
    await db.insert(tagsTable).values(entity);
    return entity;
  }

  public async remove(id: string, userId: string): Promise<void> {
    await db.delete(tagsTable).where(defaultWhere(id, userId));
  }

  public async update(
    id: string,
    userId: string,
    entity: Partial<TagEntity>,
  ): Promise<Partial<TagEntity>> {
    await db
      .update(tagsTable)
      .set(toUpdatableTag(entity))
      .where(defaultWhere(id, userId));

    return entity;
  }

  public async findFirst(
    id: string,
    userId: string,
  ): Promise<TagEntity | null> {
    const tag = await db.query.tagsTable.findFirst({
      where: defaultWhere(id, userId),
    });
    return tag ?? null;
  }

  public async allTags(userId: string): Promise<Array<TagEntity>> {
    const tags = await db.query.tagsTable.findMany({
      where: eq(tagsTable.userId, userId),
    });
    return tags;
  }
}
