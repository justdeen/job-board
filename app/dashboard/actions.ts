"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type DeleteResult = {
  success: boolean;
  message: string;
};

export async function deleteApplications(
  ids: string[],
  deleteAll = false
): Promise<DeleteResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be signed in to delete applications.",
      };
    }

    if (!deleteAll && ids.length === 0) {
      return {
        success: false,
        message: "Select at least one application.",
      };
    }

    await prisma.application.deleteMany({
      where: {
        userId: session.user.id,
        ...(deleteAll ? {} : { id: { in: ids } }),
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Applications deleted successfully.",
    };
  } catch (error) {
    console.error("Failed to delete applications:", error);

    return {
      success: false,
      message: "Could not delete applications. Please try again.",
    };
  }
}

export async function deletePostedJobs(
  ids: string[],
  deleteAll = false
): Promise<DeleteResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be signed in to delete jobs.",
      };
    }

    const userId = session.user.id;

    if (!deleteAll && ids.length === 0) {
      return {
        success: false,
        message: "Select at least one job.",
      };
    }

    // Only retrieve jobs owned by the current user.
    const jobs = await prisma.job.findMany({
      where: {
        postedById: userId,
        ...(deleteAll ? {} : { id: { in: ids } }),
      },
      select: {
        id: true,
      },
    });

    const jobIds = jobs.map((job) => job.id);

    if (jobIds.length === 0) {
      return {
        success: true,
        message: "No matching jobs to delete.",
      };
    }

    // Delete associated applications and jobs atomically.
    await prisma.$transaction([
      prisma.application.deleteMany({
        where: {
          jobId: { in: jobIds },
        },
      }),

      prisma.job.deleteMany({
        where: {
          id: { in: jobIds },
          postedById: userId,
        },
      }),
    ]);

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Jobs deleted successfully.",
    };
  } catch (error) {
    console.error("Failed to delete posted jobs:", error);

    return {
      success: false,
      message: "Could not delete jobs. Please try again.",
    };
  }
}