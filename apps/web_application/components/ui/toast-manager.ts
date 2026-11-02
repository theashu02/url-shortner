"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";

export const TOAST_DEFAULT_TIMEOUT_MS = 1200;
export const TOAST_DEFAULT_LIMIT = 3;

const baseToastManager = ToastPrimitive.createToastManager();

export type ToastAddOptions = Parameters<typeof baseToastManager.add>[0];

function withTimeout(options: ToastAddOptions): ToastAddOptions {
  return { ...options, timeout: options.timeout ?? TOAST_DEFAULT_TIMEOUT_MS };
}

export const toast: Omit<typeof baseToastManager, "add"> & {
  add: (options: ToastAddOptions) => string;
  success: (description: React.ReactNode, options?: Partial<ToastAddOptions>) => string;
  error: (description: React.ReactNode, options?: Partial<ToastAddOptions>) => string;
} = {
  ...baseToastManager,
  add: (options) => baseToastManager.add(withTimeout(options)),
  success: (description, options) =>
    baseToastManager.add(
      withTimeout({ type: "success", title: "Success", description, ...options }),
    ),
  error: (description, options) =>
    baseToastManager.add(
      withTimeout({ type: "error", title: "Error", description, ...options }),
    ),
};

export const createToastManager = ToastPrimitive.createToastManager;
export const useToastManager = ToastPrimitive.useToastManager;