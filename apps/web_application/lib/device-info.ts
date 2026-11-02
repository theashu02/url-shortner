/**
 * Browser-side device information collection.
 * Only reads properties browsers legitimately expose; every read is optional
 * and guarded so unsupported browsers simply report null.
 */
export interface DeviceDetails {
  screenWidth: number | null;
  screenHeight: number | null;
  viewportWidth: number | null;
  viewportHeight: number | null;
  touchSupport: boolean | null;
  cpuCores: number | null;
  deviceMemory: number | null;
  platform: string | null;
  clientTimezone: string | null;
  clientUa: string | null;
  connectionType: string | null;
  connectionDownlink: number | null;
  connectionRtt: number | null;
  connectionSaveData: boolean | null;
  uaPlatform: string | null;
  uaPlatformVersion: string | null;
  uaArchitecture: string | null;
  uaBitness: string | null;
  uaModel: string | null;
  uaMobile: boolean | null;
}

interface NavigatorUADataLike {
  platform: string;
  mobile: boolean;
  getHighEntropyValues(hints: string[]): Promise<Record<string, unknown>>;
}

interface NetworkInformationLike {
  effectiveType?: unknown;
  downlink?: unknown;
  rtt?: unknown;
  saveData?: unknown;
}

type ExtendedNavigator = Navigator & {
  deviceMemory?: unknown;
  connection?: NetworkInformationLike;
  userAgentData?: NavigatorUADataLike;
};

export function emptyDeviceDetails(): DeviceDetails {
  return {
    screenWidth: null,
    screenHeight: null,
    viewportWidth: null,
    viewportHeight: null,
    touchSupport: null,
    cpuCores: null,
    deviceMemory: null,
    platform: null,
    clientTimezone: null,
    clientUa: null,
    connectionType: null,
    connectionDownlink: null,
    connectionRtt: null,
    connectionSaveData: null,
    uaPlatform: null,
    uaPlatformVersion: null,
    uaArchitecture: null,
    uaBitness: null,
    uaModel: null,
    uaMobile: null,
  };
}

export function shouldSkipCapture(): boolean {
  return (
    typeof navigator !== "undefined" && navigator.doNotTrack === "1"
  );
}

function toInt(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.floor(value)
    : null;
}

function toNum(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toStr(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function toBool(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

export async function collectDeviceInfo(): Promise<DeviceDetails> {
  const details = emptyDeviceDetails();
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return details;
  }

  try {
    details.screenWidth = toInt(window.screen?.width);
    details.screenHeight = toInt(window.screen?.height);
    details.viewportWidth = toInt(window.innerWidth);
    details.viewportHeight = toInt(window.innerHeight);
    details.touchSupport =
      "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0;
    details.cpuCores = toInt(navigator.hardwareConcurrency);

    const nav = navigator as ExtendedNavigator;
    details.deviceMemory = toNum(nav.deviceMemory);
    details.platform = toStr(navigator.platform);
    details.clientUa = toStr(navigator.userAgent);

    try {
      details.clientTimezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
    } catch {
      // Timezone unavailable — keep null.
    }

    const conn = nav.connection;
    if (conn) {
      details.connectionType = toStr(conn.effectiveType);
      details.connectionDownlink = toNum(conn.downlink);
      details.connectionRtt = toInt(conn.rtt);
      details.connectionSaveData = toBool(conn.saveData);
    }

    const uaData = nav.userAgentData;
    if (uaData) {
      details.uaPlatform = toStr(uaData.platform);
      details.uaMobile = toBool(uaData.mobile);
      try {
        const high = await uaData.getHighEntropyValues([
          "platformVersion",
          "architecture",
          "bitness",
          "model",
        ]);
        details.uaPlatformVersion = toStr(high.platformVersion);
        details.uaArchitecture = toStr(high.architecture);
        details.uaBitness = toStr(high.bitness);
        details.uaModel = toStr(high.model);
      } catch {
        // High-entropy hints restricted — keep nulls.
      }
    }
  } catch {
    // Never throw: partial details are fine.
  }

  return details;
}
