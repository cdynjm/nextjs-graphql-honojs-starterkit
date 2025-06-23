import { Hono } from "hono";
import { handle } from "hono/vercel";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Post } from "@/lib/db/models/post";
import { authMiddlewareJWT } from "../../middleware/auth-middleware-jwt";
import { decrypt, generateKey } from "@/lib/crypto";
import { Types } from "mongoose";

const app = new Hono().basePath("/api/admin/dashboard");
app.use("*", authMiddlewareJWT);

app.post("/", async (c) => {
  try {
    await connectToDatabase();

    const { status, encrypted_id } = await c.req.json();
    const key = await generateKey();
    const decrypted_id = await decrypt(encrypted_id, key);

    if (!Types.ObjectId.isValid(decrypted_id)) {
      return c.json({ error: "Invalid user ID" }, 400);
    }

    const newPost = new Post({
      status,
      author: decrypted_id,
    });

    await newPost.save();

    return c.json({ message: "Post has been created" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to create post" }, 500);
  }
});

app.delete("/", async (c) => {
  try {
    await connectToDatabase();

    const { encrypted_id } = await c.req.json();
    const key = await generateKey();
    const decrypted_id = await decrypt(encrypted_id, key);

    if (!Types.ObjectId.isValid(decrypted_id)) {
      return c.json({ error: "Invalid user ID" }, 400);
    }

    await Post.findByIdAndDelete(decrypted_id);

    return c.json({ message: "Post has been deleted" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to delete post" }, 500);
  }
});

export const POST = handle(app);
export const DELETE = handle(app);
