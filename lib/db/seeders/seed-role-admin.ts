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
];

async function seedRole() {
  try {
    await connectToDatabase();

    let role = await Role.findOne({ name: roleName });
    if (role) {
      console.log(`Role "${roleName}" already exists, skipping creation.`);
    } else {
      // Find permissions and map to { _id, name }
      const permissions = await Permission.find({
        name: { $in: permissionNames },
      });

      const permissionDocs = permissions.map((p) => ({
        _id: p._id,
        name: p.name,
      }));

      role = new Role({
        name: roleName,
        permissions: permissionDocs, // store _id + name
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
