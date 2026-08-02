import type { RegisterInput } from "../schemas/register.schema";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

export type RegisterRequest = RegisterInput;

export type RegisterResponse = {
  user: AuthUser;

  store: {
    id: string;
    name: string;
    slug: string;
  };
};