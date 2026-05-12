import type { NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Role } from "@/types/auth";

// Demo users — replace with a real DB/directory in production
const DEMO_USERS: Array<{
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}> = [
  { id: "1", name: "Alice Viewer",     email: "viewer@example.com",    password: "viewer123",    role: "viewer" },
  { id: "2", name: "Bob Editor",       email: "editor@example.com",    password: "editor123",    role: "editor" },
  { id: "3", name: "Carol Publisher",  email: "publisher@example.com", password: "publisher123", role: "publisher" },
];

// Derive the canonical URL for NextAuth.
// Priority: explicit NEXTAUTH_URL → VERCEL_URL (auto-injected) → localhost fallback
function getNextAuthUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

// Set before NextAuth initialises so it uses the right base URL
// for cookies, callbacks, and redirects on every environment.
process.env.NEXTAUTH_URL = getNextAuthUrl();

const isProduction = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = DEMO_USERS.find(
          (u) => u.email === credentials?.email && u.password === credentials?.password
        );
        if (!user) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],

  // Explicit cookie config so the session cookie works on Vercel (HTTPS)
  // and locally (HTTP) without manual env changes.
  cookies: {
    sessionToken: {
      name: isProduction
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },

  callbacks: {
    jwt({ token, user }: { token: JWT; user?: unknown }) {
      if (user) token.role = (user as { role: Role }).role;
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as { role?: Role }).role = token.role as Role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  session:  { strategy: "jwt" },
  debug:    !isProduction,
};
