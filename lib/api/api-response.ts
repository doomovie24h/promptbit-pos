import { NextResponse } from "next/server";

export class ApiResponse {
  static success<T>(
    data: T,
    message = "Success",
    status = 200,
  ) {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      {
        status,
      },
    );
  }

  static error(
    message = "Something went wrong",
    status = 500,
    errors?: unknown,
  ) {
    return NextResponse.json(
      {
        success: false,
        message,
        errors,
      },
      {
        status,
      },
    );
  }

  static created<T>(
    data: T,
    message = "Created successfully",
  ) {
    return this.success(data, message, 201);
  }

  static unauthorized(
    message = "Unauthorized",
  ) {
    return this.error(message, 401);
  }

  static forbidden(
    message = "Forbidden",
  ) {
    return this.error(message, 403);
  }

  static notFound(
    message = "Not found",
  ) {
    return this.error(message, 404);
  }

  static validation(
    errors: unknown,
    message = "Validation failed",
  ) {
    return this.error(message, 422, errors);
  }
}