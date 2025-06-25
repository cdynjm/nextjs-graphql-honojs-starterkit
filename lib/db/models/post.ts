import mongoose, { Schema, Document} from "mongoose";
import { softDeletePlugin } from "@/lib/db/plugins/soft-delete.plugin";

export interface IPost extends Document {
  status: string;
  author: mongoose.Schema.Types.ObjectId;
  created_at?: Date;
  updated_at?: Date;
}

const PostSchema = new Schema<IPost>({
  status: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  created_at: { type: Date, default: () => new Date() },
  updated_at: { type: Date, default: () => new Date() },
});

PostSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

PostSchema.plugin(softDeletePlugin);

PostSchema.set("toObject", { virtuals: true });
PostSchema.set("toJSON", { virtuals: true });

export const Post = mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);