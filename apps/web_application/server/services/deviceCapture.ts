import { container } from "@/server/core/container";

export type { CaptureConfig } from "@/server/modules/device/device.service";

/** Backward-compatible facade over DeviceService (OOP). */
export const getCaptureConfig = container.deviceService.getCaptureConfig.bind(container.deviceService);
export const getRequestIp = container.deviceService.getRequestIp.bind(container.deviceService);
export const checkDeviceRateLimit = container.deviceService.checkRateLimit.bind(container.deviceService);
export const createInterstitialClickEvent = container.deviceService.createInterstitialClickEvent.bind(container.deviceService);
export const sanitizeDeviceDetails = container.deviceService.sanitizeDeviceDetails.bind(container.deviceService);
export const saveDeviceDetails = container.deviceService.saveDeviceDetails.bind(container.deviceService);
export const markContinued = container.deviceService.markContinued.bind(container.deviceService);
