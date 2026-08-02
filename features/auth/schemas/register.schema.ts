import { z } from "zod";

export const registerSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email address")
      .trim()
      .toLowerCase(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long"),

    confirmPassword: z
      .string()
      .min(8, "Confirm password is required"),

    storeName: z
      .string()
      .min(2, "Store name must be at least 2 characters")
      .max(100, "Store name is too long")
      .trim(),

    storeSlug: z
      .string()
      .min(3, "Store slug must be at least 3 characters")
      .max(50, "Store slug is too long")
      .regex(
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers and hyphens",
      ),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );

export type RegisterInput = z.infer<typeof registerSchema>;