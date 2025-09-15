const tableName = "expenses";

export async function up(knex) {
  return knex.schema.createTable(tableName, (builder) => {
    builder.uuid("id").primary({ constraintName: "expenses_id_pk" });

    builder.string("title", 255).notNullable();
    builder.text("description");
    builder.date("occurred_at").notNullable();
    builder.decimal("amount", 10, 2).notNullable();
    builder.integer("status").unsigned().notNullable();

    builder.timestamp("created_at", { useTz: true }).notNullable();
    builder.timestamp("updated_at", { useTz: true }).notNullable();

    builder
      .uuid("user_id")
      .notNullable()
      .references("users.id")
      .withKeyName("expenses_users_fk")
      .onDelete("CASCADE");

    builder
      .uuid("wallet_id")
      .nullable()
      .references("wallets.id")
      .withKeyName("expenses_wallets_fk")
      .onDelete("SET NULL");

    builder.index(["user_id", "occurred_at"], "expenses_user_occurred_at_idx");
  });
}

export async function down(knex) {
  return knex.schema.dropTable(tableName);
}
