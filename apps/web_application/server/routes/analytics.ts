import { Elysia, t } from "elysia";
import { getAuthUserId } from "@/server/lib/auth";
import { getAnalyticsSummary, getLinkAnalytics } from "@/server/services/analytics";

export const analyticsRoute = new Elysia({ prefix: "/analytics" })
  .get(
    "/summary",
    async ({ request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }

        const result = await getAnalyticsSummary(userId);
        return result;
      } catch (err) {
        console.error("[analytics] list:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    }
  )
  .get(
    "/:shortCode",
    async ({ params: { shortCode }, request, set }) => {
      try {
        const userId = await getAuthUserId(request);
        if (!userId) {
          set.status = 401;
          return { message: "Unauthorized. Please log in." };
        }

        const result = await getLinkAnalytics(shortCode, userId);
        
        if ("status" in result) {
          set.status = result.status;
          return { message: result.message };
        }

        return result;
      } catch (err) {
        console.error("[analytics] detail:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      params: t.Object({ shortCode: t.String() }),
    }
  );
