"use client";

import {
  AdvancedOptions,
  ComposerForm,
  ComposerHeader,
  ComposerResult,
  ModeSelector,
  SideRail,
} from "@/components/customLinks";
import { useAppSelector } from "@/store";

export default function CustomLinksPage() {
  const succeeded = useAppSelector(
    (state) =>
      state.customLinks.status === "succeeded" && state.customLinks.result !== null,
  );

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <ComposerHeader />
        <ModeSelector />

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-5">
            {succeeded ? (
              <ComposerResult />
            ) : (
              <>
                <ComposerForm />
                <AdvancedOptions />
              </>
            )}
          </div>
          <SideRail />
        </div>
      </div>
    </div>
  );
}
