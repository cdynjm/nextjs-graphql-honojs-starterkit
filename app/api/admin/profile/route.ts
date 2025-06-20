import { Hono } from "hono";
import { handle } from "hono/vercel";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@/lib/db/mongodb";
import { User} from "@/lib/db/models/user";
import { decrypt, generateKey } from "@/lib/crypto";
import { Types } from "mongoose";
import { authMiddlewareJWT } from "../../middleware/auth-middleware-jwt";

const app = new Hono().basePath("/api/admin/profile");
app.use("*", authMiddlewareJWT);

app.put("/", async (c) => {
  try {
    await connectToDatabase();

    const { encrypted_id, name, email, password } = await c.req.json();
    const key = await generateKey();
    const decrypted_id = await decrypt(encrypted_id, key);

    if (!Types.ObjectId.isValid(decrypted_id)) {
      return c.json({ error: "Invalid user ID" }, 400);
    }

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

    await User.findByIdAndUpdate(decrypted_id, updateData);

    return c.json(
      {
        message:
          "User information has been updated. The page will reload to refresh your session.",
      },
      200
    );
  } catch (e) {
    console.error("Profile update error:", e);
    return c.json({ error: "Failed to process request" }, 500);
  }
});

export const PUT = handle(app);
