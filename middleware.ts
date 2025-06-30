import { withAuth } from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const roleAccessMap: Record<string, string[]> = {
  "admin": ["/admin", "/graphql/admin", "/graphql/resolver/admin", "/api/admin/"],
};

export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (pathname === "/" || pathname === "/register") {
      if (token && token.roleName) {
        if (token.roleName === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.next();
    }

    if (!token || typeof token.roleName !== "string") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const roleName = token.roleName; 
    const allowedPrefixes = roleAccessMap[roleName] || [];
    const isAllowed = allowedPrefixes.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (!isAllowed) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

// ✅ Protected + guest routes
export const config = {
  matcher: [
    "/",
    "/register",
    "/admin/:path*",
    "/graphql/admin/:path*",
    "/graphql/resolver/admin/:path*",
    "/api/admin/:path*",
  ],
};
