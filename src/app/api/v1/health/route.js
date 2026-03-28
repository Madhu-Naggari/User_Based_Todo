import { successResponse } from "@/lib/api";

export async function GET() {
  return successResponse({
    data: {
      status: "ok",
      version: "v1",
      timestamp: new Date().toISOString(),
    },
  });
}
