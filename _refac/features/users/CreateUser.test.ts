import { describe, expect, it, vi } from "vitest";

import { PasswordHasher } from "../common";
import { CreateUser } from "./CreateUser";
import { UserRepo } from "./UserRepo";

describe("CreateUser", () => {
  it("should return null if the password confirmation mismatch", async () => {
    const email = "email@example.com";
    const repo = {} as unknown as UserRepo;
    const hasher = {} as unknown as PasswordHasher;
    const createUser = new CreateUser(repo, hasher);

    const result = await createUser.perform(email, "password", "not-password");
    expect(result).toEqual(null);
  });

  it("should return null if the email provided already exist", async () => {
    const email = "email@example.com";
    const repo = {
      findByEmail: vi.fn().mockResolvedValue({
        id: "generatedUuid",
        password: "hashedPassword",
        email,
      }),
    } as unknown as UserRepo;
    const hasher = {} as unknown as PasswordHasher;
    const createUser = new CreateUser(repo, hasher);

    const result = await createUser.perform(email, "password", "password");
    expect(result).toEqual(null);
    expect(repo.findByEmail).toHaveBeenCalledWith(email);
  });

  it("should create a user", async () => {
    const email = "email@example.com";
    const password = "password";
    const hashedPassword = "hashedPassword";
    const safeUser = { id: "generatedUuid", email };
    const repo: UserRepo = {
      findByEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(safeUser),
    };
    const hasher = {
      hash: vi.fn().mockResolvedValue(hashedPassword),
    } as unknown as PasswordHasher;
    const createUser = new CreateUser(repo, hasher);

    const result = await createUser.perform(email, password, password);

    expect(hasher.hash).toHaveBeenCalledWith(password);
    expect(repo.findByEmail).toHaveBeenCalledWith(email);
    expect(repo.create).toHaveBeenCalledWith(email, hashedPassword);
    expect(result).toEqual({ ...safeUser });
  });
});
