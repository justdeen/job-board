import Link from "next/link";

export default function JobNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Error illustration */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-10 w-10 text-indigo-600"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 9.75h.008v.008H9.75V9.75Zm4.5 0h.008v.008h-.008V9.75ZM9 15a4.5 4.5 0 0 0 6 0M12 3.75a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5Z"
            />
          </svg>
        </div>

        {/* Error message */}
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 mb-3">
          404 — Job Not Found
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
          This job is no longer available
        </h1>

        <p className="text-gray-600 leading-7 mb-8">
          Sorry, we couldn&apos;t find the job you&apos;re looking for. It may have
          been removed, or the link might be incorrect.
        </p>

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/jobs"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Browse Jobs
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}