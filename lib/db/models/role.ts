import mongoose, { Schema, Document, Types } from "mongoose";
import leanVirtuals from "mongoose-lean-virtuals";

export interface IRole extends Document {
  name: string;
  permissions: {
    _id: Types.ObjectId;
    name: string;
  }[];
  created_at?: Date;
  updated_at?: Date;
}

const RoleSchema = new Schema<IRole>({
  name: { type: String, required: true },
  permissions: [{
    _id: { type: Schema.Types.ObjectId, ref: "Permission", required: true },
    name: { type: String, required: true }
  }],
  created_at: { type: Date, default: () => new Date() },
  updated_at: { type: Date, default: () => new Date() },
});

RoleSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

RoleSchema.virtual("role", {
  ref: "User",
  localField: "_id",
  foreignField: "role",
});

RoleSchema.set("toObject", { virtuals: true });
RoleSchema.set("toJSON", { virtuals: true });

RoleSchema.plugin(leanVirtuals);

export const Role = mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);
