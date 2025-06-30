import { Hono } from "hono";
import { handle } from "hono/vercel";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@/lib/db/mongodb";
import { User } from "@/lib/db/models/user";
import { User as UserCollection } from "@/types/user";
import { decrypt, generateKey } from "@/lib/crypto";
import { Types } from "mongoose";
import { authMiddlewareJWT } from "../../middleware/auth-middleware-jwt";
import { Post } from "@/lib/db/models/post";
import { checkUserAuthorization } from "@/lib/db/helpers/user-authorization";
import { Role } from "@/lib/db/models/role";

const app = new Hono().basePath("/api/admin/users");
app.use("*", authMiddlewareJWT);

app.post("/", async (c) => {
  try {

    await checkUserAuthorization("create_user");

    await connectToDatabase();
    const { name, email, password, photo } = await c.req.json();

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return c.json({ error: "Email already exists" }, 409);
    }

    const role = await Role.findOne({name: "admin"});

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      photo,
      role: role?._id,
    });

    await newUser.save();

    return c.json({ message: "User has been created" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to create user" }, 500);
  }
});

app.put("/", async (c) => {
  try {

    await checkUserAuthorization("update_user");

    await connectToDatabase();
    const { encrypted_id, name, email } = await c.req.json();

    const key = await generateKey();
    const decrypted_id = await decrypt(encrypted_id, key);

    if (!Types.ObjectId.isValid(decrypted_id)) {
      return c.json({ error: "Invalid ID" }, 400);
    }

    const existingUser = (await User.findOne({
      email,
    }).lean()) as unknown as UserCollection;
    if (existingUser && existingUser._id.toString() !== decrypted_id) {
      return c.json({ error: "Email already exists" }, 409);
    }

    await User.findByIdAndUpdate(decrypted_id, {
      name,
      email,
      updated_at: new Date(),
    });

    return c.json({ message: "User has been updated" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to update user" }, 500);
  }
});

app.delete("/", async (c) => {
  const { type } = await c.req.json();

  if (type === "post") {
    try {

      await checkUserAuthorization("delete_post");

      await connectToDatabase();

      const { encrypted_id } = await c.req.json();
      const key = await generateKey();
      const decrypted_id = await decrypt(encrypted_id, key);

      if (!Types.ObjectId.isValid(decrypted_id)) {
        return c.json({ error: "Invalid user ID" }, 400);
      }

      const post = await Post.findById(decrypted_id);
      post?.softDelete();

      return c.json({ message: "Post has been deleted" }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to delete post" }, 500);
    }
  }

  if (type === "user") {
    try {

      await checkUserAuthorization("delete_user");

      await connectToDatabase();
      const { encrypted_id } = await c.req.json();

      const key = await generateKey();
      const decrypted_id = await decrypt(encrypted_id, key);

      if (!Types.ObjectId.isValid(decrypted_id)) {
        return c.json({ error: "Invalid ID" }, 400);
      }

      const user = await User.findById(decrypted_id);
      user?.softDelete();

      const posts = await Post.find({ author: user._id });
      for (const post of posts) {
        await post.softDelete();
      }

      return c.json({ message: "User has been deleted" }, 200);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to delete user" }, 500);
    }
  }
});

export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
