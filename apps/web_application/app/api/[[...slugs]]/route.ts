import { app } from "@/server";
import { checkGlobalRequestBudget } from "@/server/core/request-guard";

async function guardedHandle(request: Request): Promise<Response> {
  const verdict = checkGlobalRequestBudget(request);
  if (!verdict.allowed) {
    return Response.json(
      { message: "Too many requests. Slow down and try again shortly." },
      {
        status: 429,
        headers: { "retry-after": String(verdict.retryAfterSeconds) },
      },
    );
  }
  return app.handle(request);
}

export const GET = guardedHandle;
export const POST = guardedHandle;
export const PUT = guardedHandle;
export const PATCH = guardedHandle;
export const DELETE = guardedHandle;
export const HEAD = guardedHandle;
export const OPTIONS = guardedHandle;