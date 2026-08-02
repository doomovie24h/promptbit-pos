import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { StockMovementType, OrderStatus, OrderType, PaymentMethod, PaymentStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      items, 
      totalAmount, 
      subtotal, 
      discount = 0, 
      tax = 0, 
      serviceCharge = 0,
      paymentMethod = "CASH", 
      receivedAmount = 0, 
      changeAmount = 0, 
      customerId, 
      storeId, 
      userId,
      tableId,
      type = "TAKEAWAY"
    } = body;

    // ตรวจสอบข้อมูลเบื้องต้นที่ส่งมาจาก Frontend
    if (!items || !Array.isArray(items) || items.length === 0 || totalAmount === undefined || !storeId) {
      return NextResponse.json(
        { success: false, message: "Invalid transaction data or missing storeId" },
        { status: 400 }
      );
    }

    // ใช้ db.$transaction พร้อมกำหนด Type : any ให้กับ tx และ item ลูปย่อย
    const savedOrder = await db.$transaction(async (tx: any) => {
      
      // 1. วนลูปตรวจสอบสต็อก ตัดสต็อก และบันทึกประวัติ StockMovement
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
        });

        if (!product) {
          throw new Error(`ไม่พบสินค้า ID: ${item.id} ในระบบ`);
        }

        if (product.trackStock && product.stock < item.quantity) {
          throw new Error(`สินค้า "${product.name}" มีสต็อกไม่เพียงพอ (เหลือ ${product.stock} ชิ้น)`);
        }

        const newStock = product.stock - item.quantity;

        // อัปเดตสต็อกคงเหลือในตาราง Product
        await tx.product.update({
          where: { id: item.id },
          data: { stock: newStock },
        });

        // บันทึก Log การเคลื่อนไหวสต็อก
        await tx.stockMovement.create({
          data: {
            store: {
              connect: { id: storeId },
            },
            product: {
              connect: { id: item.id },
            },
            ...(userId ? {
              user: {
                connect: { id: userId },
              }
            } : {}),
            type: StockMovementType.SALE,
            quantity: -item.quantity, // ติดลบเนื่องจากเป็นการขายออก
            balanceAfter: newStock,
            notes: `ขายสินค้าผ่านระบบ POS`,
          },
        });
      }

      // 2. สร้างหมายเลขคำสั่งซื้อ (Order Number)
      const orderCount = await tx.order.count({ where: { storeId } });
      const orderNumber = `ORD-${String(orderCount + 1).padStart(4, "0")}`;

      // 3. บันทึกคำสั่งซื้อ (Order), รายการสินค้า (OrderItem) และการชำระเงิน (Payment)
      const order = await tx.order.create({
        data: {
          orderNumber,
          type: type as OrderType,
          status: OrderStatus.COMPLETED,
          subtotal: Number(subtotal || totalAmount),
          discount: Number(discount),
          tax: Number(tax),
          serviceCharge: Number(serviceCharge),
          total: Number(totalAmount),
          storeId,
          customerId: customerId || null,
          userId: userId || null,
          tableId: tableId || null,
          orderItems: {
            create: items.map((i: any) => ({
              productId: i.id,
              quantity: i.quantity,
              price: i.price,
              total: i.total || (i.price * i.quantity),
              unitName: i.unitName || "ชิ้น",
              conversionFactor: i.conversionFactor || 1,
            })),
          },
          payments: {
            create: {
              amount: Number(totalAmount),
              received: Number(receivedAmount || totalAmount),
              change: Number(changeAmount || 0),
              method: paymentMethod as PaymentMethod,
              status: PaymentStatus.PAID,
              storeId,
            },
          },
        },
        include: {
          orderItems: true,
          payments: true,
        },
      });

      return order;
    });

    console.log("Transaction recorded and stock updated successfully:", savedOrder.id);

    return NextResponse.json(
      {
        success: true,
        message: "Transaction recorded and stock updated successfully",
        data: savedOrder,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Error handling transaction API:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}