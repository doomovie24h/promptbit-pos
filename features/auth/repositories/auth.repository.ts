import { db } from "@/lib/db/prisma";

export class AuthRepository {
  async findUserByEmail(email: string) {
    return db.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findStoreBySlug(slug: string) {
    return db.store.findUnique({
      where: {
        slug,
      },
    });
  }

  async createStore(data: {
    name: string;
    slug: string;
  }) {
    return db.store.create({
      data,
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    storeId: string;
  }) {
    return db.user.create({
      data: {
        email: data.email,
        password: data.password,
      },
    });
  }

  async createStoreMember(data: {
    userId: string;
    storeId: string;
    role: "OWNER";
  }) {
    return db.storeMember.create({
      data,
    });
  }
}