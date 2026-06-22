"use client";

import { SettingsRouteError } from "@/features/settings/components/SettingsRouteError";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <SettingsRouteError title="Admin page failed" error={error} reset={reset} />;
}
