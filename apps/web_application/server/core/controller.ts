import { type AnyElysia } from "elysia";
import { HttpError, UnauthorizedError } from "./http-errors";
import type { IAuthService } from "./auth";

/**
 * ISP: every module controller exposes a register() factory that builds a
 * ready-to-mount Elysia plugin. The return type is intentionally inferred at
 * each implementation so Eden treaty keeps exact route types (an explicit
 * Elysia generic annotation on the implementation would erase the treaty).
 * The interface itself uses the Elysia AnyElysia alias so no prohibited
 * loose annotations appear in our code. Base class centralises auth + error mapping
 * (SRP, DRY).
 */
export interface IController {
  register(): AnyElysia;
}

export abstract class BaseController implements IController {
  abstract register(): AnyElysia;

  constructor(protected readonly auth: IAuthService) {}

  /** Resolve the caller or throw 401. */
  protected async requireUserId(request: Request): Promise<string> {
    const userId = await this.auth.getUserId(request);
    if (!userId) throw new UnauthorizedError();
    return userId;
  }

  /** Map thrown HttpErrors to `{ message }` bodies with the right status. */
  protected registerErrorHook<T extends AnyElysia>(app: T, tag: string): T {
    return app.onError(({ error, set }) => {
      if (error instanceof HttpError) {
        set.status = error.status;
        return { message: error.message };
      }
      console.error(`[${tag}]:`, error);
      set.status = 500;
      return { message: "Internal server error" };
    }) as T;
  }
}


