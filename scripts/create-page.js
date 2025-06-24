// scripts/create-page.js
import fs from "fs";
import path from "path";

function toPascalCase(str) {
  return str
    .replace(/[-_]+/g, " ")
    .replace(/\s+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^(.)/, (_, chr) => chr.toUpperCase());
}

const pagePath = process.argv[2]; // e.g., admin/blog

if (!pagePath) {
  console.error("❌ Please provide a page path: npm run create:page admin/blog");
  process.exit(1);
}

const pathParts = pagePath.split("/");
const pageName = pathParts[pathParts.length - 1]; // "blog"
const pascalName = toPascalCase(pageName) + "Page";

// ========== Create Page ==========

const pageDir = path.join("app", ...pathParts);

if (fs.existsSync(pageDir)) {
  console.error("❌ Page already exists.");
  process.exit(1);
}

fs.mkdirSync(pageDir, { recursive: true });

const pageTemplate = `\
"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/components/page-title-context";
import { getGraphQLClient } from "@/lib/graphql-client";
import { useSession } from "next-auth/react";

export default function ${pascalName}() {
  const { setTitle } = usePageTitle();
  const { data: session } = useSession();

  useEffect(() => {
    setTitle("${toPascalCase(pageName)}");
    return () => setTitle("");
  }, [setTitle]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const graphQLClient = getGraphQLClient("/graphql/admin", session?.token);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const endpoint = "/api/admin/${pageName}";

  return (
    <div>
      <h1>${toPascalCase(pageName)} Page</h1>
    </div>
  );
}
`;

fs.writeFileSync(path.join(pageDir, "page.tsx"), pageTemplate);

// ========== Create Resolver ==========

const resolverDir = path.join("app", "graphql", "resolver", ...pathParts.slice(0, -1)); // e.g., graphql/resolver/admin
const resolverPath = path.join(resolverDir, `${pageName}-resolver.ts`);

if (fs.existsSync(resolverPath)) {
  console.error("❌ Resolver already exists.");
  process.exit(1);
}

fs.mkdirSync(resolverDir, { recursive: true });

const resolverTemplate = `\
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { connectToDatabase } from "@/lib/db/mongodb";

export const ${pageName}Resolver = {
  // Add your GraphQL resolvers for ${pageName} here
};
`;

fs.writeFileSync(resolverPath, resolverTemplate);

// ========== Create API Route ==========

const apiDir = path.join("app", "api", ...pathParts);
const apiRoutePath = path.join(apiDir, "route.ts");

if (fs.existsSync(apiRoutePath)) {
  console.error("❌ API route already exists.");
  process.exit(1);
}

fs.mkdirSync(apiDir, { recursive: true });

// Build the basePath string for Hono from pathParts
// Example: if pathParts = ['admin', 'dashboard']
// then basePath = "/api/admin/dashboard"
const basePath = "/api/" + pathParts.join("/");

const apiTemplate = `\
import { Hono } from "hono";
import { handle } from "hono/vercel";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { connectToDatabase } from "@/lib/db/mongodb";
import { authMiddlewareJWT } from "../../middleware/auth-middleware-jwt";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { decrypt, generateKey } from "@/lib/crypto";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Types } from "mongoose";

const app = new Hono().basePath("${basePath}");
app.use("*", authMiddlewareJWT);

app.post("/", async () => {});
app.put("/", async () => {});
app.delete("/", async () => {});

export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
`;

fs.writeFileSync(apiRoutePath, apiTemplate);
