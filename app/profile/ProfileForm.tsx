"use client";

import { useActionState, useState } from "react";
import UpdateUserProfile from "@/app/actions/updateProfile";

const initialState = { error: "" };

export default function ProfileForm({
  currentName,
  email,
  showSuccess,
}: {
  currentName: string;
  email: string;
  showSuccess: boolean;
}) {
  const [name, setName] = useState(currentName);
  const [state, formAction, isPending] = useActionState(
    async (_previousState: typeof initialState, formData: FormData) => {
      const result = await UpdateUserProfile(formData);
      return result;
    },
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <input
          className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          id="name"
          name="name"
          type="text"
          defaultValue={currentName}
          onChange={(event) => setName(event.target.value)}
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
          className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          id="email"
          name="email"
          type="email"
          defaultValue={email}
          readOnly
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      {showSuccess && !state.error && name.trim() === currentName.trim() ? (
        <p role="status" className="text-sm text-green-600">
          Changes saved.
        </p>
      ) : null}

      <button
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        type="submit"
        disabled={isPending || name.trim() === currentName.trim()}
      >
        {isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
