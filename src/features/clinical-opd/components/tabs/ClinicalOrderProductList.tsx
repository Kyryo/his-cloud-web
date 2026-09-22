"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Check, Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchCatalogProducts } from "@/features/catalog/services/catalog.service";
import type { ClinicalOrderItemType } from "@/features/clinical-opd/schemas/clinical-opd.schema";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 250;
const PRODUCTS_STALE_MS = 30_000;

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
        product_type: "service" as const,
        is_lab_test: true,
        sale_ok: true,
        active: true,
      };
    case "RADIOLOGY":
      return {
        product_type: "service" as const,
        is_radiology: true,
        sale_ok: true,
        active: true,
      };
    case "PROCEDURE":
      return {
        product_type: "service" as const,
        is_procedure: true,
        procedure_context: "opd" as const,
        sale_ok: true,
        active: true,
      };
    case "SUNDRY":
      return {
        is_sundry: true,
        sale_ok: true,
        active: true,
      };
    default:
      return {
        sale_ok: true,
        active: true,
      };
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

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    setSearchInput("");
    setDebouncedSearch("");
  }, [itemType]);

  const filters = useMemo(
    () => catalogFiltersForItemType(itemType),
    [itemType],
  );

  const productsQuery = useInfiniteQuery({
    queryKey: [
      "clinical-order-products",
      itemType,
      debouncedSearch,
      filters,
    ],
    queryFn: ({ pageParam }) =>
      fetchCatalogProducts({
        ...filters,
        search: debouncedSearch || undefined,
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage.pagination?.next ? pages.length + 1 : undefined,
    enabled,
    staleTime: PRODUCTS_STALE_MS,
  });

  const products = useMemo(
    () => productsQuery.data?.pages.flatMap((page) => page.results) ?? [],
    [productsQuery.data],
  );
  const isLoadingMore = productsQuery.isFetchingNextPage;
  const hasNext = Boolean(productsQuery.hasNextPage);
  const error = productsQuery.isError ? "Could not load products." : null;
  const isBusy = Boolean(busyProductUuid);
  const showInitialLoading =
    (productsQuery.isLoading || productsQuery.isFetching) &&
    products.length === 0;

  return (
    <div className="space-y-3" data-testid="clinical-order-product-list">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-dash-muted"
          aria-hidden="true"
        />
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search…"
          className="h-9 border-dash-border/70 bg-dash-canvas/60 pl-8 text-sm shadow-none focus-visible:bg-white"
          data-testid="clinical-order-product-search"
          aria-label="Search products"
        />
      </div>

      {showInitialLoading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-dash-muted">
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          Loading…
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="px-1 py-8 text-center text-sm text-dash-muted">
          {debouncedSearch
            ? "No matching products."
            : "No products for this type."}
        </div>
      ) : (
        <ul className="space-y-0.5">
          {products.map((product) => {
            const orderUuid = orderedProductOrderUuids.get(product.uuid);
            const isOrdered = Boolean(orderUuid);
            const isRowBusy = busyProductUuid === product.uuid;
            const label = formatProductLabel(product);
            const title =
              product.display_name || product.name || label;
            const meta = [product.default_code, product.uom_name]
              .filter(Boolean)
              .join(" · ");

            return (
              <li key={product.uuid}>
                <div
                  className={cn(
                    "group flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors",
                    isOrdered
                      ? "bg-emerald-50/70"
                      : "hover:bg-dash-canvas/80",
                    isBusy && !isRowBusy && "opacity-60",
                  )}
                  data-testid={`clinical-order-product-row-${product.uuid}`}
                >
                  <button
                    type="button"
                    disabled={isBusy || isOrdered}
                    onClick={() => onAddProduct(product)}
                    className={cn(
                      "min-w-0 flex-1 text-left",
                      (isBusy || isOrdered) && "cursor-default",
                    )}
                    data-testid={`clinical-order-product-add-${product.uuid}`}
                  >
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {title}
                    </p>
                    {meta ? (
                      <p className="truncate text-[11px] text-dash-muted">
                        {meta}
                      </p>
                    ) : null}
                  </button>

                  {isOrdered && orderUuid ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700"
                        aria-label="Ordered"
                        data-testid={`clinical-order-product-ordered-${product.uuid}`}
                      >
                        {isRowBusy ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Check className="size-3.5" aria-hidden="true" />
                        )}
                        Added
                      </span>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onCancelOrder(product, orderUuid)}
                        className={cn(
                          "inline-flex size-7 items-center justify-center rounded-md text-dash-muted transition-colors",
                          "opacity-0 group-hover:opacity-100 hover:bg-white hover:text-red-600",
                          "focus-visible:opacity-100 disabled:cursor-wait disabled:opacity-50",
                          isRowBusy && "opacity-100",
                        )}
                        aria-label={`Cancel order for ${label}`}
                        data-testid={`clinical-order-product-cancel-${product.uuid}`}
                      >
                        {isRowBusy ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <X className="size-3.5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onAddProduct(product)}
                      className={cn(
                        "shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-brand-primary transition-opacity",
                        "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
                        "hover:bg-white disabled:cursor-wait disabled:opacity-50",
                        isRowBusy && "opacity-100",
                      )}
                      aria-label={`Add ${label}`}
                      data-testid={`clinical-order-product-plus-${product.uuid}`}
                    >
                      {isRowBusy ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        "Add"
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
        <div className="flex justify-center pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-brand-muted"
            disabled={isLoadingMore || isBusy}
            onClick={() => {
              void productsQuery.fetchNextPage();
            }}
            data-testid="clinical-order-product-load-more"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                Loading…
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
