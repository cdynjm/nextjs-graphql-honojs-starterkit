import { Context, Next } from "hono";
import { verifyJwt } from "@/lib/verify-jwt";

export const authMiddlewareJWT = async (c: Context, next: Next) => {
  const authHeader = c.req.header("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verifyJwt(token);
    c.set("user", payload);
    await next();
  } catch (error) {
    console.error("JWT error:", error);
    return c.json({ error: "Invalid token" }, 401);
  }
};