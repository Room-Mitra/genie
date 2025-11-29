import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";

export async function GET() {
  const user = await getUserFromCookie();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    groups: user?.groups,
    roles: user?.roles,
    hotelId: user?.hotelId,
    userId: user?.sub,
    onDuty: Boolean(user?.onDuty),
  });
}
