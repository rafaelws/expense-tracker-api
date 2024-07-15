import { Authenticate } from "@/features/users/Authenticate";
import { CreateUser } from "@/features/users/CreateUser";
import { PasswordHasherService } from "@/infra/common";
import { DatabaseUserRepo } from "@/infra/db/users/DatabaseUserRepo";

const hasher = new PasswordHasherService();
const userRepo = new DatabaseUserRepo();

export const UserUseCaseFactory = {
  createUser() {
    return new CreateUser(userRepo, hasher);
  },
  authenticate() {
    return new Authenticate(userRepo, hasher);
  },
};
