import { TaskStatus } from "@prisma/client";
import { z } from "zod";

import { normalizeEmail, sanitizeText } from "@/lib/sanitizers";

export const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email().max(120),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(8).max(72),
});

export const taskCreateSchema = z.object({
  title: z.string().min(3).max(80),
  description: z.string().max(400).optional().or(z.literal("")),
  status: z.nativeEnum(TaskStatus).optional(),
});

export const taskUpdateSchema = z
  .object({
    title: z.string().min(3).max(80).optional(),
    description: z.string().max(400).optional().or(z.literal("")),
    status: z.nativeEnum(TaskStatus).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

export function parseRegisterInput(payload) {
  const data = registerSchema.parse(payload);

  return {
    name: sanitizeText(data.name, { max: 60 }),
    email: normalizeEmail(data.email),
    password: data.password,
  };
}

export function parseLoginInput(payload) {
  const data = loginSchema.parse(payload);

  return {
    email: normalizeEmail(data.email),
    password: data.password,
  };
}

export function parseTaskCreateInput(payload) {
  const data = taskCreateSchema.parse(payload);

  return {
    title: sanitizeText(data.title, { max: 80 }),
    description: sanitizeText(data.description || "", {
      max: 400,
      preserveLines: true,
    }),
    status: data.status || TaskStatus.TODO,
  };
}

export function parseTaskUpdateInput(payload) {
  const data = taskUpdateSchema.parse(payload);
  const parsed = {};

  if (typeof data.title === "string") {
    parsed.title = sanitizeText(data.title, { max: 80 });
  }

  if (typeof data.description === "string") {
    parsed.description = sanitizeText(data.description, {
      max: 400,
      preserveLines: true,
    });
  }

  if (data.status) {
    parsed.status = data.status;
  }

  return parsed;
}
