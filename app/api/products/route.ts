/**
 * @fileoverview Enterprise API Endpoint for Multi-Store / Multi-Business Products Management
 * @module app/api/products/route
 */

import { NextResponse } from "next/server";
import { getAuthCookie } from "@/lib/auth/cookie";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db/prisma";
import { cookies } from "next/headers";

async function getStrictStoreId(request: Request) {
  const token = await getAuthCookie();
  if (!token) throw new Error("Unauthenticated");

  const payload = await verifyToken(token);
  const userId = payload.userId as string;

  const url = new URL(request.url);
  const queryStoreId = url.searchParams.get("storeId");

  if (queryStoreId) {
    const membership = await db.storeMember.findFirst({
      where: { userId, storeId: queryStoreId },
    });
    if (membership) return queryStoreId;
  }

  try {
    const cookieStore = await cookies();
    const activeStoreId = cookieStore.get("storeId")?.value;
    if (activeStoreId) {
      const membership = await db.storeMember.findFirst({
        where: { userId, storeId: activeStoreId },
      });
      if (membership) return activeStoreId;
    }
  } catch (error) {
    // ignore
  }

  const member = await db.storeMember.findFirst({
    where: { userId },
  });

  if (!member) {
    throw new Error("Store not found");
  }

  return member.storeId;
}

export async function GET(request: Request) {
  try {
    const storeId = await getStrictStoreId(request);

    // ดึงข้อมูลร้านค้าเพื่อตรวจสอบประเภทธุรกิจ (Business Type) สำหรับใช้ปรับพฤติกรรมข้อมูลฝั่ง Backend
    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { id: true, name: true, businessType: true },
    });

    const products = await db.product.findMany({
      where: { storeId },
      include: {
        category: true,
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({
      success: true,
      storeInfo: store,
      data: products,
    });
  } catch (error: any) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch products" },
      { status: error?.message === "Unauthenticated" ? 401 : error?.message === "Store not found" ? 404 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const storeId = await getStrictStoreId(request);

    // ตรวจสอบประเภทธุรกิจของร้านค้าปัจจุบัน เพื่อแยก Business Logic ตามประเภท (Retail, Restaurant, Service, etc.)
    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { id: true, businessType: true },
    });

    const body = await request.json();
    const { 
      name, 
      price, 
      categoryId, 
      stock, 
      trackStock, 
      cost, 
      sku 
    } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json(
        { success: false, message: "Missing required product fields: name or price" },
        { status: 400 }
      );
    }

    let targetCategoryId = categoryId;

    if (!targetCategoryId || targetCategoryId === "" || targetCategoryId === "null") {
      let defaultCategory = await db.category.findFirst({
        where: {
          storeId,
          name: "ทั่วไป",
        },
      });

      if (!defaultCategory) {
        defaultCategory = await db.category.create({
          data: {
            storeId,
            name: "ทั่วไป",
          },
        });
      }
      targetCategoryId = defaultCategory.id;
    }

    // กำหนดค่าเฉพาะตามประเภทธุรกิจ (Dynamic Business Rules)
    let businessData = {};
    const businessType = store?.businessType ? String(store.businessType).toUpperCase() : "GENERAL";

    if (businessType === "RETAIL") {
      // ร้านค้าปลีก: เน้นการควบคุมคลังสินค้าและ SKU อย่างเข้มงวด
      businessData = {
        stock: Number(stock) || 0,
        trackStock: trackStock !== undefined ? Boolean(trackStock) : true,
        cost: Number(cost) || 0,
        sku: sku ? String(sku).trim() : null,
      };
    } else if (businessType === "RESTAURANT" || businessType === "CAFE") {
      // ร้านอาหาร/คาเฟ่: อาจจะไม่บังคับ trackStock ในระดับสินค้าสำเร็จรูปทันที (ขึ้นอยู่กับการตั้งค่า)
      businessData = {
        stock: Number(stock) || 0,
        trackStock: trackStock !== undefined ? Boolean(trackStock) : false,
        cost: Number(cost) || 0,
        sku: sku ? String(sku).trim() : null,
      };
    } else {
      // ธุรกิจบริการทั่วไป (Service / Other)
      businessData = {
        stock: Number(stock) || 0,
        trackStock: trackStock !== undefined ? Boolean(trackStock) : false,
        cost: Number(cost) || 0,
        sku: sku ? String(sku).trim() : null,
      };
    }

    const product = await db.product.create({
      data: {
        name: String(name).trim(),
        price: Number(price),
        ...businessData,
        store: {
          connect: { id: storeId },
        },
        category: {
          connect: { id: targetCategoryId },
        },
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error("Create product detailed error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error?.message || "Create product failed" 
      },
      { status: error?.message === "Unauthenticated" ? 401 : error?.message === "Store not found" ? 404 : 500 }
    );
  }
}