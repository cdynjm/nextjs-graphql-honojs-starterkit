import "dotenv/config";

import mongoose from "mongoose";
import { Role } from "../models/role.js";
import { Permission } from "../models/permission.js";
import { connectToDatabase } from "../mongodb.js";

const roleName = "admin";
const permissionNames = [
  "get_user",
  "create_user",
  "update_user",
  "delete_user",
  "get_post",
  "create_post",
  "delete_post",
  "update_profile",
];

async function seedRole() {
  try {
    await connectToDatabase();

    // Find the role by name
    let role = await Role.findOne({ name: roleName });

    // Find all permissions by names in permissionNames
    const permissions = await Permission.find({ name: { $in: permissionNames } });

    // Map permissions to {_id, name}
    const permissionDocs = permissions.map((p) => ({
      _id: p._id,
      name: p.name,
    }));

    if (role) {
      console.log(`Role "${roleName}" already exists, checking permissions...`);

      // Extract current permission IDs of the role as strings
      const currentPermissionIds = role.permissions.map((p: { _id: mongoose.Types.ObjectId }) => p._id.toString());

      // Find permissions that are missing from the current role
      const newPermissions = permissionDocs.filter(
        (p) => !currentPermissionIds.includes(p._id.toString())
      );

      if (newPermissions.length === 0) {
        console.log(`All permissions are already assigned to role "${roleName}".`);
      } else {
        // Add new permissions to the role's permissions array
        role.permissions.push(...newPermissions);

        // Save the updated role
        await role.save();
        console.log(
          `Added ${newPermissions.length} new permission(s) to role "${roleName}".`
        );
      }
    } else {
      // Role does not exist, create it
      role = new Role({
        name: roleName,
        permissions: permissionDocs,
      });

      await role.save();
      console.log(`Role "${roleName}" created with permissions.`);
    }
  } catch (error) {
    console.error("Error seeding role:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seedRole();
