import { graphql as graphqlExec } from "graphql";
import { adminSchema } from "../schema/admin-schema";
import { setCorsHeaders } from "@/lib/cors-header";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { authMiddlewareJWT } from "@/app/api/middleware/auth-middleware-jwt";

import { userResolver } from "../resolver/admin/user-resolver";
import { dashboardResolver } from "../resolver/admin/dashboard-resolver";

const app = new Hono().basePath("/graphql/admin");
app.use("*", authMiddlewareJWT);

const schema = adminSchema;

const rootValue = {
  ...userResolver,
  ...dashboardResolver,
};

app.post("/", async (c) => {
  const { query, variables } = await c.req.json();

  const result = await graphqlExec({
    schema,
    source: query,
    rootValue,
    variableValues: variables,
  });

  const res = new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  return setCorsHeaders(res);
});

app.options("/", () => {
  const res = new Response(null, { status: 204 });
  return setCorsHeaders(res);
});

export const POST = handle(app);
export const OPTIONS = handle(app);
