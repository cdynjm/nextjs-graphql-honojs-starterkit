import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  status: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  created_at: { type: Date, default: () => new Date() },
  updated_at: { type: Date, default: () => new Date() },
});

export const Post = mongoose.model("Post", PostSchema);