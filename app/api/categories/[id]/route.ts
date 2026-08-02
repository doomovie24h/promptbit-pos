import { NextResponse } from "next/server";

import { db } from "@/lib/db/prisma";
import { getAuthCookie } from "@/lib/auth/cookie";
import { verifyToken } from "@/lib/auth/jwt";

async function getStoreId() {
  const token = await getAuthCookie();

  if (!token) {
    throw new Error("Unauthenticated");
  }

  const payload = await verifyToken(token);

  const userId = payload.userId as string;

  const member = await db.storeMember.findFirst({
    where: {
      userId,
    },
  });

  if (!member) {
    throw new Error("Store not found");
  }

  return member.storeId;
}

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await params;

    const storeId = await getStoreId();

    const body = await request.json();

    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name is required",
        },
        {
          status: 400,
        }
      );
    }

    const category = await db.category.findFirst({
      where: {
        id,
        storeId,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        {
          status: 404,
        }
      );
    }

    const duplicated = await db.category.findFirst({
      where: {
        storeId,
        name,
        NOT: {
          id,
        },
      },
    });

    if (duplicated) {
      return NextResponse.json(
        {
          success: false,
          message: "Category already exists",
        },
        {
          status: 409,
        }
      );
    }

    const updated = await db.category.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Update category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Update category failed",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await params;

    const storeId = await getStoreId();

    const category = await db.category.findFirst({
      where: {
        id,
        storeId,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        {
          status: 404,
        }
      );
    }

    const productCount = await db.product.count({
      where: {
        categoryId: id,
        storeId,
      },
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete category because products still exist.",
        },
        {
          status: 400,
        }
      );
    }

    await db.category.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Delete category failed",
      },
      {
        status: 500,
      }
    );
  }
}