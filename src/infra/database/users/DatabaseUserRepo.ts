import { SafeUser, UnsafeUser, UserRepo } from "@/features/users/UserRepo";
import { genid } from "@/infra/common";

const users: UnsafeUser[] = [];

// FIXME
export class DatabaseUserRepo implements UserRepo {
  async findByEmail(email: string): Promise<UnsafeUser | null> {
    const found = users.find((user) => user.email === email);
    return found ? found : null;
  }

  async create(
    email: string,
    hashedPassword: string,
  ): Promise<SafeUser | null> {
    const user = { id: genid(), email };
    users.push({ ...user, password: hashedPassword });
    return user;
  }
}
