import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { usersTable } from "@/db/schema";
import type { UserEntity } from "./user-entity";

export class UserRepository {
  public async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
    return user ?? null;
  }

  public async create(entity: UserEntity): Promise<UserEntity> {
    await db.insert(usersTable).values(entity);
    return entity;
  }
}
