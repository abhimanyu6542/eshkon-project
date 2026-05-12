import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { Role } from "@/types/auth";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth?.token?.role as Role | undefined;

    // Viewer cannot access studio
    if (pathname.startsWith("/studio") && role === "viewer") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Only publishers can call publish API
    if (pathname.startsWith("/api/publish") && role !== "publisher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        // Require authentication for studio and publish API
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/studio/:path*", "/api/publish/:path*"],
};
