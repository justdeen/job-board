
"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Form() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { update } = useSession();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);

    try {
      const email = formData.get("email")
      const password = formData.get("password")

      if (typeof email !== "string" || typeof password !== "string") {
        setError("Enter your email and password.");
        return;
      }
      const result = await signIn("credentials", {
        email,
        password,
        redirectTo: "/",
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password.");
        return;
      }

      await update();
      router.replace(result.url ?? "/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create an account</h1>
      <form action={handleSubmit} className="space-y-6">
        <div>
            <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              id="email"
              name="email"
              type="email"
              placeholder="Email address"
              required
            />
        </div>
        <div>
            <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              minLength={8}
              maxLength={72}
              required
            />
        </div>
        <button
        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign in"}
        </button>
        {error && <p 
          className="text-red-500"
          role="alert">{error}
        </p>}
      </form>
    </div>
  );
}
