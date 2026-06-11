"use client";

import { Button } from "@/components/ui/button";

type InventoryRouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
};

export function InventoryRouteError({
  error,
  reset,
  title = "Something went wrong",
}: InventoryRouteErrorProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <h2 className="text-sm font-semibold text-red-800">{title}</h2>
      <p className="mt-2 text-sm text-red-700">{error.message}</p>
      <Button type="button" variant="outline" className="mt-4" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
