// userResolvers.ts
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { encrypt, decrypt, generateKey } from "@/lib/crypto";
import { sql } from "drizzle-orm";

export const userResolver = {
  getUsers: async ({ limit, offset }: { limit: number; offset: number }) => {
    const key = await generateKey();

    const [users, totalCountResult] = await Promise.all([
      db.select().from(usersTable).limit(limit).offset(offset),
      db.select({ count: sql<number>`COUNT(*)` }).from(usersTable),
    ]);

    const encryptedUsers = await Promise.all(
      users.map(async (user) => {
        const encryptedId = await encrypt(user.id.toString(), key);
        return { ...user, encrypted_id: encryptedId };
      })
    );

    return {
      users: encryptedUsers,
      totalCount: Number(totalCountResult[0].count),
    };
  },

  getUserInfo: async ({ encrypted_id }: { encrypted_id: string }) => {
    const key = await generateKey();
    const decryptedID = await decrypt(encrypted_id, key);
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, Number(decryptedID)))
      .limit(1);

    return user[0];
  }
};
