import { successResponse, withErrorHandling } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const GET = withErrorHandling(async function GET(request) {
  await requireRole(request, "ADMIN");

  const [users, tasks] = await Promise.all([
    prisma.user.findMany({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.task.findMany({
      select: {
        ownerId: true,
      },
    }),
  ]);

  const taskCounts = tasks.reduce((counts, task) => {
    counts[task.ownerId] = (counts[task.ownerId] || 0) + 1;
    return counts;
  }, {});

  return successResponse({
    data: {
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        taskCount: taskCounts[user.id] || 0,
      })),
    },
  });
});
