// src/lib/auth.ts
import { cookies } from "next/headers";

export async function getJwtFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("rm_jwt")?.value ?? null;
}
