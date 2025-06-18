import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";

export async function POST(req: Request) {
  try {
    const { name, email, password, avatar } = await req.json();

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.insert(usersTable).values({
      name: name,
      email: email,
      password: hashedPassword,
      role: 1,
      photo: avatar,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Email is already exists",
      },
      { status: 500 }
    );
  }
}
