export const PAYMENT_METHOD = {
  CASH: "CASH",
  QR: "QR",
  CARD: "CARD",
  TRANSFER: "TRANSFER",
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];