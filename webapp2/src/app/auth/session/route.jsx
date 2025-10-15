import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const SECRET_KEY = process.env.SECRET_KEY;

export async function POST(req) {
  const { token } = await req.json(); // token you got from api.roommitra.com /login

  jwt.verify(token, SECRET_KEY, (err) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
  });

  const res = NextResponse.json({ ok: true });

  // Set HttpOnly cookie for server access only
  res.cookies.set("rm_jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 230 * 60 * 60, // a little less than 10 days
  });

  return res;
}
