// "use server";
// import { signIn, signOut } from "@/auth";

// export const login = async () => {
//   await signIn("github", { redirectTo: "/" });
// };

// export const logout = async () => {
//   await signOut({ redirectTo: "/auth/signin" });
// };

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
});
