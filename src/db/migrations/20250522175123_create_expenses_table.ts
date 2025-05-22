import type { Knex } from "knex";

const tableName = "expenses";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (builder) => {
    builder.uuid("id").primary({ constraintName: "expenses_id_pk" });

    builder.string("title", 255).notNullable();
    builder.text("description");
    builder.date("occurred_at").notNullable();
    builder.decimal("amount", 10, 2).notNullable();
    builder.integer("status").unsigned().notNullable();

    builder
      .timestamp("created_at", { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();
    builder
      .timestamp("updated_at", { useTz: true })
      .defaultTo(knex.fn.now())
      .notNullable();

    builder
      .uuid("user_id")
      .notNullable()
      .references("users.id")
      .withKeyName("expenses_users_fk")
      .onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
