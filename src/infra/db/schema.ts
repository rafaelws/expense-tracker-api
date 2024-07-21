import {
  date,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().notNull(),
    email: varchar("email", { length: 256 }).notNull(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => ({ emailIndex: uniqueIndex("email_idx").on(table.email) }),
);

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().notNull(),
  amount: numeric("amount", { scale: 2, precision: 10 }).notNull(),
  description: text("description").notNull(),
  date: date("date", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
});
