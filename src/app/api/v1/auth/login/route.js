import { prisma } from "@/lib/prisma";
import {
  parseJsonBody,
  successResponse,
  withErrorHandling,
  ApiError,
} from "@/lib/api";
import {
  comparePassword,
  createToken,
  getSessionCookie,
} from "@/lib/auth";
import { parseLoginInput } from "@/lib/validators";

export const POST = withErrorHandling(async function POST(request) {
  const payload = await parseJsonBody(request);
  const input = parseLoginInput(payload);

  const userRecord = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!userRecord) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordValid = await comparePassword(
    input.password,
    userRecord.passwordHash
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const user = {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    role: userRecord.role,
    createdAt: userRecord.createdAt,
  };

  const token = createToken(user);

  return successResponse({
    message: "Login successful.",
    data: {
      user,
      token,
    },
    cookie: getSessionCookie(token),
  });
});
