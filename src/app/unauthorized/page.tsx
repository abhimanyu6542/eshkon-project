import Link from "next/link";

export const metadata = { title: "Unauthorized – Page Studio" };

export default function UnauthorizedPage() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <h1 className="text-3xl font-bold text-red-700">Access Denied</h1>
      <p className="text-gray-600">You do not have permission to access this page.</p>
      <Link
        href="/"
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Go home
      </Link>
    </main>
  );
}
