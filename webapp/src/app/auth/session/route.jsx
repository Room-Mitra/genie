import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const SECRET_KEY = process.env.SECRET_KEY;

export async function POST(req) {
  const { token } = await req.json();

  try {
    jwt.verify(token, SECRET_KEY);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

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
