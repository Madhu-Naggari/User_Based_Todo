import { prisma } from "@/lib/prisma";
import {
  parseJsonBody,
  successResponse,
  withErrorHandling,
} from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { parseTaskCreateInput } from "@/lib/validators";

function buildTaskWhereClause(user, scope) {
  if (user.role === "ADMIN" && scope === "all") {
    return {};
  }

  return {
    ownerId: user.id,
  };
}

export const GET = withErrorHandling(async function GET(request) {
  const user = await requireAuth(request);
  const scope = new URL(request.url).searchParams.get("scope") || "mine";

  const tasks = await prisma.task.findMany({
    where: buildTaskWhereClause(user, scope),
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return successResponse({
    data: {
      tasks,
    },
  });
});

export const POST = withErrorHandling(async function POST(request) {
  const user = await requireAuth(request);
  const payload = await parseJsonBody(request);
  const input = parseTaskCreateInput(payload);

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description || null,
      status: input.status,
      ownerId: user.id,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return successResponse({
    status: 201,
    message: "Task created successfully.",
    data: {
      task,
    },
  });
});
