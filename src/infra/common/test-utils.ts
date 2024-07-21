import postgres from "postgres";

import { jwt } from "../http/common";
import { bcryptHasher } from "./bcrypt-hasher";
import { cfg } from "./config";
import { genid } from "./genid";

const randomPass = () => genid().substring(0, 8);
const randomEmail = () => `${genid()}@example.com`;

export function setupTest() {
  let sql: postgres.Sql;

  let isClearing = false;
  let createdUsers: string[] = [];

  /**
   * Creates a new user with a random password, stores it in the database,
   * and adds the user ID to the list of created users.
   *
   * @returns
   * An object containing the new user's id, email, and plaintext password.
   */
  async function createUser() {
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
    createdUsers.push(user.id);
    return { id: user.id, email: user.email, password: plainTextPass };
  }

  /**
   * Creates a new user and generates a JWT token for the user.
   *
   * @returns The JWT token for the new user.
   */
  async function createToken() {
    const user = await createUser();
    return jwt.sign(user.id);
  }

  async function removeUserByEmail(email: string) {
    await sql`DELETE FROM users WHERE email=${email}`;
  }

  async function removeUserById(id: string) {
    await sql`DELETE FROM users WHERE id=${id}`;
  }

  /**
   * Sets up the database connection.
   *
   * This function should be called in the `beforeAll` block to initialize
   * the database connection before the tests start.
   */
  function up() {
    sql = postgres(cfg.databaseUrl, { max: 1 });
  }

  /**
   * Clears all created users from the database. This function ensures that
   * all users created during the tests are removed. It should be called in
   * the `afterEach` block to clean up the state between individual tests.
   */
  async function clear() {
    if (isClearing) return;
    isClearing = true;

    try {
      if (createdUsers.length > 0) {
        await Promise.all(createdUsers.map((id) => removeUserById(id)));
        createdUsers = [];
      }
    } catch (error) {
      // eslint-disable-next-line
      console.error("test-util: Error on clear()\n", error);
    } finally {
      isClearing = false;
    }
  }

  /**
   * Tears down the database connection and removes all created users.
   *
   * This function should be called in the `afterAll` block to clean up the
   * database connection and ensure that all users created during the tests
   * are removed. It ensures proper teardown of the testing environment.
   */
  async function down() {
    try {
      await clear();
    } finally {
      if (sql) {
        await sql.end();
      }
    }
  }

  return {
    up,
    down,
    clear,
    createUser,
    createToken,
    removeUserById,
    removeUserByEmail,
    randomPass,
    randomEmail,
  };
}
