import { prisma } from "@/lib/prisma";
import {
  parseJsonBody,
  successResponse,
  withErrorHandling,
  ApiError,
} from "@/lib/api";
import { createToken, getSessionCookie, hashPassword } from "@/lib/auth";
import { parseRegisterInput } from "@/lib/validators";

export const POST = withErrorHandling(async function POST(request) {
  const payload = await parseJsonBody(request);
  const input = parseRegisterInput(payload);

  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new ApiError(409, "A user with that email already exists.");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const token = createToken(user);

  return successResponse({
    status: 201,
    message: "Registration successful.",
    data: {
      user,
      token,
    },
    cookie: getSessionCookie(token),
  });
});
