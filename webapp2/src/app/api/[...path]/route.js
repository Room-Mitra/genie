// src/app/api/bff/[...path]/route.ts
import { NextResponse } from "next/server";
import { getTokenFromCookie } from "@/lib/auth";

const API_BASE_URL = process.env.API_BASE_URL; // e.g. https://api.roommitra.com

export async function GET(req, { params }) {
  return proxy(req, params);
}
export async function POST(req, { params }) {
  return proxy(req, params);
}
export async function PUT(req, { params }) {
  return proxy(req, params);
}
export async function PATCH(req, { params }) {
  return proxy(req, params);
}
export async function DELETE(req, { params }) {
  return proxy(req, params);
}

async function proxy(req, params) {
  const user = await getTokenFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const { path } = await params;
  const target = `${API_BASE_URL}/${path.join("/")}${url.search}`;

  console.log("route.js", user);

  const init = {
    method: req.method,
    headers: {
      // forward JSON headers plus Authorization
      "Content-Type": req.headers.get("content-type") ?? "application/json",
      "User-Agent": req.headers.get("user-agent") ?? "NextBFF",
      Authorization: `Bearer ${user}`,
    },
    body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.text(),
  };

  const resp = await fetch(target, init);
  const data = await resp.arrayBuffer();
  return new NextResponse(data, {
    status: resp.status,
    headers: {
      "content-type": resp.headers.get("content-type") ?? "application/json",
    },
  });
}
