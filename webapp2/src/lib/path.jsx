const PUBLIC_PATHS = [
  "/login",
  "/sign-up",
  "/forgot-password",
  "/auth/session",
  "/auth/logout",
  "/auth/me",
];

export function isPublicPath(pathname) {
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

  // add more publicFl pages here if you have any
  return false;
}
