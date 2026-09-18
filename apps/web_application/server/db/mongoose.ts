import mongoose from "mongoose";

declare global {
  var _mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const cached = global._mongooseConn ?? { conn: null, promise: null };
global._mongooseConn = cached;

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!cached.promise) {
    console.log("[MongoDB] Connecting to database...");
    cached.promise = mongoose
      .connect(uri, { dbName: process.env.MONGODB_DB })
      .then((m) => {
        console.log("[MongoDB] Connected successfully!");
        return m;
      })
      .catch((err) => {
        console.error("[MongoDB] Connection error:", err);
        cached.promise = null;
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
