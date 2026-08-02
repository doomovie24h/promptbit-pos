import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {

  const token =
    request.cookies.get("token");

  const pathname =
    request.nextUrl.pathname;

  const protectedRoutes = [
    "/dashboard",
    "/cashier",
    "/products",
    "/categories",
    "/orders",
    "/customers",
    "/reports",
    "/settings",
  ];

  const isProtected =
    protectedRoutes.some(route =>
      pathname.startsWith(route)
    );

  if (isProtected && !token) {

    return NextResponse.redirect(
      new URL("/login", request.url)
    );

  }

  return NextResponse.next();

}

export const config = {

  matcher: [

    "/dashboard/:path*",
    "/cashier/:path*",
    "/products/:path*",
    "/categories/:path*",
    "/orders/:path*",
    "/customers/:path*",
    "/reports/:path*",
    "/settings/:path*",

  ],

};