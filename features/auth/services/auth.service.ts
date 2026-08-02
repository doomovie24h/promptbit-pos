import bcrypt from "bcryptjs";

import { AuthRepository } from "../repositories/auth.repository";
import { RegisterInput } from "../schemas/register.schema";
import { RegisterResponse } from "../types/auth.types";


export class AuthService {

  private repository: AuthRepository;


  constructor() {
    this.repository = new AuthRepository();
  }


  async register(
    input: RegisterInput,
  ): Promise<RegisterResponse> {


    const existingUser =
      await this.repository.findUserByEmail(
        input.email,
      );


    if (existingUser) {
      throw new Error(
        "Email already exists",
      );
    }


    const existingStore =
      await this.repository.findStoreBySlug(
        input.storeSlug,
      );


    if (existingStore) {
      throw new Error(
        "Store slug already exists",
      );
    }


    const passwordHash =
      await bcrypt.hash(
        input.password,
        12,
      );


    const store =
      await this.repository.createStore({
        name: input.storeName,
        slug: input.storeSlug,
      });


    const user =
      await this.repository.createUser({
        email: input.email,
        password: passwordHash,
        storeId: store.id,
      });


    await this.repository.createStoreMember({
      userId: user.id,
      storeId: store.id,
      role: "OWNER",
    });


    return {
      user: {
        id: user.id,
        email: user.email!, // เติมเครื่องหมาย ! เพื่อป้องกัน Type 'null' ไม่ให้ชนกับ RegisterResponse
        role: "OWNER",
      },

      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
      },
    };
  }
}