import { describe, expect, it, vi } from "vitest";

import { PasswordHasher } from "../common";
import { Authenticate } from "./Authenticate";
import { UserRepo } from "./UserRepo";

describe("Authenticate", () => {
  it("should return false if the user is not found (by email)", async () => {
    const repo = {
      findByEmail: vi.fn().mockResolvedValue(null),
    } as unknown as UserRepo;
    const hasher = {} as PasswordHasher;
    const auth = new Authenticate(repo, hasher);

    const result = await auth.perform("email@example.com", "password");

    expect(result).toBe(false);
  });

  it("should return false if the password is invalid", async () => {
    const repo = {
      findByEmail: vi.fn().mockResolvedValue({
        email: "email@example.com",
        password: "hashedPassword",
      }),
    } as unknown as UserRepo;
    const hasher = {
      verify: vi.fn().mockResolvedValue(false),
    } as unknown as PasswordHasher;
    const auth = new Authenticate(repo, hasher);

    const result = await auth.perform("email@example.com", "password");

    expect(result).toBe(false);
  });

  it("should authenticate successfully", async () => {
    const user = {
      id: "uuid",
      email: "email@example.com",
      password: "hashedPassword",
    };
    const repo = {
      findByEmail: vi.fn().mockResolvedValue(user),
    } as unknown as UserRepo;
    const hasher = {
      verify: vi.fn().mockResolvedValue(true),
    } as unknown as PasswordHasher;
    const auth = new Authenticate(repo, hasher);

    const result = await auth.perform("email@example.com", "password");

    expect(result).toEqual({ id: user.id, email: user.email });
  });

  it("should call findByEmail and match arguments", async () => {
    const email = "email@example.com";
    const user = { email, password: "hashedPassword" };
    const repo = {
      findByEmail: vi.fn().mockResolvedValue(user),
    } as unknown as UserRepo;
    const hasher = {
      verify: vi.fn().mockResolvedValue(true),
    } as unknown as PasswordHasher;
    const auth = new Authenticate(repo, hasher);

    await auth.perform(email, "password");

    expect(repo.findByEmail).toHaveBeenCalledWith(email);
    expect(hasher.verify).toHaveBeenCalledWith("password", user.password);
  });
});
