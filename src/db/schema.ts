import {
  date,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const id = () => uuid().primaryKey().notNull();

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
};

const colors = {
  fgColor: varchar("fg_color", { length: 50 }),
  bgColor: varchar("bg_color", { length: 50 }),
};

export const usersTable = pgTable("users", {
  id: id(),
  email: varchar({ length: 255 }).unique().notNull(),
  password: text().notNull(),
  ...timestamps,
});

export const walletsTable = pgTable("wallets", {
  id: id(),
  name: varchar({ length: 255 }).notNull(),
  sortOrder: integer("sort_order"),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  ...colors,
  ...timestamps,
});

export const tagsTable = pgTable(
  "tags",
  {
    id: id(),
    name: varchar("name", { length: 255 }).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    ...colors,
    ...timestamps,
  },
  (t) => [unique("tags_user_id_name_unique").on(t.userId, t.name)],
);

export const expensesTable = pgTable(
  "expenses",
  {
    id: id(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    occurredAt: date("occurred_at").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    status: integer("status").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    walletId: uuid("wallet_id").references(() => walletsTable.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (t) => [index("expenses_user_occurred_at_idx").on(t.userId, t.occurredAt)],
);

// Tags ↔ Expenses (join table)
export const tagsExpensesTable = pgTable(
  "tags_expenses",
  {
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tagsTable.id, { onDelete: "cascade" }),
    expenseId: uuid("expense_id")
      .notNull()
      .references(() => expensesTable.id, { onDelete: "cascade" }),
    createdAt: timestamps.createdAt,
  },
  (t) => [primaryKey({ columns: [t.tagId, t.expenseId] })],
);
