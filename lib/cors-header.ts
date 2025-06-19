import { NextResponse } from "next/server";

export function setCorsHeaders(res: NextResponse) {
  const allowedOrigin = process.env.NEXT_PUBLIC_API_BASE_URL as string;

  res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.headers.set("Access-Control-Allow-Credentials", "true");
}