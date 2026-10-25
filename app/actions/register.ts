
"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import {prisma} from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: "Enter a valid email" }))
    .transform((email: string) => email.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export async function registerUser(formData: FormData) {
  const result = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? "Invalid details",
    };
  }

  const { name, email, password } = result.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      error: "User already exists!",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });
  } catch (error) {
    // Handle a duplicate email submitted by concurrent requests.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        error: "Unable to register with those details.",
      };
    }

    throw error;
  }

  return { success: true };
}
