import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Route protection for the console. Enabled by default — every service
 * route requires a session. Set AUTH_ENFORCED=false in frontend/.env.local
 * to develop console pages without signing in.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/jobs",
  "/applications",
  "/resume-studio",
  "/resume-builder",
  "/recruiters",
  "/settings",
  "/autofill-review",
  "/onboarding",
];

export default auth((req) => {
  const enforced = process.env.AUTH_ENFORCED !== "false";
  if (!enforced) return;

  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  // Skip static assets and API routes.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
