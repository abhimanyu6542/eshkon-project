import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-extrabold text-gray-900">Page Studio</h1>
      <p className="max-w-md text-gray-600">
        A schema-driven, WYSIWYG-lite page editor backed by Contentful.
      </p>

      {session ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-gray-500">
            Signed in as <strong>{session.user?.email}</strong>
          </p>
          <div className="flex gap-3">
            <Link
              href="/preview/home"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Preview Page
            </Link>
            <Link
              href="/studio/home"
              className="rounded-lg border border-indigo-600 px-5 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Open Studio
            </Link>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="mt-2 text-sm text-gray-500 underline hover:text-gray-700"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : (
        <Link
          href="/login"
          className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Sign in
        </Link>
      )}
    </main>
  );
}
