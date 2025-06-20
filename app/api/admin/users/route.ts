import { Hono } from "hono";
import { handle } from "hono/vercel";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@/lib/db/mongodb";
import { User } from "@/lib/db/models/user";
import { User as UserCollection } from "@/types/user";
import { decrypt, generateKey } from "@/lib/crypto";
import { Types } from "mongoose";
import { authMiddlewareJWT } from "../../middleware/auth-middleware-jwt";

const app = new Hono().basePath("/api/admin/users");
app.use("*", authMiddlewareJWT);

app.post("/", async (c) => {
  try {
    await connectToDatabase();
    const { name, email, password, photo } = await c.req.json();

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return c.json({ error: "Email already exists" }, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      photo,
      role: 1,
      status: 3,
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
  try {
    await connectToDatabase();
    const { encrypted_id } = await c.req.json();

    const key = await generateKey();
    const decrypted_id = await decrypt(encrypted_id, key);

    if (!Types.ObjectId.isValid(decrypted_id)) {
      return c.json({ error: "Invalid ID" }, 400);
    }

    await User.findByIdAndDelete(decrypted_id);

    return c.json({ message: "User has been deleted" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to delete user" }, 500);
  }
});

export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
