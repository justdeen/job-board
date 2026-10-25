"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  async function handleSignOut() {
    await signOut({ redirect: false });
    router.refresh();
  }
  return (
    <div>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Job Board Logo"
                  width={40}
                  height={40}
                  className="h-8 w-auto"
                />
                <span className="ml-2 text-xl font-semibold text-gray-900">
                  Postify
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/jobs"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Browse Jobs
              </Link>
              {/* session ? (<Link
                    href="/jobs/post"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Post a Job
              </Link>
              <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
              </Link>)
              <Link
                  href="/auth/signin"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
              </Link> */}
      
              {session ? (
                <>
                  <Link
                    href="/jobs/post"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Post a Job
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}