// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isPublicPath } from "./lib/path";

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  // Example auth check: HttpOnly cookie
  const token = req.cookies.get("rm_jwt")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search =
      pathname !== "/"
        ? `?returnTo=${encodeURIComponent(pathname + search)}`
        : "";
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
