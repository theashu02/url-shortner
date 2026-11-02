import { Elysia, t } from "elysia";
import { BaseController } from "@/server/core/controller";
import type { IAuthService } from "@/server/core/auth";
import type { UserService } from "./user.service";

/** SRP: HTTP adapter for profile endpoints. */
export class UserController extends BaseController {
  constructor(
    auth: IAuthService,
    private readonly profiles: UserService,
  ) {
    super(auth);
  }

  register() {
    const app = new Elysia()
      .get("/user/me", async ({ request }) => {
        const userId = await this.requireUserId(request);
        return this.profiles.getProfileOrThrow(userId);
      })
      .patch(
        "/user/update",
        async ({ body, request }) => {
          const userId = await this.requireUserId(request);
          return this.profiles.updateProfileOrThrow(userId, body);
        },
        {
          body: t.Object({
            name: t.Optional(t.String()),
            handle: t.Optional(t.String()),
            bio: t.Optional(t.String()),
            image: t.Optional(t.String()),
          }),
        },
      )
      .patch(
        "/user/image",
        async ({ body, request }) => {
          const userId = await this.requireUserId(request);
          return this.profiles.updateImageOrThrow(userId, body.imageFile);
        },
        { body: t.Object({ imageFile: t.File() }) },
      )
      .delete("/user/image", async ({ request }) => {
        const userId = await this.requireUserId(request);
        return this.profiles.deleteImageOrThrow(userId);
      });

    return this.registerErrorHook(app, "user");
  }
}

