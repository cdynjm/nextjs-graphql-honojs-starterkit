import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role?: number;
  photo?: string;
  created_at?: Date;
  updated_at?: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, maxlength: 255 },
  email: { type: String, required: true, unique: true, maxlength: 255 },
  password: { type: String, required: true, maxlength: 255 },
  role: { type: Number, required: true },
  photo: { type: String, maxlength: 255 }, // optional field
  created_at: { type: Date, default: () => new Date() },
  updated_at: { type: Date, default: () => new Date() },
});

// Optional: update updated_at automatically on save
UserSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

UserSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "author",
});

UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
