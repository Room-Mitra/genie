// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/sign-up",
  "/forgot-password",
  "/auth/session",
  "/auth/logout",
];

function isPublicPath(pathname: string) {
  // let all /auth/* through
  if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/api"))
    return true;

  // static and public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico"
  )
    return true;

  // add more public pages here if you have any
  return false;
}

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  // Example auth check: HttpOnly cookie
  const token = req.cookies.get("rm_jwt")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?returnTo=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Run on everything except obvious static files
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|assets|.*\\.(?:png|jpg|jpeg|svg|ico|css|js|map)).*)",
  ],
};
