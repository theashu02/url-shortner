import { treaty } from "@elysia/eden";
import type { App } from "@/server";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3000";
};

export const api = treaty<App>(getBaseUrl()).api;
