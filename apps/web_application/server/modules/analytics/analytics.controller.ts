import { Elysia, t } from "elysia";
import { BaseController } from "@/server/core/controller";
import type { IAuthService } from "@/server/core/auth";
import type { AnalyticsService } from "./analytics.service";

/** SRP: HTTP adapter for analytics. */
export class AnalyticsController extends BaseController {
  constructor(
    auth: IAuthService,
    private readonly analytics: AnalyticsService,
  ) {
    super(auth);
  }

  register() {
    const app = new Elysia({ prefix: "/analytics" })
      .get("/summary", async ({ request }) => {
        const userId = await this.requireUserId(request);
        return this.analytics.getAnalyticsSummary(userId);
      })
      .get(
        "/:shortCode",
        async ({ params: { shortCode }, request, set }) => {
          const userId = await this.requireUserId(request);
          const result = await this.analytics.getLinkAnalytics(shortCode, userId);
          if ("status" in result) {
            set.status = result.status;
            return { message: result.message };
          }
          return result;
        },
        { params: t.Object({ shortCode: t.String() }) },
      );

    return this.registerErrorHook(app, "analytics");
  }
}
