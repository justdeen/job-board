"use server";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export const login = async () => {
  await signIn("github", { redirectTo: "/" });
};

export const loginWithCredentials = async (
  email: string,
  password: string
) => {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }

    // Let Next.js handle the redirect thrown after a successful sign-in.
    throw error;
  }
};


export const logout = async () => {
  await signOut({ redirectTo: "/auth/signin" });
};

