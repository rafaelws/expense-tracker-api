import type { Knex } from "knex";

const tableName = "wallets";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, (builder) => {
    builder.uuid("id").primary({ constraintName: "wallets_id_pk" });
    builder.string("name", 255).notNullable();
    builder.string("fg_color", 50);
    builder.string("bg_color", 50);
    builder.integer("sort_order").unsigned();

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
      .withKeyName("wallets_users_fk")
      .onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
