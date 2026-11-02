import mongoose from "mongoose";

declare global {
  var _mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const cached = global._mongooseConn ?? { conn: null, promise: null };
global._mongooseConn = cached;

/**
 * Process-wide cached connection (HMR-safe). Pool and timeouts are bounded
 * so one instance holds at most maxPoolSize sockets and a hung MongoDB
 * fails fast instead of piling up requests without bound.
 */
export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  if (!cached.promise) {
    console.log("[MongoDB] Connecting to database...");

    cached.promise = mongoose
      .connect(uri, {
        dbName: process.env.MONGODB_DB,
        maxPoolSize: 50,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 30000,
      })
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
