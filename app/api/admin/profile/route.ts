import { Hono } from "hono";
import { handle } from "hono/vercel";
import bcrypt from "bcrypt";
import { db } from "@/lib/db"; // adjust path
import { usersTable } from "@/lib/db/schema";
import { decrypt, generateKey } from "@/lib/crypto";
import { eq } from "drizzle-orm";

const app = new Hono().basePath("/api/admin/profile");

app.put("/", async (c) => {
  try {
    const { encrypted_id, name, email, password } = await c.req.json();

    const key = await generateKey();
    const decryptedID = await decrypt(encrypted_id, key);

    const updateData: Partial<{
      name: string;
      email: string;
      password: string;
    }> = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, Number(decryptedID)));

    return c.json(
      {
        message:
          "User information has been updated. The page will reload to refresh your session.",
      },
      200
    );
  } catch (e) {
    console.error(e);
    return c.json({ error: "Failed to process request" }, 500);
  }
});

export const PUT = handle(app);
