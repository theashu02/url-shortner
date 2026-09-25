import mongoose from "mongoose";
import { connectToDatabase } from "./server/db/mongoose";
import { UrlModel } from "./server/models/url";

async function dropIndex() {
  try {
    await connectToDatabase();
    console.log("Connected to database.");

    const indexes = await UrlModel.collection.indexes();
    const ttlIndex = indexes.find((i) => i.name === "expiresAt_1");
    
    if (ttlIndex) {
      await UrlModel.collection.dropIndex("expiresAt_1");
      console.log("Successfully dropped TTL index on expiresAt.");
    } else {
      console.log("Index expiresAt_1 not found. It might have already been dropped.");
    }
  } catch (error) {
    console.error("Error dropping index:", error);
  } finally {
    mongoose.connection.close();
  }
}

dropIndex();
