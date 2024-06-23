import { PasswordHasher } from "../common";
import { UserRepo } from "./UserRepo";

export class CreateUser {
  constructor(
    private readonly repo: UserRepo,
    private readonly hasher: PasswordHasher,
  ) {}

  async perform(email: string, password: string, passwordConfirmation: string) {
    if (password !== passwordConfirmation) return null;
    // TODO check password length, complexity?

    const user = await this.repo.findByEmail(email);
    if (user) return null;

    const hashedPassword = await this.hasher.hash(password);
    return this.repo.create(email, hashedPassword);
  }
}
