import type { usersTable } from "@/db/schema";

export type UserEntity = typeof usersTable.$inferInsert;
