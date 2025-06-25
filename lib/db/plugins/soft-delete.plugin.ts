import { Schema } from "mongoose";

export function softDeletePlugin(schema: Schema) {
  schema.add({ deleted_at: { type: Date, default: null } });

  schema.pre(/^find/, function (next) {
    (this as import("mongoose").Query<unknown, unknown>).where({
      deleted_at: null,
    });
    next();
  });

  schema.methods.softDelete = function () {
    this.deleted_at = new Date();
    return this.save();
  };

  schema.methods.restore = function () {
    this.deleted_at = null;
    return this.save();
  };
}
