import "dotenv/config";

import mongoose from "mongoose";
import { Permission } from "../models/permission.js";
import { connectToDatabase } from "../mongodb.js";

const permissions = [
  
  { name: "get_user" },
  { name: "create_user" },
  { name: "update_user" },
  { name: "delete_user" },

  { name: "get_post" },
  { name: "create_post" },
  { name: "delete_post" },

  { name: "update_profile" },

  {name: "get_data"},
  {name: "create_data"},

  {name: "create_response"}
];

async function seedPermissions() {
  try {
    await connectToDatabase();

    for (const perm of permissions) {
      const exists = await Permission.findOne({ name: perm.name });
      if (exists) {
        console.log(`Permission "${perm.name}" already exists, skipping...`);
        continue;
      }
      await Permission.create(perm);
      console.log(`Permission "${perm.name}" created.`);
    }
  } catch (error) {
    console.error("Error seeding permissions:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seedPermissions();
