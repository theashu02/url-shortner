import { Elysia, t } from "elysia";
import { SHORT_CODE_RE } from "@/lib/constant";
import {
  checkDeviceRateLimit,
  getRequestIp,
  markContinued,
  saveDeviceDetails,
} from "@/server/services/deviceCapture";
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

const shortCodeField = t.String({ pattern: SHORT_CODE_RE.source });
const eventIdField = t.String({ pattern: "^[a-fA-F0-9]{24}$" });

export const deviceRoute = new Elysia({ prefix: "/device" })

  .post(
    "/capture",
    async ({ body, request, set }) => {
      try {
        const allowed = await checkDeviceRateLimit(
          getRequestIp(request.headers),
        );
        if (!allowed) {
          set.status = 429;
          return { message: "Rate limit exceeded. Try again later." };
        }

        const result = await saveDeviceDetails(
          body.eventId,
          body.shortCode,
          body.device as DeviceDetails,
        );
        if (result === "not-found") {
          set.status = 404;
          return { message: "Click event not found." };
        }
        return { ok: true };
      } catch (err) {
        console.error("[device] capture:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      body: t.Object({
        eventId: eventIdField,
        shortCode: shortCodeField,
        device: deviceDetailsSchema,
      }),
    },
  )

  .post(
    "/continued",
    async ({ body, request, set }) => {
      try {
        const allowed = await checkDeviceRateLimit(
          getRequestIp(request.headers),
        );
        if (!allowed) {
          set.status = 429;
          return { message: "Rate limit exceeded. Try again later." };
        }

        const result = await markContinued(body.eventId, body.shortCode);
        if (result === "not-found") {
          set.status = 404;
          return { message: "Click event not found." };
        }
        return { ok: true };
      } catch (err) {
        console.error("[device] continued:", err);
        set.status = 500;
        return { message: "Internal server error" };
      }
    },
    {
      body: t.Object({
        eventId: eventIdField,
        shortCode: shortCodeField,
      }),
    },
  );
