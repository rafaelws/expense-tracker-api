export type SafeUser = {
  id: string;
  email: string;
};

export type UnsafeUser = SafeUser & {
  password: string;
};

export interface UserRepo {
  findByEmail(email: string): Promise<UnsafeUser | null>;
  create(email: string, hashedPassword: string): Promise<SafeUser | null>;
}
