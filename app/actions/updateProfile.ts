"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function UpdateUserProfile(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Name is required." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  if (user?.name?.trim() === name) {
    return { error: "The name hasn't changed." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  revalidatePath("/profile");
  redirect("/profile?success=1");
}