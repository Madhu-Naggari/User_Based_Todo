import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import { ApiError } from "@/lib/api";
import { appConfig } from "@/lib/config";
import { prisma } from "@/lib/prisma";

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  };
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    appConfig.jwtSecret,
    { expiresIn: appConfig.jwtExpiresIn }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, appConfig.jwtSecret);
  } catch {
    return null;
  }
}

export function getSessionCookie(token) {
  return {
    name: appConfig.jwtCookieName,
    value: token,
    options: getCookieOptions(),
  };
}

export function getClearedSessionCookie() {
  return {
    name: appConfig.jwtCookieName,
    value: "",
    options: {
      ...getCookieOptions(),
      maxAge: 0,
    },
  };
}

export function getTokenFromRequest(request) {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "").trim();
  }

  return request.cookies.get(appConfig.jwtCookieName)?.value || null;
}

export async function requireAuth(request) {
  const token = getTokenFromRequest(request);

  if (!token) {
    throw new ApiError(401, "Authentication required.");
  }

  const payload = verifyToken(token);

  if (!payload?.sub) {
    throw new ApiError(401, "Invalid or expired token.");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "User no longer exists.");
  }

  return user;
}

export async function requireRole(request, role) {
  const user = await requireAuth(request);

  if (user.role !== role) {
    throw new ApiError(403, "You do not have permission to access this resource.");
  }

  return user;
}

export async function getCurrentUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(appConfig.jwtCookieName)?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  if (!payload?.sub) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}
