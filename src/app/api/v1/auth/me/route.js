import { successResponse, withErrorHandling } from "@/lib/api";
import { requireAuth } from "@/lib/auth";

export const GET = withErrorHandling(async function GET(request) {
  const user = await requireAuth(request);

  return successResponse({
    data: {
      user,
    },
  });
});
