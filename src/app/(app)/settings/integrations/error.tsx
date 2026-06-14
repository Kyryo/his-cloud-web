"use client";

import { SettingsRouteError } from "@/features/settings/components/SettingsRouteError";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SettingsRouteError
      error={error}
      reset={reset}
      title="Could not load integrations settings"
    />
  );
}
