"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import {
  deleteApplications,
  deletePostedJobs,
} from "./actions";

type PostedJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postedAt: Date;
  _count: {
    applications: number;
  };
};

type ApplicationItem = {
  id: string;
  appliedAt: Date;
  status: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
  };
};

type DashboardListProps = {
  postedJobs: PostedJob[];
  applications: ApplicationItem[];
};

export default function DashboardList({
  postedJobs,
  applications,
}: DashboardListProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [optimisticJobs, setOptimisticJobs] =
    useOptimistic(postedJobs);

  const [optimisticApplications, setOptimisticApplications] =
    useOptimistic(applications);

  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [selectedApplications, setSelectedApplications] =
    useState<string[]>([]);

  const [error, setError] = useState("");

  // Delete selected jobs, one job, or all posted jobs.

    function handleDeleteJobs(
        ids: string[],
        deleteAll = false
    ) {
        const message = deleteAll
            ? "Are you sure you want to delete ALL your posted jobs and their associated applications? This action cannot be undone."
            : ids.length === 1
                ? "Are you sure you want to delete this job and its associated applications? This action cannot be undone."
                : `Are you sure you want to delete these ${ids.length} jobs and their associated applications? This action cannot be undone.`;

        // Require confirmation for every deletion.
        if (!window.confirm(message)) return;

        if (!deleteAll && ids.length === 0) return;

        setError("");

        startTransition(async () => {
            // Optimistically remove the selected jobs.
            setOptimisticJobs((currentJobs) =>
                currentJobs.filter(
                    (job) => !ids.includes(job.id) && !deleteAll
                )
            );

            setSelectedJobs([]);

            const result = await deletePostedJobs(ids, deleteAll);

            if (!result.success) {
                setError(result.message);
                router.refresh();
                return;
            }

            router.refresh();
        });
    }


  // Delete selected applications, one application, or all applications.
  function handleDeleteApplications(
    ids: string[],
    deleteAll = false
  ) {
    if (deleteAll) {
      const confirmed = window.confirm(
        "Delete all your job applications? This cannot be undone."
      );

      if (!confirmed) return;
    }

    if (!deleteAll && ids.length === 0) return;

    setError("");

    startTransition(async () => {
      // Immediately remove applications from the UI.
      setOptimisticApplications((currentApplications) =>
        currentApplications.filter(
          (application) =>
            !ids.includes(application.id) && !deleteAll
        )
      );

      setSelectedApplications([]);

      const result = await deleteApplications(ids, deleteAll);

      if (!result.success) {
        setError(result.message);
        router.refresh();
        return;
      }

      router.refresh();
    });
  }

  // Select or deselect every currently displayed job.
  function toggleAllJobs() {
    setSelectedJobs((current) =>
      current.length === optimisticJobs.length
        ? []
        : optimisticJobs.map((job) => job.id)
    );
  }

  // Select or deselect every currently displayed application.
  function toggleAllApplications() {
    setSelectedApplications((current) =>
      current.length === optimisticApplications.length
        ? []
        : optimisticApplications.map(
            (application) => application.id
          )
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Dashboard
      </h1>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <div className="flex items-center justify-between gap-4">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-medium hover:text-red-900"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Posted Jobs */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Posted Jobs
            </h2>

            <Link
              href="/jobs/post"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Post New Job
            </Link>
          </div>

          {/* Job selection controls */}
          {optimisticJobs.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={
                    optimisticJobs.length > 0 &&
                    selectedJobs.length === optimisticJobs.length
                  }
                  onChange={toggleAllJobs}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Select all
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={selectedJobs.length === 0 || isPending}
                  onClick={() => handleDeleteJobs(selectedJobs)}
                  className="text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Delete selected ({selectedJobs.length})
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDeleteJobs([], true)}
                  className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-40"
                >
                  Delete all
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
            {optimisticJobs.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">
                You haven&apos;t posted any jobs yet.
              </p>
            ) : (
              optimisticJobs.map((job) => (
                <div key={job.id} className="p-6">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="checkbox"
                        aria-label={`Select ${job.title}`}
                        checked={selectedJobs.includes(job.id)}
                        onChange={(event) =>
                          setSelectedJobs((current) =>
                            event.target.checked
                              ? [...current, job.id]
                              : current.filter(
                                  (id) => id !== job.id
                                )
                          )
                        }
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />

                      <div className="min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {job.title}
                        </h3>

                        <p className="text-gray-600 mb-2">
                          {job.company}
                        </p>

                        <div className="flex flex-wrap items-center text-sm text-gray-500">
                          <span>{job.location}</span>
                          <span className="mx-2">•</span>
                          <span>{job.type}</span>
                          <span className="mx-2">•</span>
                          <span>
                            {formatDistanceToNow(
                              new Date(job.postedAt),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {job._count.applications} applications
                    </span>
                  </div>

                  <div className="mt-4 flex justify-end items-center gap-4">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      View Job
                    </Link>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDeleteJobs([job.id])}
                      className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Applications */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Your Applications
          </h2>

          {/* Application selection controls */}
          {optimisticApplications.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={
                    optimisticApplications.length > 0 &&
                    selectedApplications.length ===
                      optimisticApplications.length
                  }
                  onChange={toggleAllApplications}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Select all
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={
                    selectedApplications.length === 0 || isPending
                  }
                  onClick={() =>
                    handleDeleteApplications(selectedApplications)
                  }
                  className="text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Delete selected ({selectedApplications.length})
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    handleDeleteApplications([], true)
                  }
                  className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-40"
                >
                  Delete all
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
            {optimisticApplications.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">
                You haven&apos;t applied to any jobs yet.
              </p>
            ) : (
              optimisticApplications.map((application) => (
                <div key={application.id} className="p-6">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="checkbox"
                        aria-label={`Select application for ${application.job.title}`}
                        checked={selectedApplications.includes(
                          application.id
                        )}
                        onChange={(event) =>
                          setSelectedApplications((current) =>
                            event.target.checked
                              ? [...current, application.id]
                              : current.filter(
                                  (id) => id !== application.id
                                )
                          )
                        }
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />

                      <div className="min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {application.job.title}
                        </h3>

                        <p className="text-gray-600 mb-2">
                          {application.job.company}
                        </p>

                        <div className="flex flex-wrap items-center text-sm text-gray-500">
                          <span>{application.job.location}</span>
                          <span className="mx-2">•</span>
                          <span>{application.job.type}</span>
                          <span className="mx-2">•</span>
                          <span>
                            Applied{" "}
                            {formatDistanceToNow(
                              new Date(application.appliedAt),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        application.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : application.status === "ACCEPTED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {application.status}
                    </span>
                  </div>

                  <div className="mt-4 flex justify-end items-center gap-4">
                    <Link
                      href={`/jobs/${application.job.id}`}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      View Job
                    </Link>

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        handleDeleteApplications([application.id])
                      }
                      className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {isPending && (
        <p
          role="status"
          className="mt-6 text-sm text-gray-500 text-center"
        >
          Processing changes...
        </p>
      )}
    </div>
  );
}