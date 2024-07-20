import { Authenticate } from "@/features/users/Authenticate";
import { CreateUser } from "@/features/users/CreateUser";
import { bcryptHasher } from "@/infra/common";
import { DatabaseUserRepo } from "@/infra/db/users/DatabaseUserRepo";

const userRepo = new DatabaseUserRepo();

export const UserUseCaseFactory = {
  createUser() {
    return new CreateUser(userRepo, bcryptHasher);
  },
  authenticate() {
    return new Authenticate(userRepo, bcryptHasher);
  },
};
