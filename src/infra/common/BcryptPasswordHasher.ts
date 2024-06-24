import bcrypt from "bcryptjs";

import { PasswordHasher } from "@/features/common";

const saltLength = 10;

export class PasswordHasherService implements PasswordHasher {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, saltLength);
  }

  verify(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
