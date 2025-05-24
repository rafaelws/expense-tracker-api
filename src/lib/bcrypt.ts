import { compare, hash } from "bcryptjs";

const saltLength = 10;

export const bcrypt = {
  compare(plainText: string, hash: string) {
    return compare(plainText, hash);
  },
  hash(plainText: string) {
    return hash(plainText, saltLength);
  },
};
