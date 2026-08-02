/**
 * @fileoverview Enterprise API Endpoint for Single Product Operations (GET, PUT, DELETE)
 * @module app/api/products/[id]/route
 */

import { NextResponse } from "next/server";
import { getAuthCookie } from "@/lib/auth/cookie";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db/prisma";
import { ProductService } from "@/services/product/product.service";
import { cookies } from "next/headers";

const productService = new ProductService();

async function getStoreId(request: Request) {
  const token = await getAuthCookie();
  if (!token) {
    throw new Error("Unauthenticated");
  }

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storeId = await getStoreId(request);

    const product = await productService.getProductById(storeId, id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error("Product GET ID error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed loading product",
      },
      { status: error?.message === "Unauthenticated" ? 401 : error?.message === "Store not found" ? 404 : 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storeId = await getStoreId(request);
    const body = await request.json();

    const existingProduct = await productService.getProductById(storeId, id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const updatePayload: any = {
      name: body.name ? String(body.name).trim() : existingProduct.name,
      price: body.price !== undefined && body.price !== "" ? Number(body.price) : existingProduct.price,
      categoryId: body.categoryId !== undefined ? (body.categoryId === "" ? null : body.categoryId) : (existingProduct as any).categoryId,
    };

    const updated = await productService.updateProduct(storeId, id, updatePayload);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error("Product PUT error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Update failed",
      },
      { status: error?.message === "Unauthenticated" ? 401 : error?.message === "Store not found" ? 404 : 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const storeId = await getStoreId(request);

    const deleted = await productService.deleteProduct(storeId, id);

    return NextResponse.json({
      success: true,
      data: deleted,
    });
  } catch (error: any) {
    console.error("Product DELETE error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Delete failed",
      },
      { status: error?.message === "Unauthenticated" ? 401 : error?.message === "Store not found" ? 404 : 500 }
    );
  }
}