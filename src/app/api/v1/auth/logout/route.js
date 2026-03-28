import { successResponse } from "@/lib/api";
import { getClearedSessionCookie } from "@/lib/auth";

export async function POST() {
  return successResponse({
    message: "Logout successful.",
    data: null,
    cookie: getClearedSessionCookie(),
  });
}
