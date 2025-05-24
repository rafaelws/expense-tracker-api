export type UserDb = {
  id: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
};

export type UserEntity = {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

export const toUserDb = ({
  createdAt,
  updatedAt,
  ...user
}: UserEntity): UserDb => ({
  ...user,
  created_at: createdAt,
  updated_at: updatedAt,
});

export const toUserEntity = ({
  created_at,
  updated_at,
  ...user
}: UserDb): UserEntity => ({
  ...user,
  createdAt: created_at,
  updatedAt: updated_at,
});
