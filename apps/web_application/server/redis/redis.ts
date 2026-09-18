import Redis from "ioredis";

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  return "redis://127.0.0.1:6379";
};

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

const createRedisInstance = () => {
  const client = new Redis(getRedisUrl());

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

const redis = globalForRedis.redis ?? createRedisInstance();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export { redis };
export default redis;
