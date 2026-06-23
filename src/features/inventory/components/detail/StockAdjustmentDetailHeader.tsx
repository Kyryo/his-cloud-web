"use client";

import { Calendar, MoreVertical, Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { StockAdjustmentStatusBadge } from "@/features/inventory/components/InventoryStatusBadge";
import { fetchInventoryLocations } from "@/features/inventory/services/inventory.service";
import type { StockAdjustment } from "@/features/inventory/types/inventory.types";
import {
  formatAdjustmentTypeLabel,
  formatDisplayDateTime,
} from "@/features/inventory/utils/format-inventory";

type StockAdjustmentDetailHeaderProps = {
  adjustment: StockAdjustment;
  onUpdate?: () => void;
  actions?: ReactNode;
};

export function StockAdjustmentDetailHeader({
  adjustment,
  onUpdate,
  actions,
}: StockAdjustmentDetailHeaderProps) {
  const [locationLabels, setLocationLabels] = useState<Record<number, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadLocations() {
      try {
        const response = await fetchInventoryLocations();
        if (!cancelled) {
          setLocationLabels(
            Object.fromEntries(response.results.map((location) => [location.id, location.name])),
          );
        }
      } catch {
        if (!cancelled) {
          setLocationLabels({});
        }
      }
    }

    void loadLocations();

    return () => {
      cancelled = true;
    };
  }, []);

  const locationLabel =
    locationLabels[adjustment.location] ?? `Location ${adjustment.location}`;

  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-brand-navy sm:text-xl">
              {formatAdjustmentTypeLabel(adjustment.adjustment_type)} · {locationLabel}
            </h1>
            <StockAdjustmentStatusBadge status={adjustment.status} />
          </div>

          <p className="mt-1 font-mono text-sm text-brand-muted">
            {adjustment.reference_number}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
              Created {formatDisplayDateTime(adjustment.created_at)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {onUpdate ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  aria-label="Stock adjustment actions"
                  data-testid="stock-adjustment-actions-menu-button"
                >
                  <MoreVertical className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={onUpdate}
                  data-testid="stock-adjustment-update-menu-item"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                  Update details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {actions}
        </div>
      </div>
    </DetailPageHeaderSection>
  );
}
