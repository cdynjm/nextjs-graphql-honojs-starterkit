import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@/lib/db/mongodb"; // adjust path to your MongoDB connection function
import { User } from "@/lib/db/models/user";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { name, email, password, avatar } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 1,
      photo: avatar,
    });

    await newUser.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in user registration:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
