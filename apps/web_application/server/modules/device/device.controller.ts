import { Elysia, t } from "elysia";
import { SHORT_CODE_RE } from "@/lib/constant";
import { BaseController } from "@/server/core/controller";
import { RateLimitError, NotFoundError } from "@/server/core/http-errors";
import type { IAuthService } from "@/server/core/auth";
import type { DeviceService } from "./device.service";
import type { DeviceDetails } from "@/lib/device-info";

const num = t.Optional(t.Union([t.Number(), t.Null()]));
const str = t.Optional(t.Union([t.String(), t.Null()]));
const bool = t.Optional(t.Union([t.Boolean(), t.Null()]));

const deviceDetailsSchema = t.Object({
  screenWidth: num,
  screenHeight: num,
  viewportWidth: num,
  viewportHeight: num,
  touchSupport: bool,
  cpuCores: num,
  deviceMemory: num,
  platform: str,
  clientTimezone: str,
  clientUa: str,
  connectionType: str,
  connectionDownlink: num,
  connectionRtt: num,
  connectionSaveData: bool,
  uaPlatform: str,
  uaPlatformVersion: str,
  uaArchitecture: str,
  uaBitness: str,
  uaModel: str,
  uaMobile: bool,
});

/** SRP: HTTP adapter for the device capture endpoints. */
export class DeviceController extends BaseController {
  constructor(
    auth: IAuthService,
    private readonly devices: DeviceService,
  ) {
    super(auth);
  }

  register() {
    const app = new Elysia({ prefix: "/device" })
      .post(
        "/capture",
        async ({ body, request }) => {
          const allowed = await this.devices.checkRateLimit(this.devices.getRequestIp(request.headers));
          if (!allowed) throw new RateLimitError();
          const ok = await this.devices.saveDeviceDetails(
            body.eventId,
            body.shortCode,
            body.device as DeviceDetails,
          );
          if (!ok) throw new NotFoundError("Click event not found.");
          return { ok: true };
        },
        {
          body: t.Object({
            eventId: t.String({ pattern: "^[a-fA-F0-9]{24}$" }),
            shortCode: t.String({ pattern: SHORT_CODE_RE.source }),
            device: deviceDetailsSchema,
          }),
        },
      )
      .post(
        "/continued",
        async ({ body, request }) => {
          const allowed = await this.devices.checkRateLimit(this.devices.getRequestIp(request.headers));
          if (!allowed) throw new RateLimitError();
          const ok = await this.devices.markContinued(body.eventId, body.shortCode);
          if (!ok) throw new NotFoundError("Click event not found.");
          return { ok: true };
        },
        {
          body: t.Object({
            eventId: t.String({ pattern: "^[a-fA-F0-9]{24}$" }),
            shortCode: t.String({ pattern: SHORT_CODE_RE.source }),
          }),
        },
      );

    return this.registerErrorHook(app, "device");
  }
}
