"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  confirmCatalogPriceChange,
  fetchCatalogPriceChanges,
  rejectCatalogPriceChange,
} from "@/features/catalog/services/catalog.service";
import type {
  CatalogPricelist,
  CatalogPriceChange,
} from "@/features/catalog/types/catalog.types";
import { formatInventoryAmount } from "@/features/inventory/utils/format-inventory";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { useUser } from "@/providers/user-provider";

type PricelistDetailPriceChangesTabProps = {
  pricelist: CatalogPricelist;
  isActive: boolean;
};

export function PricelistDetailPriceChangesTab({
  pricelist,
  isActive,
}: PricelistDetailPriceChangesTabProps) {
  const { toast } = useToast();
  const { userData } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);
  const [items, setItems] = useState<CatalogPriceChange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [pendingUuid, setPendingUuid] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchCatalogPriceChanges({
        pageSize: 100,
        status: "PENDING",
      });
      setItems(
        response.results.filter((change) => change.pricelist_uuid === pricelist.uuid),
      );
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : "Failed to load price changes.");
    } finally {
      setIsLoading(false);
    }
  }, [pricelist.uuid]);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    void loadItems();
  }, [isActive, loadItems]);

  async function handleConfirm(changeUuid: string) {
    setPendingUuid(changeUuid);
    try {
      await confirmCatalogPriceChange(changeUuid);
      toast({
        variant: "success",
        title: "Price change confirmed",
        description: "The pending price change was approved.",
      });
      await loadItems();
    } catch (err) {
      toast({
        variant: "error",
        title: "Could not confirm change",
        description:
          err instanceof BffError
            ? formatBffErrorMessage(err.message, err.errors)
            : err instanceof Error
              ? err.message
              : "Something went wrong.",
      });
    } finally {
      setPendingUuid(null);
    }
  }

  async function handleReject(changeUuid: string) {
    const reason = rejectReasons[changeUuid]?.trim();
    if (!reason) {
      toast({
        variant: "error",
        title: "Reason required",
        description: "Enter a reason before rejecting this change.",
      });
      return;
    }

    setPendingUuid(changeUuid);
    try {
      await rejectCatalogPriceChange(changeUuid, reason);
      toast({
        variant: "success",
        title: "Price change rejected",
        description: "The pending price change was rejected.",
      });
      await loadItems();
    } catch (err) {
      toast({
        variant: "error",
        title: "Could not reject change",
        description:
          err instanceof BffError
            ? formatBffErrorMessage(err.message, err.errors)
            : err instanceof Error
              ? err.message
              : "Something went wrong.",
      });
    } finally {
      setPendingUuid(null);
    }
  }

  if (!isActive) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-6 py-16 text-sm text-brand-muted">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading pending changes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p>{error}</p>
        <SecondaryButton type="button" className="mt-4" onClick={() => void loadItems()}>
          Try again
        </SecondaryButton>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="pricelist-approvals-tab">
      <div>
        <h3 className="text-sm font-semibold text-brand-navy">Pending price changes</h3>
        <p className="mt-0.5 text-xs text-brand-muted">
          Two-person approval queue for this pricelist.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-border bg-white px-6 py-14 text-center">
          <h3 className="text-lg font-semibold text-brand-navy">No pending changes</h3>
          <p className="mt-2 text-sm text-brand-muted">
            Price updates requiring approval will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((change) => (
            <div
              key={change.uuid}
              className="rounded-xl border border-brand-border bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-brand-navy">
                    {change.action} · {change.product_uuid}
                  </p>
                  <p className="mt-1 text-xs text-brand-muted">
                    {formatInventoryAmount(change.old_price)} →{" "}
                    {formatInventoryAmount(change.new_price)}
                  </p>
                </div>
                {isTenantAdmin ? (
                  <div className="flex flex-wrap gap-2">
                    <PrimaryButton
                      type="button"
                      size="sm"
                      disabled={pendingUuid === change.uuid}
                      onClick={() => void handleConfirm(change.uuid)}
                    >
                      Confirm
                    </PrimaryButton>
                  </div>
                ) : null}
              </div>
              {isTenantAdmin ? (
                <div className="mt-4 space-y-2">
                  <Label htmlFor={`reject-reason-${change.uuid}`}>Rejection reason</Label>
                  <Input
                    id={`reject-reason-${change.uuid}`}
                    value={rejectReasons[change.uuid] ?? ""}
                    onChange={(event) =>
                      setRejectReasons((current) => ({
                        ...current,
                        [change.uuid]: event.target.value,
                      }))
                    }
                    placeholder="Required to reject"
                  />
                  <SecondaryButton
                    type="button"
                    size="sm"
                    className={cn("text-red-600 hover:text-red-700")}
                    disabled={pendingUuid === change.uuid}
                    onClick={() => void handleReject(change.uuid)}
                  >
                    Reject
                  </SecondaryButton>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
