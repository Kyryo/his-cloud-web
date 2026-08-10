"use client";

import { CheckCircle2, ChevronDown, Loader2, PackagePlus, ShieldOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBanner } from "@/components/ui/status-banner";
import { addCatalogPricelistProduct } from "@/features/catalog/services/catalog.service";
import { fetchInventoryProductPricelists } from "@/features/inventory/services/inventory.service";
import {
  repriceSalesOrderLine,
} from "@/features/sales-orders/services/sales-orders.service";
import type {
  SalesOrder,
  SalesOrderLine,
} from "@/features/sales-orders/types/sales-order.types";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import { orderHasPricelist } from "@/features/sales-orders/utils/sales-order-line-payability";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export type NonPayableLineDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: SalesOrder;
  line: SalesOrderLine | null;
  canEdit: boolean;
  onOrderUpdated: (order: SalesOrder) => void;
};

function defaultFixedPrice(line: SalesOrderLine | null): string {
  if (!line) return "";
  if (line.list_price_at_order != null && line.list_price_at_order !== "") {
    return String(line.list_price_at_order);
  }
  if (line.price_unit != null && line.price_unit !== "") {
    return String(line.price_unit);
  }
  return "";
}

export function NonPayableLineDialog({
  open,
  onOpenChange,
  order,
  line,
  canEdit,
  onOrderUpdated,
}: NonPayableLineDialogProps) {
  const [isCheckingMembership, setIsCheckingMembership] = useState(false);
  const [isOnPricelist, setIsOnPricelist] = useState<boolean | null>(null);
  const [fixedPrice, setFixedPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reasonExpanded, setReasonExpanded] = useState(false);

  const hasOrderPricelist = orderHasPricelist(order);
  const pricelistUuid = order.pricelist_uuid?.trim() || null;
  const pricelistName = order.pricelist_name?.trim() || "this order's pricelist";
  const productUuid = line?.product_uuid?.trim() || null;
  const productName =
    line?.product_name?.trim() || line?.name?.trim() || "This product";

  const canAct = Boolean(
    canEdit && line?.id != null && hasOrderPricelist && pricelistUuid && productUuid,
  );

  useEffect(() => {
    if (!open || !line) return;

    setFixedPrice(defaultFixedPrice(line));
    setError(null);
    setIsOnPricelist(null);

    if (!hasOrderPricelist || !pricelistUuid || !productUuid) {
      setIsOnPricelist(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      setIsCheckingMembership(true);
      try {
        const memberships = await fetchInventoryProductPricelists(productUuid);
        if (cancelled) return;
        setIsOnPricelist(
          memberships.some((item) => item.pricelist_uuid === pricelistUuid),
        );
      } catch {
        if (!cancelled) {
          // Fall back to the common missing-membership explanation.
          setIsOnPricelist(false);
        }
      } finally {
        if (!cancelled) {
          setIsCheckingMembership(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, line?.id, hasOrderPricelist, pricelistUuid, productUuid]);

  const explanation = useMemo(() => {
    if (!hasOrderPricelist) {
      return "This line is marked non-payable because the sales order has no pricelist, so insurer pricing cannot be applied.";
    }
    if (isOnPricelist) {
      return `${productName} is already on ${pricelistName}, but this line is still priced as client-only. Apply the pricelist price to make it payable.`;
    }
    return `This line is marked non-payable because ${productName} is not available in ${pricelistName} as a product. Without a pricelist price, the insurer share is not calculated and the line stays client-only (NP).`;
  }, [hasOrderPricelist, isOnPricelist, pricelistName, productName]);

  const reasonText = isCheckingMembership
    ? "Checking pricelist membership…"
    : explanation;

  useEffect(() => {
    if (!open) return;
    setReasonExpanded(false);
  }, [open, reasonText]);

  async function handleSubmit() {
    if (!line?.id || !canAct) return;
    setIsSubmitting(true);
    setError(null);
    try {
      if (!isOnPricelist) {
        const parsedPrice = Number(fixedPrice);
        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
          setError("Enter a valid fixed price of zero or greater.");
          return;
        }

        const result = await addCatalogPricelistProduct(pricelistUuid!, {
          product_uuid: productUuid!,
          fixed_price: parsedPrice.toFixed(4),
        });

        if (result.approval_required) {
          setError(
            "Adding this product requires approval. Once approved, reopen this dialog and apply the pricelist price.",
          );
          return;
        }
      }

      const updated = await repriceSalesOrderLine(order.id, line.id);
      onOrderUpdated(updated);
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof BffError
          ? formatBffErrorMessage(err.message, err.errors)
          : err instanceof Error
            ? err.message
            : "Could not update payability for this line.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md",
          appFont.className,
        )}
        data-testid="non-payable-line-dialog"
      >
        <DialogHeader className="border-b border-brand-border px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700">
              <ShieldOff className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 space-y-1">
              <DialogTitle>Non-payable line</DialogTitle>
              <DialogDescription>
                Why this line is marked NP, and how to make it insurer-payable.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {error ? <StatusBanner variant="error" message={error} /> : null}

          <div className="rounded-xl border border-brand-border bg-slate-50/80 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              Line item
            </p>
            <p className="mt-1 text-sm font-medium text-brand-navy">{productName}</p>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-brand-muted">Pricelist</dt>
                <dd className="mt-0.5 font-medium text-brand-navy">
                  {order.pricelist_name || "None"}
                </dd>
              </div>
              <div>
                <dt className="text-brand-muted">Current price</dt>
                <dd className="mt-0.5 font-medium text-brand-navy">
                  {formatSalesOrderAmount(line?.price_unit)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
                Why it&apos;s non-payable
              </p>
              {!isCheckingMembership ? (
                <button
                  type="button"
                  className="inline-flex size-7 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-slate-100 hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
                  aria-expanded={reasonExpanded}
                  aria-label={
                    reasonExpanded
                      ? "Collapse non-payable reason"
                      : "Expand non-payable reason"
                  }
                  onClick={() => setReasonExpanded((current) => !current)}
                  data-testid="non-payable-reason-toggle"
                >
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform",
                      reasonExpanded && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>
              ) : null}
            </div>
            <p
              className={cn(
                "text-sm leading-relaxed text-brand-navy",
                !reasonExpanded && "line-clamp-2",
              )}
              data-testid="non-payable-reason"
            >
              {reasonText}
            </p>
          </div>

          {canAct && !isCheckingMembership && isOnPricelist === false ? (
            <div className="space-y-3 rounded-xl border border-brand-border px-4 py-4">
              <div className="flex items-start gap-2">
                <PackagePlus
                  className="mt-0.5 size-4 shrink-0 text-brand-primary"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium text-brand-navy">
                    Add to {pricelistName}
                  </p>
                  <p className="mt-1 text-xs text-brand-muted">
                    Set the insurer pricelist price, then we&apos;ll refresh this
                    line so it becomes payable.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="np-fixed-price">Fixed price</Label>
                <Input
                  id="np-fixed-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={fixedPrice}
                  disabled={isSubmitting}
                  onChange={(event) => setFixedPrice(event.target.value)}
                  data-testid="non-payable-fixed-price"
                />
              </div>
            </div>
          ) : null}

          {canAct && !isCheckingMembership && isOnPricelist ? (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-emerald-700"
                aria-hidden="true"
              />
              <p className="text-sm text-emerald-900">
                Product is already on the pricelist. Apply the pricelist price to
                this line to clear the NP badge.
              </p>
            </div>
          ) : null}

          {!canEdit ? (
            <p className="text-sm text-brand-muted">
              This order isn&apos;t editable, so payability can&apos;t be changed
              here.
            </p>
          ) : !hasOrderPricelist ? (
            <p className="text-sm text-brand-muted">
              Assign a pricelist to this order before this line can be made
              payable.
            </p>
          ) : !pricelistUuid ? (
            <p className="text-sm text-brand-muted">
              This order&apos;s pricelist is missing a reference id, so the
              product can&apos;t be added from here.
            </p>
          ) : !productUuid ? (
            <p className="text-sm text-brand-muted">
              This line is missing a product reference, so it can&apos;t be added
              to the pricelist from here.
            </p>
          ) : null}
        </div>

        <DialogFooter className="border-t border-brand-border px-6 py-4">
          <SecondaryButton
            type="button"
            size="sm"
            className="px-4"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Close
          </SecondaryButton>
          {canAct ? (
            <PrimaryButton
              type="button"
              size="sm"
              className="px-4"
              disabled={isSubmitting || isCheckingMembership}
              onClick={() => void handleSubmit()}
              data-testid="non-payable-resolve-button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Updating...
                </>
              ) : isOnPricelist ? (
                "Apply pricelist price"
              ) : (
                "Add & make payable"
              )}
            </PrimaryButton>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
