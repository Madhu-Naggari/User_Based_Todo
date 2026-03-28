import { prisma } from "@/lib/prisma";
import {
  ApiError,
  parseJsonBody,
  successResponse,
  withErrorHandling,
} from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { parseTaskUpdateInput } from "@/lib/validators";

async function getAccessibleTask(taskId, user) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
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

  if (!task) {
    throw new ApiError(404, "Task not found.");
  }

  if (user.role !== "ADMIN" && task.ownerId !== user.id) {
    throw new ApiError(403, "You cannot access this task.");
  }

  return task;
}

export const GET = withErrorHandling(async function GET(request, context) {
  const user = await requireAuth(request);
  const { id } = await context.params;
  const task = await getAccessibleTask(id, user);

  return successResponse({
    data: {
      task,
    },
  });
});

export const PUT = withErrorHandling(async function PUT(request, context) {
  const user = await requireAuth(request);
  const { id } = await context.params;
  await getAccessibleTask(id, user);

  const payload = await parseJsonBody(request);
  const input = parseTaskUpdateInput(payload);

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(typeof input.title === "string" ? { title: input.title } : {}),
      ...(Object.prototype.hasOwnProperty.call(input, "description")
        ? { description: input.description || null }
        : {}),
      ...(input.status ? { status: input.status } : {}),
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
    message: "Task updated successfully.",
    data: {
      task,
    },
  });
});

export const DELETE = withErrorHandling(async function DELETE(request, context) {
  const user = await requireAuth(request);
  const { id } = await context.params;
  await getAccessibleTask(id, user);

  await prisma.task.delete({
    where: { id },
  });

  return successResponse({
    message: "Task deleted successfully.",
    data: null,
  });
});
