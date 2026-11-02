import { Elysia } from "elysia";
import { container } from "./core/container";

// Boot background workers once per process (idempotent under HMR).
container.startWorkers();

/**
 * Composition root: the HTTP graph is assembled from controller plugins.
 * Controllers/services are built in `core/container` (DIP); this file
 * only mounts them - no business logic lives here (SRP).
 * NOTE: register() returns fully-inferred Elysia instances so the Eden
 * treaty type (`App`) keeps exact route types for the frontend.
 */
const app = new Elysia({ prefix: "/api" })
  .use(container.helloController.register())
  .use(container.userController.register())
  .use(container.urlController.register())
  .use(container.analyticsController.register())
  .use(container.deviceController.register())
  .use(container.pageController.register())
  .use(container.mailController.register());

export type App = typeof app;
export { app };
