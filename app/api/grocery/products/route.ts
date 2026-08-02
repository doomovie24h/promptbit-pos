import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

async function getActiveStoreId(cookieStore: any) {
  let storeId =
    cookieStore.get("active_store_id")?.value ||
    cookieStore.get("storeId")?.value;
  if (storeId) return storeId;

  const firstStore = await db.store.findFirst();
  return firstStore ? firstStore.id : null;
}

// 1. GET: ดึงรายการสินค้าทั้งหมด หรือ ค้นหาสินค้า
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParam = 
      url.searchParams.get("barcode") || 
      url.searchParams.get("q") || 
      url.searchParams.get("query") ||
      url.searchParams.get("search");
    const limit = url.searchParams.get("limit");

    const cookieStore = await cookies();
    const storeId = await getActiveStoreId(cookieStore);

    if (searchParam) {
      const cleanKeyword = searchParam.trim();

      const product = await db.product.findFirst({
        where: {
          OR: [
            { sku: cleanKeyword },
            { sku: { contains: cleanKeyword, mode: "insensitive" } },
            { name: { contains: cleanKeyword, mode: "insensitive" } },
          ],
        },
        include: { category: true },
      });

      if (!product) {
        return NextResponse.json(
          { success: false, message: `ไม่พบบาร์โค้ด: ${cleanKeyword}` },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: product });
    }

    const products = await db.product.findMany({
      where: storeId ? { storeId: storeId } : undefined,
      orderBy: { id: "desc" },
      take: limit ? parseInt(limit) : undefined,
      include: { category: true },
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    console.error("Fetch Products Error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า", error: error?.message },
      { status: 500 }
    );
  }
}

// 2. POST: บันทึกสินค้าใหม่ลงฐานข้อมูลจริง
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, barcode, sku, price, cost, stockQuantity, stock, categoryId } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกชื่อสินค้าและราคาขาย" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const storeId = await getActiveStoreId(cookieStore);

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลร้านค้า กรุณาเลือกสาขาก่อนเพิ่มสินค้า" },
        { status: 400 }
      );
    }

    const qtyValue = stockQuantity !== undefined ? stockQuantity : stock;
    const finalSku = barcode || sku;

    let finalCategoryId = categoryId;
    if (!finalCategoryId) {
      let defaultCategory = await db.category.findFirst({
        where: { storeId: storeId },
      });
      if (!defaultCategory) {
        defaultCategory = await db.category.create({
          data: { storeId: storeId, name: "ทั่วไป" },
        });
      }
      finalCategoryId = defaultCategory.id;
    }

    const newProduct = await db.product.create({
      data: {
        storeId: storeId,
        name: name.trim(),
        sku: finalSku ? String(finalSku).trim() : null,
        price: parseFloat(price),
        cost: cost ? parseFloat(cost) : 0,
        stock: qtyValue ? parseInt(qtyValue) : 0,
        categoryId: finalCategoryId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "เพิ่มสินค้าลงระบบสำเร็จ",
      data: newProduct,
    });
  } catch (error: any) {
    console.error("Create Product Error:", error);
    return NextResponse.json(
      { success: false, message: "ไม่สามารถบันทึกสินค้าลงฐานข้อมูลได้", error: error?.message },
      { status: 500 }
    );
  }
}

// 3. PUT: แก้ไขข้อมูลสินค้า
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, barcode, sku, price, cost, stockQuantity, stock, categoryId } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ไม่พบ ID สินค้าที่ต้องการแก้ไข" },
        { status: 400 }
      );
    }

    const qtyValue = stockQuantity !== undefined ? stockQuantity : stock;
    const finalSku = barcode !== undefined ? barcode : sku;

    const updatedProduct = await db.product.update({
      where: { id: id },
      data: {
        name: name ? name.trim() : undefined,
        sku: finalSku !== undefined ? (finalSku ? String(finalSku).trim() : null) : undefined,
        price: price ? parseFloat(price) : undefined,
        cost: cost !== undefined ? parseFloat(cost) : undefined,
        stock: qtyValue !== undefined ? parseInt(qtyValue) : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว",
      data: updatedProduct,
    });
  } catch (error: any) {
    console.error("Update Product Error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการแก้ไขสินค้า", error: error?.message },
      { status: 500 }
    );
  }
}

// 4. DELETE: ลบสินค้า
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุ ID สินค้าที่ต้องการลบ" },
        { status: 400 }
      );
    }

    await db.product.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: "ลบสินค้าสำเร็จ",
    });
  } catch (error: any) {
    console.error("Delete Product Error:", error);
    return NextResponse.json(
      { success: false, message: "ไม่สามารถลบสินค้าได้", error: error?.message },
      { status: 500 }
    );
  }
}