// app/api/auth/session/route.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;

export async function POST(req) {
  const { token } = await req.json(); // token you got from Express /login

  jwt.verify(token, SECRET_KEY, (err) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
  });

  const cookieStore = await cookies();

  cookieStore.set({
    name: "rm_jwt",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 230 * 60 * 60, // seconds // a little less than 10 days
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
