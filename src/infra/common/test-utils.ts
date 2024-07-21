import postgres from "postgres";

import { jwt } from "../http/common";
import { bcryptHasher } from "./bcrypt-hasher";
import { cfg } from "./config";
import { genid } from "./genid";

const randomPass = () => genid().substring(0, 8);
const randomEmail = () => `${genid()}@example.com`;

export type Down = () => Promise<void>;
export function setupTest() {
  let sql: postgres.Sql;

  /**
   * Sets up the database connection.
   *
   * @returns {Down} A function to close the database connection.
   */
  function up(): Down {
    sql = postgres(cfg.databaseUrl, { max: 1 });
    return () => sql.end();
  }

  /**
   * Creates a new user in the database.
   *
   * @returns A promise that resolves to
   * an array containing:
   * - [0] The user id (string)
   * - [1] The user email (string)
   * - [2] The user's plain text password (string)
   */
  async function createUser(): Promise<[string, string, string]> {
    const plainTextPass = randomPass();
    const password = await bcryptHasher.hash(plainTextPass);
    const user = {
      id: genid(),
      email: randomEmail(),
      password,
      created_at: new Date(),
      updated_at: new Date(),
    };
    await sql`INSERT INTO users ${sql(user)}`;
    return [user.id, user.email, plainTextPass];
  }

  /**
   * Creates a new user and generates a token for the user.
   *
   * @returns A promise that resolves to
   * an array containing:
   * - [0] The generated token (string)
   * - [1] The user id (string)
   * - [2] The user email (string)
   * - [3] The user's plain text password (string)
   */
  async function createToken(): Promise<[string, string, string, string]> {
    const user = await createUser();
    return [jwt.sign(user[0]), ...user];
  }

  async function removeUser(id: string) {
    await sql`DELETE FROM users WHERE id=${id}`;
  }

  return { up, createUser, createToken, removeUser };
}
