// userResolvers.ts
import { connectToDatabase } from "@/lib/db/mongodb";
import { User} from "@/lib/db/models/user";
import { User as UserCollection } from "@/types/user";
import { encrypt, decrypt, generateKey } from "@/lib/crypto";
import { Types } from "mongoose";

export const userResolver = {
  getUsers: async ({ limit, offset }: { limit: number; offset: number }) => {
    await connectToDatabase();
    const key = await generateKey();

    const [users, totalCount] = await Promise.all([
      User.find({})
        .skip(offset)
        .limit(limit)
        .sort({ created_at: -1 })
        .lean() as unknown as UserCollection[],

      User.countDocuments({}),
    ]);

    const encryptedUsers = await Promise.all(
      users.map(async (user) => {
        const encryptedId = await encrypt(user._id.toString(), key);
        return {
          ...user,
          encrypted_id: encryptedId,
        };
      })
    );

    return {
      users: encryptedUsers,
      totalCount,
    };
  },

  getUserInfo: async ({ encrypted_id }: { encrypted_id: string }) => {
    await connectToDatabase();
    const key = await generateKey();
    const decryptedID = await decrypt(encrypted_id, key);

    if (!Types.ObjectId.isValid(decryptedID)) return null;

    const user = await User.findById(decryptedID).lean();
    return user ?? null;
  },
};
