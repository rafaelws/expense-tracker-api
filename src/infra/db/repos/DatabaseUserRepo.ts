import { eq } from "drizzle-orm";

import { SafeUser, UnsafeUser, UserRepo } from "@/features/users/UserRepo";
import { genid } from "@/infra/common";

import { db } from "..";
import { users } from "../schema";

export class DatabaseUserRepo implements UserRepo {
  async findByEmail(email: string): Promise<UnsafeUser | null> {
    const results = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return results.length > 0 ? results[0] : null;
  }

  async create(
    email: string,
    hashedPassword: string,
  ): Promise<SafeUser | null> {
    const id = genid();
    const time = new Date();
    await db.insert(users).values({
      id,
      email,
      createdAt: time,
      updatedAt: time,
      password: hashedPassword,
    });
    return { id, email };
  }
}
