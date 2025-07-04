import { Hono } from "hono";
import { handle } from "hono/vercel";
import { connectToDatabase } from "@/lib/db/mongodb";
import { authMiddlewareJWT } from "../../middleware/auth-middleware-jwt";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { decrypt, generateKey } from "@/lib/crypto";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Types } from "mongoose";
import { checkUserAuthorization } from "@/lib/db/helpers/user-authorization";
import { Data } from "@/lib/db/models/data";
import { Response } from "@/lib/db/models/responses";

const app = new Hono().basePath("/api/admin/train-model");

app.use("*", authMiddlewareJWT);

app.post("/", async (c) => {
  const body = await c.req.json();
  const { type } = body;

  if (type === "data") {
    await checkUserAuthorization("create_data");

    await connectToDatabase();

    const { text, label } = body;

    const newData = new Data({
      text,
      label,
    });

    await newData.save();

    return c.json({ message: "Data has been added successfully" }, 200);
  }

  if (type === "response") {
  await checkUserAuthorization("create_response");

  await connectToDatabase();

  const { label, responses } = await c.req.json();

  if (!Array.isArray(responses) || responses.length === 0) {
    return c.json({ error: "Responses must be a non-empty array" }, 400);
  }

  const existing = await Response.findOne({ label });

  if (existing) {
    // Merge new responses, remove duplicates
    const updatedResponses = Array.from(new Set([...existing.response, ...responses]));
    existing.response = updatedResponses;
    await existing.save();
  } else {
    const newResponse = new Response({
      label,
      response: responses, // save as is if new
    });
    await newResponse.save();
  }

  return c.json({ message: "Responses have been added successfully" }, 200);
}

});
app.put("/", async () => {
  await checkUserAuthorization("");
});
app.delete("/", async () => {
  await checkUserAuthorization("");
});

export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
