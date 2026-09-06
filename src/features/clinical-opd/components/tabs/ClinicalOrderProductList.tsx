"use client";

import { Check, Loader2, Plus, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { fetchCatalogProducts } from "@/features/catalog/services/catalog.service";
import type { ClinicalOrderItemType } from "@/features/clinical-opd/schemas/clinical-opd.schema";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 250;

type ClinicalOrderProductListProps = {
  itemType: ClinicalOrderItemType;
  enabled: boolean;
  busyProductUuid: string | null;
  /** productUuid → visit order uuid for active orders on this encounter */
  orderedProductOrderUuids: ReadonlyMap<string, string>;
  onAddProduct: (product: InventoryProduct) => void;
  onCancelOrder: (product: InventoryProduct, orderUuid: string) => void;
};

function catalogFiltersForItemType(itemType: ClinicalOrderItemType) {
  switch (itemType) {
    case "LABORATORY":
      return {
        product_type: "service",
        is_lab_test: true,
        sale_ok: true,
        active: true,
      } as const;
    case "RADIOLOGY":
      return {
        product_type: "service",
        is_radiology: true,
        sale_ok: true,
        active: true,
      } as const;
    case "PROCEDURE":
      return {
        product_type: "service",
        is_procedure: true,
        procedure_context: "opd",
        sale_ok: true,
        active: true,
      } as const;
    case "SUNDRY":
      return {
        is_sundry: true,
        sale_ok: true,
        active: true,
      } as const;
    default:
      return {
        sale_ok: true,
        active: true,
      } as const;
  }
}

export function ClinicalOrderProductList({
  itemType,
  enabled,
  busyProductUuid,
  orderedProductOrderUuids,
  onAddProduct,
  onCancelOrder,
}: ClinicalOrderProductListProps) {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    setSearchInput("");
    setDebouncedSearch("");
    setProducts([]);
    setPage(1);
    setHasNext(false);
    setError(null);
  }, [itemType]);

  const loadProducts = useCallback(
    async (nextPage: number, options: { append: boolean }) => {
      if (!enabled) {
        return;
      }

      const requestId = ++requestIdRef.current;
      if (options.append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await fetchCatalogProducts({
          ...catalogFiltersForItemType(itemType),
          search: debouncedSearch || undefined,
          page: nextPage,
          pageSize: PAGE_SIZE,
        });
        if (requestId !== requestIdRef.current) {
          return;
        }
        setProducts((current) =>
          options.append ? [...current, ...response.results] : response.results,
        );
        setPage(nextPage);
        setHasNext(Boolean(response.pagination?.next));
      } catch {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setError("Could not load products.");
        if (!options.append) {
          setProducts([]);
          setHasNext(false);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [debouncedSearch, enabled, itemType],
  );

  useEffect(() => {
    void loadProducts(1, { append: false });
  }, [loadProducts]);

  const isBusy = Boolean(busyProductUuid);

  return (
    <div className="space-y-4" data-testid="clinical-order-product-list">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brand-muted"
          aria-hidden="true"
        />
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search products…"
          className="pl-9"
          data-testid="clinical-order-product-search"
          aria-label="Search products"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-brand-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading products…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-dash-border px-3 py-8 text-center text-sm text-brand-muted">
          {debouncedSearch
            ? "No matching products found."
            : "No products available for this order type."}
        </div>
      ) : (
        <ul className="divide-y divide-dash-border/70 overflow-hidden rounded-xl border border-dash-border/80">
          {products.map((product) => {
            const orderUuid = orderedProductOrderUuids.get(product.uuid);
            const isOrdered = Boolean(orderUuid);
            const isRowBusy = busyProductUuid === product.uuid;

            return (
              <li key={product.uuid}>
                <div
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-3",
                    isBusy && !isRowBusy && "opacity-70",
                  )}
                  data-testid={`clinical-order-product-row-${product.uuid}`}
                >
                  <button
                    type="button"
                    disabled={isBusy || isOrdered}
                    onClick={() => onAddProduct(product)}
                    className={cn(
                      "min-w-0 flex-1 text-left transition-colors",
                      !isOrdered && "hover:text-brand-primary",
                      (isBusy || isOrdered) && "cursor-default",
                    )}
                    data-testid={`clinical-order-product-add-${product.uuid}`}
                  >
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {formatProductLabel(product)}
                    </p>
                    <p className="truncate text-xs text-brand-muted">
                      {[product.default_code, product.uom_name]
                        .filter(Boolean)
                        .join(" · ") || "Service"}
                    </p>
                  </button>

                  {isOrdered && orderUuid ? (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span
                        className="inline-flex size-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700"
                        aria-label="Ordered"
                        data-testid={`clinical-order-product-ordered-${product.uuid}`}
                      >
                        {isRowBusy ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Check className="size-4" />
                        )}
                      </span>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onCancelOrder(product, orderUuid)}
                        className={cn(
                          "inline-flex size-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700 transition-colors",
                          "hover:bg-red-100 disabled:cursor-wait disabled:opacity-70",
                        )}
                        aria-label={`Cancel order for ${formatProductLabel(product)}`}
                        data-testid={`clinical-order-product-cancel-${product.uuid}`}
                      >
                        {isRowBusy ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <X className="size-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onAddProduct(product)}
                      className={cn(
                        "inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-brand-border bg-white text-brand-primary transition-colors",
                        "hover:bg-brand-tint disabled:cursor-wait disabled:opacity-70",
                      )}
                      aria-label={`Add ${formatProductLabel(product)}`}
                      data-testid={`clinical-order-product-plus-${product.uuid}`}
                    >
                      {isRowBusy ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {hasNext ? (
        <div className="flex justify-center">
          <SecondaryButton
            type="button"
            size="sm"
            disabled={isLoadingMore || isBusy}
            onClick={() => void loadProducts(page + 1, { append: true })}
            data-testid="clinical-order-product-load-more"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Loading…
              </>
            ) : (
              "Load more"
            )}
          </SecondaryButton>
        </div>
      ) : null}
    </div>
  );
}
