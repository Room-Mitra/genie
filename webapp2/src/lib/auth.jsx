import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("rm_jwt")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (err) {
    console.error("Invalid or expired token", err);
    return null;
  }
}
