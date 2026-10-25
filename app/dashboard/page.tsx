import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

import DashboardList from "./DashboardList";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const [applications, postedJobs] = await Promise.all([
    // Fetch the user's applications.
    prisma.application.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        appliedAt: true,
        status: true,
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            type: true,
          },
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
    }),

    // Fetch jobs posted by the user.
    prisma.job.findMany({
      where: {
        postedById: session.user.id,
      },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        type: true,
        postedAt: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        postedAt: "desc",
      },
    }),
  ]);

  return (
    <DashboardList
      applications={applications}
      postedJobs={postedJobs}
    />
  );
}