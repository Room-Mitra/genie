import { cookies } from "next/headers";

export async function POST() {
  const isProd = process.env.NODE_ENV === "production";

  // Expire the cookie
  const cookieStore = await cookies();
  cookieStore.set({
    name: "rm_jwt",
    value: "",
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
