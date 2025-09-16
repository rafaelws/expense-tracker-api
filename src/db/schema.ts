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
  createdAt: timestamp({ withTimezone: true }).notNull(),
  updatedAt: timestamp({ withTimezone: true }).notNull(),
};

const colors = {
  fgColor: varchar({ length: 50 }),
  bgColor: varchar({ length: 50 }),
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
  sortOrder: integer(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  ...colors,
  ...timestamps,
});

export const tagsTable = pgTable(
  "tags",
  {
    id: id(),
    name: varchar({ length: 255 }).notNull(),
    userId: uuid()
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
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    occurredAt: date().notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    status: integer().notNull(),
    userId: uuid()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    walletId: uuid().references(() => walletsTable.id, {
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
    tagId: uuid()
      .notNull()
      .references(() => tagsTable.id, { onDelete: "cascade" }),
    expenseId: uuid()
      .notNull()
      .references(() => expensesTable.id, { onDelete: "cascade" }),
    createdAt: timestamps.createdAt,
  },
  (t) => [primaryKey({ columns: [t.tagId, t.expenseId] })],
);
