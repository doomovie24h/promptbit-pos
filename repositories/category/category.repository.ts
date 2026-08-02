import { db } from "@/lib/db/prisma";

export class CategoryRepository {
  async findAll(storeId: string) {
    return db.category.findMany({
      where: {
        storeId,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async findById(id: string, storeId: string) {
    return db.category.findFirst({
      where: {
        id,
        storeId,
      },
    });
  }

  async create(data: {
    name: string;
    storeId: string;
  }) {
    return db.category.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      name: string;
    }
  ) {
    return db.category.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string) {
    return db.category.delete({
      where: {
        id,
      },
    });
  }
}

export const categoryRepository = new CategoryRepository();