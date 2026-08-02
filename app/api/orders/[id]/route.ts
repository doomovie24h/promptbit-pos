/**
 * @fileoverview Enterprise API Endpoint for Single Order Management
 * @module app/api/orders/[id]/route
 */

import { NextResponse } from "next/server";
import { getAuthCookie } from "@/lib/auth/cookie";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    const userId = payload.userId as string;

    const member = await db.storeMember.findFirst({ where: { userId } });
    if (!member) {
      return NextResponse.json({ success: false, message: "Store not found" }, { status: 404 });
    }

    const body = await request.json();
    const rawStatus = (body.status || "").toUpperCase();

    // แปลงสถานะให้ตรงกับ Prisma Enum (WAITING, COOKING, READY, COMPLETED, CANCELLED)
    let dbStatus = "WAITING";
    if (rawStatus === "COOKING" || rawStatus === "cooking") dbStatus = "COOKING";
    else if (rawStatus === "READY" || rawStatus === "ready") dbStatus = "READY";
    else if (rawStatus === "COMPLETED" || rawStatus === "completed" || rawStatus === "done") dbStatus = "COMPLETED";

    const updatedOrder = await db.order.update({
      where: {
        id: id,
        storeId: member.storeId,
      },
      data: {
        status: dbStatus as any,
      },
      include: {
        orderItems: { include: { product: true } },
        payments: true,
        customer: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json({ success: false, message: "Failed to update order status" }, { status: 500 });
  }
}