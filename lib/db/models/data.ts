import mongoose, { Schema, Document } from "mongoose";

export interface IData extends Document {
  text: string;
  label: string;
}

const DataSchema = new Schema<IData>({
  text: { type: String, required: true },
  label: { type: String, required: true },
});

DataSchema.set("toObject", { virtuals: true });
DataSchema.set("toJSON", { virtuals: true });

export const Data = mongoose.models.Data || mongoose.model<IData>("Data", DataSchema);
