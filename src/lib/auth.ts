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
    error:  "/login",   // redirect auth errors back to login with ?error=
  },

  session:  { strategy: "jwt" },
  debug:    process.env.NODE_ENV === "development",
};
