import { Elysia } from "elysia";
import { BaseController } from "@/server/core/controller";
import type { IAuthService } from "@/server/core/auth";

/** Trivial controller kept as a class for uniformity (OCP: extend, don"t edit). */
export class HelloController extends BaseController {
  constructor(auth: IAuthService) {
    super(auth);
  }

  register() {
    const app = new Elysia().get("/hello", () => "Hello from Elysia!");
    return this.registerErrorHook(app, "hello");
  }
}
