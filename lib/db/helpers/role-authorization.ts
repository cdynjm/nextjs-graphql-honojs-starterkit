import { connectToDatabase } from "@/lib/db/mongodb";
import { Role } from "@/lib/db/models/role";
import mongoose from "mongoose";

/**
 * Check if a user’s role allows the given action.
 * @param roleId The ObjectId of the user’s Role
 * @param requiredPermission The required permission name (e.g. "create_user")
 * @returns boolean
 */
export async function checkRoleAuthorization(
  roleId: string,
  requiredPermission: string
) {
  await connectToDatabase();

  const role = await Role.findById(new mongoose.Types.ObjectId(roleId)).lean();

  if (!role) {
    throw new Error("Role not found");
  }

  // Ensure role.permissions exists and is an array
  const permissions = (role as { permissions?: { name: string }[] }).permissions;

  if (!Array.isArray(permissions)) {
    throw new Error("Role permissions not found");
  }

  const hasPermission = permissions.some(
    (perm) => perm.name === requiredPermission
  );

  return hasPermission;
}
