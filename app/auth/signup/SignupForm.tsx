
"use client";

import { useState } from "react";
import { registerUser } from "@/app/actions/register";

export default function RegisterForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const result = await registerUser(formData);

      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.success) {
        setSuccess(true);
      }
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
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              className="mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              name="name"
              id="name"
              type="text"
              placeholder="Full name"
              required
            />
        </div>
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
          {loading ? "Creating account..." : "Sign up"}
        </button>
        {error && <p 
          className="text-red-500"
          role="alert">{error}
        </p>}
        {success && (
          <p
            className="text-green-500" 
            role="status">
              Account created successfully. You can now sign in.
          </p>
        )}
      </form>
    </div>
  );
}
