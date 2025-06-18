import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decrypt, generateKey } from "@/lib/crypto";
import bcrypt from "bcrypt";

export const profileResolver = {
  updateProfile: async ({
    encrypted_id,
    name,
    email,
    password,
  }: {
    encrypted_id: string;
    name?: string;
    email?: string;
    password?: string;
  }) => {
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
  },
};
