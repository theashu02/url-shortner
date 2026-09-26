import Redis from "ioredis";

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  return "redis://127.0.0.1:6379";
};

declare global {
  var _redis: Redis | undefined;
}

const createRedisInstance = () => {
  const client = new Redis(getRedisUrl(), {
    maxRetriesPerRequest: null,
    lazyConnect: false,
  });

  client.on("connect", () => {
    console.log("[Redis] Connecting...");
  });

  client.on("ready", () => {
    console.log("[Redis] Connected successfully!");
  });

  client.on("error", (err) => {
    console.error("[Redis] Connection error:", err.message);
  });

  return client;
};

// Always cache on globalThis so Turbopack/HMR module re-evaluations reuse the same connection
const redis = globalThis._redis ?? createRedisInstance();
globalThis._redis = redis;

export { redis };
export default redis;

