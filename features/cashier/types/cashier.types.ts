export type Product = {
  id: string;

  name: string;

  price: number;

  categoryId?: string;

  category?: {
    id: string;

    name: string;
  };
};





export type CartItem = Product & {

  quantity: number;

};





export type PaymentMethod =
  | "CASH"
  | "PROMPTPAY"
  | "BANK"
  | "CARD";





export type CreateOrderItem = {

  productId: string;

  quantity: number;

  price: number;

};





export type CreateOrderPayload = {

  customerId?: string | null;

  tableId?: string | null;

  items: CreateOrderItem[];

  paymentMethod: PaymentMethod;

};





export type CashierState = {

  products: Product[];

  cart: CartItem[];

};





export type CartSummary = {

  subtotal: number;

  totalItems: number;

};





export type PaymentResult = {

  success: boolean;

  orderId?: string;

  message?: string;

};