export const USER_ROLE = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  CASHIER: "CASHIER",
  KITCHEN: "KITCHEN",
  WAITER: "WAITER",
} as const;

export type UserRole =
  (typeof USER_ROLE)[keyof typeof USER_ROLE];