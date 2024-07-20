import bcrypt from "bcryptjs";

import { PasswordHasher } from "@/features/common";

const saltLength = 10;

export const bcryptHasher = {
  hash(password) {
    return bcrypt.hash(password, saltLength);
  },
  verify(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  },
} satisfies PasswordHasher;
