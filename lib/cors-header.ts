export function setCorsHeaders(res: Response): Response {
  const allowedOrigin = process.env.NEXT_PUBLIC_API_BASE_URL || "*";

  res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.headers.set("Access-Control-Allow-Credentials", "true");

  return res;
}