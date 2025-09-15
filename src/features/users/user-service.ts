import { bcrypt } from "@/lib/bcrypt";
import { uuid } from "@/lib/uuid";

import type { UserEntity } from "./user-entity";
import type { UserRepository } from "./user-repository";
import type {
  AuthenticateUserDTO,
  CreateUserDTO,
  ExposableUser,
} from "./user-schema";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async createUser(dto: CreateUserDTO): Promise<ExposableUser | null> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (user) return null;

    const hashedPassword = await bcrypt.hash(dto.password);
    const now = new Date();

    const entity: UserEntity = {
      id: uuid(),
      email: dto.email,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    };

    const { id, email } = await this.userRepository.create(entity);
    return { id, email };
  }

  public async authenticateUser(
    dto: AuthenticateUserDTO,
  ): Promise<ExposableUser | null> {
    const entity = await this.userRepository.findByEmail(dto.email);
    if (!entity) return null;

    const isPasswordCorrect = await bcrypt.compare(
      dto.password,
      entity.password,
    );
    if (!isPasswordCorrect) return null;

    return { id: entity.id, email: entity.email };
  }
}
