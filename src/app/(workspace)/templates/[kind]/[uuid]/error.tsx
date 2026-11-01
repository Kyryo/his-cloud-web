"use client";

import Link from "next/link";
import { useEffect } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { ROUTES } from "@/constants/routes";
import { logFetchError } from "@/lib/fetch-error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logFetchError("oh-template-builder:route", error);
  }, [error]);

  return (
    <div className="flex h-full items-center justify-center bg-dash-canvas px-6">
      <div className="w-full max-w-md rounded-2xl border border-dash-border bg-white p-6">
        <h2 className="text-base font-semibold text-brand-navy">
          The template builder hit a problem
        </h2>
        <p className="mt-2 text-sm text-dash-muted">
          Your saved changes are safe. Reload the builder or go back to settings.
        </p>
        <div className="mt-5 flex gap-2">
          <PrimaryButton type="button" onClick={reset}>
            Try again
          </PrimaryButton>
          <SecondaryButton asChild>
            <Link href={ROUTES.settingsModuleOccupationalHealth}>Back to settings</Link>
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
