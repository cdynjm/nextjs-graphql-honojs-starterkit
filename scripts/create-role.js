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
import { graphql as graphqlExec } from "graphql";
import { ${safeRole}Schema } from "../schema/${safeRole}-schema";
import { setCorsHeaders } from "@/lib/cors-header";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { authMiddlewareJWT } from "@/app/api/middleware/auth-middleware-jwt";

const app = new Hono().basePath("/graphql/${safeRole}");
app.use("*", authMiddlewareJWT);

const schema = ${safeRole}Schema;

const rootValue = {
  // Add your resolvers here
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
`;

  fs.writeFileSync(routeFile, routeTemplate);
  console.log(`✅ Created route.ts: ${routeFile}`);
} else {
  console.log(`⚠️ route.ts already exists: ${routeFile}`);
}

// === 3. MODIFY middleware.ts ===
const middlewarePath = path.join("middleware.ts");
let middlewareContent = fs.readFileSync(middlewarePath, "utf8");

// === 3.1 DETERMINE IF ROLE EXISTS ===
const roleMapRegex =
  /const roleAccessMap: Record<string, string\[]> = {([\s\S]*?)}/;
const match = roleMapRegex.exec(middlewareContent);

if (!match) {
  throw new Error("Could not find roleAccessMap in middleware.ts");
}

const mapContent = match[1];

// Does the role already exist?
const existingRoleRegex = new RegExp(`["'\`]${safeRole}["'\`]:`);
if (existingRoleRegex.test(mapContent)) {
  console.log(`✅ Role "${safeRole}" already exists in roleAccessMap`);
} else {
  // === 3.2 ADD TO roleAccessMap ===
  const newAccessEntry = `  "${safeRole}": ["/${safeRole}", "/graphql/${safeRole}", "/graphql/resolver/${safeRole}", "/api/${safeRole}/"],`;

  middlewareContent = middlewareContent.replace(roleMapRegex, (full, inner) => {
    const cleanedInner = inner.trim().replace(/,\s*$/, ""); // remove trailing comma
    return `const roleAccessMap: Record<string, string[]> = {\n${cleanedInner},\n${newAccessEntry}\n}`;
  });

  console.log(`✅ Added "${safeRole}" to roleAccessMap`);
}

// === 3.3 ADD REDIRECT RULE ===
const newRedirectLine = `if (token.roleName === "${safeRole}") return NextResponse.redirect(new URL("/${safeRole}/dashboard", req.url));`;

if (!middlewareContent.includes(newRedirectLine)) {
  const redirectBlockRegex = /if \(pathname === ["']\/["'] \|\| pathname === ["']\/register["']\) {([\s\S]*?)}/m;
  middlewareContent = middlewareContent.replace(
    redirectBlockRegex,
    (fullMatch, body) => {
      return fullMatch.replace(body, `${body}\n      ${newRedirectLine}`);
    }
  );
  console.log(`✅ Added redirect rule for "${safeRole}"`);
} else {
  console.log(`✅ Redirect rule for "${safeRole}" already exists`);
}

// === 3.4 ADD TO MATCHER ===
const matcherRegex = /matcher:\s*\[\s*([\s\S]*?)\]/m;
const matcherMatch = matcherRegex.exec(middlewareContent);

if (matcherMatch) {
  const inner = matcherMatch[1];

  const newMatchers = [
    `/${safeRole}/:path*`,
    `/graphql/${safeRole}/:path*`,
    `/graphql/resolver/${safeRole}/:path*`,
    `/api/${safeRole}/:path*`,
  ];

  const lines = inner
    .split(/,\s*/)
    .map((line) => line.trim().replace(/^"+|"+$/g, ""))
    .filter(Boolean);

  newMatchers.forEach((m) => {
    if (!lines.includes(m)) {
      lines.push(m);
    }
  });

  const newMatcherBlock = `matcher: [\n    ${lines.map((l) => `"${l}"`).join(",\n    ")}\n  ]`;
  middlewareContent = middlewareContent.replace(matcherRegex, newMatcherBlock);

  console.log(`✅ Updated matcher with "${safeRole}" routes`);
} else {
  console.warn("⚠️ matcher block not found in middleware.ts");
}

// === 4. WRITE BACK ===
fs.writeFileSync(middlewarePath, middlewareContent, "utf8");
console.log(`✅ Updated middleware.ts for role "${safeRole}"`);


// === 5. GENERATE NEW SEEDER ===

const defaultPermissions = [""];

const seederContent = `import "dotenv/config";

import mongoose from "mongoose";
import { Role } from "../models/role.js";
import { Permission } from "../models/permission.js";
import { connectToDatabase } from "../mongodb.js";

const roleName = "${safeRole}";
const permissionNames = ${JSON.stringify(defaultPermissions, null, 2)};

async function seedRole() {
  try {
    await connectToDatabase();

    let role = await Role.findOne({ name: roleName });
    const permissions = await Permission.find({ name: { $in: permissionNames } });
    const permissionDocs = permissions.map((p) => ({
      _id: p._id,
      name: p.name,
    }));

    if (role) {
      console.log(\`Role "\${roleName}" already exists, checking permissions...\`);

      const currentPermissionIds = role.permissions.map((p: { _id: mongoose.Types.ObjectId }) => p._id.toString());

      // Find permissions that are missing from the current role
      const newPermissions = permissionDocs.filter(
        (p) => !currentPermissionIds.includes(p._id.toString())
      );

      if (newPermissions.length === 0) {
        console.log(\`All permissions are already assigned to role "\${roleName}".\`);
      } else {
        role.permissions.push(...newPermissions);
        await role.save();
        console.log(\`Added \${newPermissions.length} new permission(s) to role "\${roleName}".\`);
      }
    } else {
      role = new Role({
        name: roleName,
        permissions: permissionDocs,
      });

      await role.save();
      console.log(\`Role "\${roleName}" created with permissions.\`);
    }
  } catch (error) {
    console.error("Error seeding role:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seedRole();
`;

const seederFilename = `seed-role-${safeRole}.ts`;
const seederPath = path.join("lib/db/seeders", seederFilename);

fs.writeFileSync(seederPath, seederContent, "utf8");
console.log(`✅ Created seeder: ${seederFilename}`);


// === 6. UPDATE redirectUserByRole.ts ===

const redirectPath = path.join("lib/redirect.ts");
let redirectContent = fs.readFileSync(redirectPath, "utf8");

const newCase = `\n    case "${safeRole}":\n      router.push("/${safeRole}/dashboard");\n      break;`;

// Regex to find the last `case` in switch
const switchRegex = /switch\s*\(role\)\s*{([\s\S]*?)default:/m;
const matchSwitch = switchRegex.exec(redirectContent);

if (matchSwitch) {
  const casesBlock = matchSwitch[1];
  if (!casesBlock.includes(`case "${safeRole}":`)) {
    const insertIndex = matchSwitch.index + matchSwitch[0].indexOf("default:");
    redirectContent =
      redirectContent.slice(0, insertIndex) +
      newCase +
      "\n  " +
      redirectContent.slice(insertIndex);

    fs.writeFileSync(redirectPath, redirectContent, "utf8");
    console.log(`✅ Updated redirectUserByRole.ts with role: "${safeRole}"`);
  } else {
    console.log(`ℹ️ redirectUserByRole.ts already has role: "${safeRole}"`);
  }
} else {
  console.warn(
    "⚠️ Could not find switch block in redirectUserByRole.ts — check the file format."
  );
}
