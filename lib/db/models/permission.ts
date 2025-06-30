import mongoose, { Schema, Document } from "mongoose";

export interface IPermission extends Document {
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

const PermissionSchema = new Schema<IPermission>({
  name: { type: String, required: true },
  created_at: { type: Date, default: () => new Date() },
  updated_at: { type: Date, default: () => new Date() },
});

PermissionSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

PermissionSchema.set("toObject", { virtuals: true });
PermissionSchema.set("toJSON", { virtuals: true });

export const Permission = mongoose.models.Permission || mongoose.model<IPermission>("Permission", PermissionSchema);
