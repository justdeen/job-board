"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

export default function NavbarTest() {
  const { data: session } = useSession();
  const router = useRouter();

  const pathname = usePathname();

  // Returns active styling when the current URL matches the link.
  function getLinkClass(href: string) {
    const isActive =
      pathname === href ||
      (href !== "/" &&
        pathname.startsWith(`${href}/`) &&
        !(href === "/jobs" && pathname.startsWith("/jobs/post")));

    return `rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${isActive
        ? "bg-emerald-100 text-emerald-800"
        : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
      }`;
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  async function handleSignOut() {
    closeMenu();
    await signOut({ redirect: false });
    router.refresh();
  }

  // Close the drawer when clicking outside.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Close the drawer when switching to desktop width.
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        closeMenu();
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Close the drawer when Escape is pressed.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function NavigationLinks() {
  return (
    <>
      <Link
        href="/jobs"
        onClick={closeMenu}
        aria-current={
          pathname === "/jobs"
            ? "page"
            : undefined
        }
        className={getLinkClass("/jobs")}
      >
        Browse Jobs
      </Link>

      {session ? (
        <>
          <Link
            href="/profile"
            onClick={closeMenu}
            aria-current={
              pathname === "/profile" ? "page" : undefined
            }
            className={getLinkClass("/profile")}
          >
            Profile
          </Link>

          <Link
            href="/jobs/post"
            onClick={closeMenu}
            aria-current={
              pathname === "/jobs/post" ? "page" : undefined
            }
            className={getLinkClass("/jobs/post")}
          >
            Post a Job
          </Link>

          <Link
            href="/dashboard"
            onClick={closeMenu}
            aria-current={
              pathname === "/dashboard" ? "page" : undefined
            }
            className={getLinkClass("/dashboard")}
          >
            Dashboard
          </Link>

          <button
            onClick={handleSignOut}
            className="rounded-lg px-4 py-2.5 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            Sign Out
          </button>
        </>
      ) : (
        <Link
          href="/auth/signin"
          onClick={closeMenu}
          aria-current={
            pathname === "/auth/signin" ? "page" : undefined
          }
          className={`rounded-lg px-5 py-2.5 text-center text-sm font-semibold transition-colors ${
            pathname === "/auth/signin"
              ? "bg-emerald-700 text-white"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          Sign In
        </Link>
      )}
    </>
  );
}

  return (
    <header className="sticky top-0 z-50">
      <nav className="border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group flex items-center">
              <Image
                src="/logo.png"
                alt="Postify Logo"
                width={40}
                height={40}
                className="h-9 w-auto"
              />

              <span className="ml-2 text-xl font-bold tracking-tight text-gray-900">
                Postify<span className="text-emerald-600">.</span>
              </span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden items-center gap-2 md:flex">
              <NavigationLinks />
            </div>

            {/* Mobile menu button */}
            <button
              ref={buttonRef}
              type="button"
              aria-label={
                isMenuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white p-2.5 text-gray-700 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 md:hidden"
            >
              {isMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ease-in-out motion-reduce:transition-none md:hidden ${isMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
          }`}
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
      >
        {/* Background overlay */}
        <div
          className={`absolute inset-0 bg-gray-950/45 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out motion-reduce:transition-none ${isMenuOpen ? "opacity-100" : "opacity-0"
            }`}
          onClick={closeMenu}
          aria-hidden="true"
        />

        {/* Right-side drawer */}
        <div
          ref={menuRef}
          id="mobile-navigation"
          className={`absolute right-0 top-0 flex h-dvh w-80 max-w-[85vw] flex-col overflow-y-auto border-l border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out motion-reduce:transition-none ${isMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          {/* Drawer header */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 px-5">
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center"
            >
              <Image
                src="/logo.png"
                alt="Postify Logo"
                width={40}
                height={40}
                className="h-9 w-auto"
              />

              <span className="ml-2 text-xl font-bold text-gray-900">
                Postify<span className="text-emerald-600">.</span>
              </span>
            </Link>

            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close navigation menu"
              className="rounded-xl p-2 text-gray-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation links */}
          <div className="flex flex-1 flex-col gap-2 p-5">
            <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Navigation
            </p>

            <NavigationLinks />
          </div>

          {/* Drawer footer */}
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
            <p className="text-center text-xs text-gray-500">
              Find your next opportunity with{" "}
              <span className="font-semibold text-emerald-700">
                Postify
              </span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}