"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function ApplyButton({
  jobId,
}: {
  jobId: string;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [applicationStatus, setApplicationStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = async () => {
    // Require authentication.
    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }

    // Ensure a file has been selected.
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setErrorMessage("Please upload your CV before applying.");
      setApplicationStatus("error");
      return;
    }

    setErrorMessage("");
    setApplicationStatus("idle");
    setIsSubmitting(true);

    try {
      // FormData allows us to send the actual file.
      const formData = new FormData();
      formData.append("cv", file);

      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        body: formData,
      });

      const body: { error?: string } = await response.json();

      if (!response.ok) {
        setErrorMessage(
          body.error ?? "Failed to submit your application."
        );
        setApplicationStatus("error");
        return;
      }

      setApplicationStatus("success");
      router.refresh();
    } catch {
      setErrorMessage(
        "Something went wrong while submitting your application."
      );
      setApplicationStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <button
        disabled
        className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md opacity-50 cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  if (applicationStatus === "success") {
    return (
      <div className="text-center">
        <p className="text-green-600 font-medium mb-4">
          Application submitted successfully!
        </p>

        <p className="text-sm text-gray-500 mb-4">
          Your CV has been submitted with your application.
        </p>

        <Link
          href="/dashboard"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          View your applications →
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* CV upload */}
      <div className="mb-6">
        <label
          htmlFor="cv"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Resume / CV
        </label>

        <input
          ref={fileInputRef}
          id="cv"
          name="cv"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
          disabled={isSubmitting}
          className="block w-full cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        />

        <p className="mt-2 text-sm text-gray-500">
          Accepted formats: PDF, DOC, and DOCX. Maximum file size: 5 MB.
        </p>
      </div>

      {/* Submit application */}
      <button
        type="button"
        onClick={handleApply}
        disabled={isSubmitting}
        className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting
          ? "Submitting application..."
          : "Apply for this position"}
      </button>

      {/* Error message */}
      {applicationStatus === "error" && (
        <p
          role="alert"
          className="mt-3 text-red-600 text-center text-sm"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}