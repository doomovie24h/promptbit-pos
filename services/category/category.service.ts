import { z } from "zod";

import {
  categoryRepository,
} from "@/repositories/category/category.repository";

const createCategorySchema = z.object({
  name: z.string().min(2),
});

export class CategoryService {
  async getCategories(
    storeId: string
  ) {
    return categoryRepository.findAll(
      storeId
    );
  }

  async createCategory(
    storeId: string,
    body: unknown
  ) {
    const data =
      createCategorySchema.parse(body);

    return categoryRepository.create({
      ...data,
      storeId,
    });
  }

  async updateCategory(
    id: string,
    body: unknown
  ) {
    const data =
      createCategorySchema.parse(body);

    return categoryRepository.update(
      id,
      data
    );
  }

  async deleteCategory(
    id: string
  ) {
    return categoryRepository.delete(id);
  }
}

export const categoryService =
  new CategoryService();