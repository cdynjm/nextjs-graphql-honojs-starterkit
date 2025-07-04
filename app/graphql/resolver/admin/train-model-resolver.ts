import { connectToDatabase } from "@/lib/db/mongodb";
import { checkUserAuthorization } from "@/lib/db/helpers/user-authorization";
import { Data } from "@/lib/db/models/data";

export const trainModelResolver = {
  getData: async () => {
    await checkUserAuthorization("get_data");
    await connectToDatabase();

    const docs = await Data.find({}, "label").lean();
    const filtered = docs.filter(d => d.label !== undefined && d.label !== null);
    const uniqueMap = new Map();
    filtered.forEach(doc => {
      if (!uniqueMap.has(doc.label)) {
        uniqueMap.set(doc.label, { label: doc.label });
      }
    });

    const unique = Array.from(uniqueMap.values());
    return unique;
  }
};

