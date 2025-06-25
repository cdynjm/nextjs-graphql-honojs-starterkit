import fs from "fs";
import path from "path";

const roleName = process.argv[2];

if (!roleName) {
  console.error("❌ Please provide a role name: npm run role user");
  process.exit(1);
}

// Convert to kebab-case just in case
const safeRole = roleName.trim().toLowerCase();

// Directory paths
const appDir = path.join("app", safeRole);
const apiDir = path.join("app", "api", safeRole);
const gqlDir = path.join("app", "graphql", safeRole);
const resolverDir = path.join("app", "graphql", "resolver", safeRole);
const schemaDir = path.join("app", "graphql", "schema");

// Ensure folders are created
[appDir, apiDir, gqlDir, resolverDir, schemaDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created: ${dir}`);
  }
});

// Schema file
const schemaFile = path.join(schemaDir, `${safeRole}-schema.ts`);
if (!fs.existsSync(schemaFile)) {
  const schemaTemplate = `\
import { buildSchema } from "graphql";
import { gql } from "graphql-request";

export const ${safeRole}Schema = buildSchema(gql\`\`);
`;

  fs.writeFileSync(schemaFile, schemaTemplate);
  console.log(`✅ Created schema: ${schemaFile}`);
} else {
  console.log(`⚠️ Schema already exists: ${schemaFile}`);
}

// ===== Create route.ts in app/graphql/{role}/route.ts =====

const routeFile = path.join(gqlDir, "route.ts");

if (!fs.existsSync(routeFile)) {
  // Template for route.ts
  const routeTemplate = `\
import { NextRequest, NextResponse } from "next/server";
import { graphql as graphqlExec } from "graphql";
import { ${safeRole}Schema } from "../schema/${safeRole}-schema";
import { setCorsHeaders } from "@/lib/cors-header";

const schema = ${safeRole}Schema;

const rootValue = {
  // Add your resolvers here
};

export async function POST(req: NextRequest) {
  const { query, variables } = await req.json();

  const result = await graphqlExec({
    schema,
    source: query,
    rootValue,
    variableValues: variables,
  });

  const res = NextResponse.json(result);
  setCorsHeaders(res);
  return res;
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  setCorsHeaders(res);
  return res;
}
`;

  fs.writeFileSync(routeFile, routeTemplate);
  console.log(`✅ Created route.ts: ${routeFile}`);
} else {
  console.log(`⚠️ route.ts already exists: ${routeFile}`);
}

// === 3. MODIFY middleware.ts ===
const middlewarePath = path.join("middleware.ts");
let middlewareContent = fs.readFileSync(middlewarePath, "utf8");

// 3.1 DETERMINE NEXT ROLE ID
const roleMapRegex =
  /const roleAccessMap: Record<number, string\[]> = {([\s\S]*?)}/;
const match = roleMapRegex.exec(middlewareContent);

let nextRoleId = 1;
if (match) {
  const mapContent = match[1];
  const numbers = [...mapContent.matchAll(/(\d+):/g)].map((m) =>
    parseInt(m[1])
  );
  if (numbers.length > 0) nextRoleId = Math.max(...numbers) + 1;
}

// 3.2 ADD TO roleAccessMap
const newAccessEntry = `${nextRoleId}: ["/${safeRole}", "/graphql/${safeRole}", "/graphql/resolver/${safeRole}", "/api/${safeRole}/"], // ${
  safeRole[0].toUpperCase() + safeRole.slice(1)
}\n`;

middlewareContent = middlewareContent.replace(roleMapRegex, (full, inner) => {
  const cleanedInner = inner.trim().replace(/,\s*$/, ""); // clean trailing comma
  return `const roleAccessMap: Record<number, string[]> = {\n${cleanedInner},\n${newAccessEntry}}`;
});

// === 3. ADD REDIRECT RULE IF NOT EXISTS ===
const redirectRegex =
  /(if \(role === \d+\)[\s\S]*?return NextResponse\.redirect.*?;)(?![\s\S]*if \(role ===)/g;
const newRedirectLine = `if (role === ${nextRoleId})\n          return NextResponse.redirect(new URL("/${safeRole}/dashboard", req.url));`;

if (!middlewareContent.includes(newRedirectLine)) {
  const matches = [...middlewareContent.matchAll(redirectRegex)];
  if (matches.length > 0) {
    const lastMatch = matches[matches.length - 1];
    const insertIndex =
      (lastMatch.index !== undefined ? lastMatch.index : 0) +
      lastMatch[0].length;
    middlewareContent =
      middlewareContent.slice(0, insertIndex) +
      `\n        ${newRedirectLine}` +
      middlewareContent.slice(insertIndex);
  } else {
    // fallback: no match found, maybe insert inside "/" check block
    console.warn(
      "⚠️ No role redirect block found. Inserting fallback redirect."
    );
    middlewareContent = middlewareContent.replace(
      /if \(pathname === ["']\/["'][\s\S]*?{([\s\S]*?)}/,
      (fullMatch, body) => {
        return fullMatch.replace(body, `${body}\n        ${newRedirectLine}`);
      }
    );
  }
}

// 3.4 ADD TO MATCHER
const matcherRegex = /matcher:\s*\[\s*([\s\S]*?)\]/m;
const newMatchers = [
  `/${safeRole}/:path*`,
  `/graphql/${safeRole}/:path*`,
  `/graphql/resolver/${safeRole}/:path*`,
  `/api/${safeRole}/:path*`,
];

middlewareContent = middlewareContent.replace(matcherRegex, (full, inner) => {
  const lines = inner
    .split(/,\s*/)
    .map((line) => line.trim().replace(/^"+|"+$/g, "")) // strip any extra quotes
    .filter(Boolean);

  newMatchers.forEach((m) => {
    if (!lines.includes(m)) {
      lines.push(m);
    }
  });

  return `matcher: [\n    ${lines.map((l) => `"${l}"`).join(",\n    ")}\n  ]`;
});

// === 4. WRITE BACK TO middleware.ts ===
fs.writeFileSync(middlewarePath, middlewareContent, "utf8");
console.log(
  `✅ Updated middleware.ts with role '${safeRole}' as ID ${nextRoleId}`
);
