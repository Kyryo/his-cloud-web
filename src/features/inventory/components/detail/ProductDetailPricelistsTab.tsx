"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { fetchInventoryProductPricelists } from "@/features/inventory/services/inventory.service";
import type {
  InventoryProduct,
  InventoryProductPricelistItem,
} from "@/features/inventory/types/inventory.types";
import {
  formatDisplayDate,
  formatInventoryAmount,
  formatPricelistComputePrice,
} from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

type ProductDetailPricelistsTabProps = {
  product: InventoryProduct;
  isActive: boolean;
};

export function ProductDetailPricelistsTab({
  product,
  isActive,
}: ProductDetailPricelistsTabProps) {
  const [items, setItems] = useState<InventoryProductPricelistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const records = await fetchInventoryProductPricelists(product.id);
        if (!cancelled) {
          setItems(records);
        }
      } catch (err) {
        if (!cancelled) {
          setItems([]);
          setError(
            err instanceof Error ? err.message : "Failed to load pricelists.",
          );
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
  }, [isActive, product.id]);

  if (!isActive) {
    return null;
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-6 py-16 text-sm text-brand-muted"
        data-testid="product-pricelists-tab"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading pricelists...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
        data-testid="product-pricelists-tab"
      >
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className="rounded-xl border border-brand-border bg-white px-6 py-14 text-center"
        data-testid="product-pricelists-tab"
      >
        <h3 className="text-lg font-semibold text-brand-navy">No pricelist rules</h3>
        <p className="mt-2 text-sm text-brand-muted">
          This product is not on any ERP pricelist yet.
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl border border-brand-border bg-white"
      data-testid="product-pricelists-tab"
    >
      <div className="border-b border-brand-border px-4 py-2.5">
        <h3 className="text-sm font-semibold text-brand-navy">Pricelist rules</h3>
        <p className="mt-0.5 text-xs text-brand-muted">
          Product-specific pricing from ERP pricelists.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-wide text-brand-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Pricelist</th>
              <th className="px-4 py-3 font-medium">Rule</th>
              <th className="px-4 py-3 text-right font-medium">Min qty</th>
              <th className="px-4 py-3 text-right font-medium">Fixed price</th>
              <th className="px-4 py-3 text-right font-medium">Discount</th>
              <th className="px-4 py-3 font-medium">Valid from</th>
              <th className="px-4 py-3 font-medium">Valid to</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {items.map((item) => (
              <tr key={item.id} className="text-brand-navy">
                <td className="px-4 py-3 font-medium">
                  {item.pricelist?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-brand-slate">
                  {formatPricelistComputePrice(item.compute_price)}
                </td>
                <td className="px-4 py-3 text-right">
                  {item.min_quantity ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatInventoryAmount(item.fixed_price)}
                </td>
                <td className="px-4 py-3 text-right">
                  {item.percent_price != null && item.percent_price !== ""
                    ? `${item.percent_price}%`
                    : "—"}
                </td>
                <td className={cn("px-4 py-3 text-brand-slate")}>
                  {formatDisplayDate(
                    typeof item.date_start === "string" ? item.date_start : null,
                  )}
                </td>
                <td className="px-4 py-3 text-brand-slate">
                  {formatDisplayDate(
                    typeof item.date_end === "string" ? item.date_end : null,
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
