import { container } from "@/server/core/container";
export const helloRoute = container.helloController.register();
