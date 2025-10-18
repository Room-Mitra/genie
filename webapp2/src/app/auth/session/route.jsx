import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const SECRET_KEY = process.env.SECRET_KEY;

export async function POST(req) {
  const { token } = await req.json();

  jwt.verify(token, SECRET_KEY, (err) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("rm_jwt", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 230 * 60 * 60, // a little less than 10 days
  });

  return res;
}
