import { PasswordHasher } from "../common";
import { UserRepo } from "./UserRepo";

export class Authenticate {
  constructor(
    private readonly repo: UserRepo,
    private readonly hasher: PasswordHasher,
  ) {}

  async perform(email: string, password: string) {
    const user = await this.repo.findByEmail(email);
    if (!user) return false;

    const isValid = await this.hasher.verify(password, user.password);
    if (!isValid) return false;

    return { id: user.id, email: user.email };
  }
}
