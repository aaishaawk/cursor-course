import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If user is authenticated, continue
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/", // Redirect to home page if not signed in
    },
  }
);

// Protect these routes - users must be signed in to access them
export const config = {
  matcher: [
    "/dashboards/:path*",
    "/protected/:path*",
  ],
};

