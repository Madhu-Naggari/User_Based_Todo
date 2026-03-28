import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function successResponse({ message, data, status = 200, cookie } = {}) {
  const response = NextResponse.json(
    {
      success: true,
      ...(message ? { message } : {}),
      ...(typeof data !== "undefined" ? { data } : {}),
    },
    { status }
  );

  if (cookie) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }

  return response;
}

export function errorResponse({
  message = "Something went wrong.",
  status = 500,
  details,
  cookie,
} = {}) {
  const response = NextResponse.json(
    {
      success: false,
      message,
      ...(details ? { details } : {}),
    },
    { status }
  );

  if (cookie) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }

  return response;
}

export function withErrorHandling(handler) {
  return async function wrappedHandler(request, context) {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error?.name === "ZodError") {
        return errorResponse({
          message: "Validation failed.",
          status: 400,
          details: error.flatten ? error.flatten() : error.issues,
        });
      }

      if (error instanceof ApiError) {
        return errorResponse({
          message: error.message,
          status: error.status,
          details: error.details,
        });
      }

      console.error(error);

      return errorResponse({
        message: "Internal server error.",
        status: 500,
      });
    }
  };
}

export async function parseJsonBody(request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.");
  }
}
