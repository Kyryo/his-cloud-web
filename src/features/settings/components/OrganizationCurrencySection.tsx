"use client";

import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { UpdateTenantCurrencyDialog } from "@/features/settings/components/UpdateTenantCurrencyDialog";
import { fetchOrganizationCurrency } from "@/features/settings/services/settings.service";
import type { TenantCurrency } from "@/features/settings/types/settings.types";

export function OrganizationCurrencySection() {
  const [currencyData, setCurrencyData] = useState<TenantCurrency | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCurrency() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await fetchOrganizationCurrency();
        if (active) {
          setCurrencyData(data);
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load currency settings.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadCurrency();

    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return <Skeleton className="h-4 w-24" />;
  }

  if (loadError) {
    return <span className="text-sm text-brand-muted">{loadError}</span>;
  }

  const currencyCode = currencyData?.currency_code;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-brand-navy">
          {currencyCode || "—"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-brand-muted hover:text-brand-navy"
          onClick={() => setDialogOpen(true)}
          data-testid="update-organization-currency-button"
        >
          Update
        </Button>
      </div>

      <UpdateTenantCurrencyDialog
        currencyData={currencyData}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onUpdated={setCurrencyData}
      />
    </>
  );
}
