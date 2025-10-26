export const runtime = "nodejs"; // important: streaming bodies need Node runtime
export const dynamic = "force-dynamic"; // avoid caching of request bodies

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
  const token = await getTokenFromCookie();

  const url = new URL(req.url);
  const { path } = await params;
  const target = `${API_BASE_URL}/${path.join("/")}${url.search}`;

  // Start with original headers
  const headers = new Headers(req.headers);

  // Remove hop-by-hop / computed headers so Node can re-calculate
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("transfer-encoding");

  if (token) headers.set("authorization", `Bearer ${token}`);

  const method = req.method.toUpperCase();
  const hasBody = !(method === "GET" || method === "HEAD");

  const init = {
    method,
    headers,
    body: hasBody ? req.body : undefined, // pass the original stream untouched
    // Required when streaming request bodies with node-fetch in Next route handlers
    duplex: hasBody ? "half" : undefined,
  };

  const resp = await fetch(target, init);

  // Stream the response back as-is, including headers
  const outHeaders = new Headers(resp.headers);
  return new NextResponse(resp.body, {
    status: resp.status,
    headers: outHeaders,
  });
}
