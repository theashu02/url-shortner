import { treaty } from "@elysia/eden";
import { app, type App } from "@/server";

// process is defined on server side and build time
export const api = typeof process !== "undefined" ? treaty(app).api : treaty<App>("localhost:3000").api;
