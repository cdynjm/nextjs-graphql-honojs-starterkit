import { Hono } from "hono";
import { handle } from "hono/vercel";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { decrypt, generateKey } from "@/lib/crypto";
import { eq } from "drizzle-orm";
import { authMiddlewareJWT } from "../../middleware/auth-middleware-jwt";

const app = new Hono().basePath("/api/admin/users");
app.use("*", authMiddlewareJWT);

app.post("/", async (c) => {
  try {
    const { name, email, password, photo } = await c.req.json();

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(usersTable).values({
      name,
      email,
      password: hashedPassword,
      photo,
      role: 1,
    });

    return c.json({ message: "User has been created" }, 200);
  } catch {
    return c.json({ error: "Email is already exist" }, 500);
  }
});


app.put("/", async (c) => {
  try {
    const { encrypted_id, name, email } = await c.req.json();

  const key = await generateKey();
  const decrypted_id = await decrypt(encrypted_id, key);

  await db
    .update(usersTable)
    .set({ name, email })
    .where(eq(usersTable.id, Number(decrypted_id)));

  return c.json({ message: "User has been updated" }, 200);
  } catch {
     return c.json({ error: "Email is already exist" }, 500);
  }
});

app.delete("/", async (c) => {
  const { encrypted_id } = await c.req.json();

  const key = await generateKey();
  const decrypted_id = await decrypt(encrypted_id, key);

  await db.delete(usersTable).where(eq(usersTable.id, Number(decrypted_id)));

  return c.json({ message: "User has been deleted" }, 200);
});

export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
