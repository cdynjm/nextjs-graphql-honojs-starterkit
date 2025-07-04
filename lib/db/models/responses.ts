import mongoose, { Schema, Document } from "mongoose";

export interface IResponse extends Document {
  label: string;
  response: string[];
}

const ResponseSchema = new Schema<IResponse>({
  label: { type: String, required: true },
  response: { type: [String], required: true },
});

ResponseSchema.set("toObject", { virtuals: true });
ResponseSchema.set("toJSON", { virtuals: true });

export const Response = mongoose.models.Response || mongoose.model<IResponse>("Response", ResponseSchema);
