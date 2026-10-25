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
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null
        }

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user?.passwordHash) {
          return null
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
});
