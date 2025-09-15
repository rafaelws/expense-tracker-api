import { db } from "@/db";

import {
  toUserDb,
  toUserEntity,
  type UserDb,
  type UserEntity,
} from "./user-entity";

export class UserRepository {
  public async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await db
      .select()
      .from<UserDb>("users")
      .where("email", "=", email)
      .first();

    return result ? toUserEntity(result) : null;
  }

  public async create(entity: UserEntity): Promise<UserEntity> {
    await db("users").insert(toUserDb(entity));
    return entity;
  }
}
