"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { ROUTES } from "@/constants/routes";
import { fetchInventoryLocations } from "@/features/inventory/services/inventory.service";
import { cn } from "@/lib/utils";

type InventoryNoLocationsAlertProps = {
  enabled?: boolean;
  className?: string;
};

export function InventoryNoLocationsAlert({
  enabled = true,
  className,
}: InventoryNoLocationsAlertProps) {
  const [isEmpty, setIsEmpty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setIsEmpty(false);
      setIsLoading(true);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        const response = await fetchInventoryLocations();
        if (!cancelled) {
          setIsEmpty(response.results.length === 0);
        }
      } catch {
        if (!cancelled) {
          setIsEmpty(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!enabled || isLoading || !isEmpty) {
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
