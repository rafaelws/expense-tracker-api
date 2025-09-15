const tagsTableName = "tags";
const tagsExpensesTableName = "tags_expenses";

export async function up(knex) {
  await knex.schema.createTable(tagsTableName, (builder) => {
    builder.uuid("id").primary({ constraintName: "tags_id_pk" });

    builder.string("name", 255).notNullable();

    builder.unique(["user_id", "name"], {
      indexName: "tags_user_id_name_unique",
    });

    builder.string("fg_color", 50);
    builder.string("bg_color", 50);

    builder.timestamp("created_at", { useTz: true }).notNullable();
    builder.timestamp("updated_at", { useTz: true }).notNullable();

    builder
      .uuid("user_id")
      .notNullable()
      .references("users.id")
      .withKeyName("tags_users_fk")
      .onDelete("CASCADE");
  });

  await knex.schema.createTable(tagsExpensesTableName, (builder) => {
    builder
      .uuid("tag_id")
      .notNullable()
      .references("tags.id")
      .withKeyName("tags_expenses_tag_fk")
      .onDelete("CASCADE");

    builder
      .uuid("expense_id")
      .notNullable()
      .references("expenses.id")
      .withKeyName("tags_expenses_expense_fk")
      .onDelete("CASCADE");

    builder.primary(["tag_id", "expense_id"], {
      constraintName: "tags_expenses_pk",
    });

    builder.timestamp("created_at", { useTz: true }).notNullable();
  });
}

export async function down(knex) {
  await knex.schema.dropTable(tagsExpensesTableName);
  await knex.schema.dropTable(tagsTableName);
}
