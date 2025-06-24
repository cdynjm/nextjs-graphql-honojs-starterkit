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
