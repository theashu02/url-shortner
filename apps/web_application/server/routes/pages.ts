import { container } from "@/server/core/container";
export const pagesRoute = container.pageController.register();
export { PAGES_RATE_LIMITS } from "@/server/modules/pages/page.controller";
