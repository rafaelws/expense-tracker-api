const tableName = "users";

export async function up(knex) {
  return knex.schema.createTable(tableName, (builder) => {
    builder.uuid("id").primary({ constraintName: "users_id_pk" });
    builder
      .string("email", 255)
      .unique({ indexName: "users_email_unique" })
      .notNullable();
    builder.string("password", 255).notNullable();

    builder.timestamp("created_at", { useTz: true }).notNullable();
    builder.timestamp("updated_at", { useTz: true }).notNullable();
  });
}

export async function down(knex) {
  return knex.schema.dropTable(tableName);
}
