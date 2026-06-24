"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { ROUTES } from "@/constants/routes";
import { useInventoryLocations } from "@/features/inventory/hooks/use-inventory-locations";
import { cn } from "@/lib/utils";

type InventoryNoLocationsAlertProps = {
  enabled?: boolean;
  className?: string;
};

export function InventoryNoLocationsAlert({
  enabled = true,
  className,
}: InventoryNoLocationsAlertProps) {
  const { data, isLoading } = useInventoryLocations(undefined, enabled);
  const isEmpty = enabled && !isLoading && (data?.results.length ?? 0) === 0;

  if (!isEmpty) {
    return null;
  }

  return (
    <Alert
      variant="warning"
      className={cn(className)}
      data-testid="inventory-no-locations-alert"
    >
      <AlertTriangle className="size-4" aria-hidden="true" />
      <AlertDescription>
        No locations have been set up yet.{" "}
        <Link
          href={ROUTES.settingsOrganization}
          className="font-medium text-amber-950 underline underline-offset-2 hover:text-amber-900"
        >
          Set up locations
        </Link>{" "}
        to get started.
      </AlertDescription>
    </Alert>
  );
}
