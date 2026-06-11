"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { ROUTES } from "@/constants/routes";
import { fetchInventoryProductStockLocations } from "@/features/inventory/services/inventory.service";
import type {
  InventoryProduct,
  InventoryProductStockLocation,
} from "@/features/inventory/types/inventory.types";
import { formatInventoryQuantity } from "@/features/inventory/utils/format-inventory";

type ProductDetailAvailabilityTabProps = {
  product: InventoryProduct;
  isActive: boolean;
};

export function ProductDetailAvailabilityTab({
  product,
  isActive,
}: ProductDetailAvailabilityTabProps) {
  const [locations, setLocations] = useState<InventoryProductStockLocation[]>([]);
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
        const records = await fetchInventoryProductStockLocations(product.id);
        if (!cancelled) {
          setLocations(records);
        }
      } catch (err) {
        if (!cancelled) {
          setLocations([]);
          setError(
            err instanceof Error ? err.message : "Failed to load stock locations.",
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
        data-testid="product-locations-tab"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading locations...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
        data-testid="product-locations-tab"
      >
        {error}
      </div>
    );
  }

  return (
    <div data-testid="product-locations-tab">
      <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
        <div className="border-b border-brand-border px-4 py-2.5">
          <h3 className="text-sm font-semibold text-brand-navy">Stock by location</h3>
          <p className="mt-0.5 text-xs text-brand-muted">
            Clinics and locations with on-hand quantity for this product.
          </p>
        </div>

        {locations.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <h4 className="text-lg font-semibold text-brand-navy">No stock on hand</h4>
            <p className="mt-2 text-sm text-brand-muted">
              This product has no positive stock at any location you can access.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/80 text-left text-xs uppercase tracking-wide text-brand-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Clinic</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 text-right font-medium">On hand</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {locations.map((entry) => (
                  <tr key={`${entry.location.id}-${entry.clinic.id}`}>
                    <td className="px-4 py-3 font-medium text-brand-navy">
                      {entry.location.name}
                    </td>
                    <td className="px-4 py-3 text-brand-slate">{entry.clinic.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-brand-muted">
                      {entry.location.code || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-brand-navy">
                      {formatInventoryQuantity(entry.quantity_on_hand)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`${ROUTES.inventoryStock}?odoo_product_id=${product.id}&location=${entry.location.id}`}
                        className="text-xs font-medium text-brand-primary hover:underline"
                      >
                        View stock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
