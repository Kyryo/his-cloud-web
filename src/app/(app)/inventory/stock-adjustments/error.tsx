"use client";

import { InventoryRouteError } from "@/features/inventory/components/InventoryRouteError";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <InventoryRouteError error={error} reset={reset} title="Could not load stock adjustments" />
  );
}
