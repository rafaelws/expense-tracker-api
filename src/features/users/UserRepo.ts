export type User = {
  id: string;
  email: string;
  password: string;
};

export interface UserRepo {
  findByEmail(email: string): Promise<User | null>;
}
