import { successResponse, withErrorHandling } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const GET = withErrorHandling(async function GET(request) {
  await requireRole(request, "ADMIN");

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  return successResponse({
    data: {
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        taskCount: user._count.tasks,
      })),
    },
  });
});
