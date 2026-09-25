import mongoose from "mongoose";

async function check() {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/url-shortener",
  );
  const db = mongoose.connection.db;
  if (!db) {
    console.log("No DB connection");
    return process.exit(1);
  }
  const urls = await db
    .collection("urls")
    .find()
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();
  console.log("Raw MongoDB documents (most recent):");
  for (const u of urls) {
    console.log(`- ${u.shortCode} | expiresAt: ${u.expiresAt} | url: ${u.url}`);
  }
  process.exit(0);
}

check().catch(console.error);
