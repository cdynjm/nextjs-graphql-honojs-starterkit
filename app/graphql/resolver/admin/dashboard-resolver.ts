import { connectToDatabase } from "@/lib/db/mongodb";
import { Post } from "@/lib/db/models/post";
import { Post as PostCollection } from "@/types/post";
import { encrypt, generateKey } from "@/lib/crypto";

export const dashboardResolver = {
  getPosts: async () => {
    await connectToDatabase();
    const key = await generateKey();
    const posts = await Post.find({})
    .populate("author")
    .sort({ created_at: -1 })
    .lean() as unknown as PostCollection[];

    const encryptedPosts = await Promise.all(
      posts.map(async (post) => {
        const encryptedId = await encrypt(post._id.toString(), key);
        return {
          ...post,
          encrypted_id: encryptedId,
        };
      })
    );

    return encryptedPosts;
  },
};
