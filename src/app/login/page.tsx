import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in – Page Studio" };

export default function LoginPage() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-gray-50 px-4"
    >
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-900">
          Sign in to Page Studio
        </h1>
        <LoginForm />
        <p className="mt-6 text-center text-xs text-gray-500">
          Demo accounts: viewer@example.com / editor@example.com / publisher@example.com
          <br />
          Passwords: viewer123 / editor123 / publisher123
        </p>
      </div>
    </main>
  );
}
