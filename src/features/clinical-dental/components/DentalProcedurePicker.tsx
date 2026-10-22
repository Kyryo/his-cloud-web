"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { fetchCatalogProducts } from "@/features/catalog/services/catalog.service";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 250;
const PAGE_SIZE = 25;

type DentalProcedurePickerProps = {
  value: string;
  onChange: (product: InventoryProduct) => void;
};

/** Search dental procedure services in the tenant catalog. */
export function DentalProcedurePicker({ value, onChange }: DentalProcedurePickerProps) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(
      () => setSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const productsQuery = useQuery({
    queryKey: ["dental-procedure-products", search],
    queryFn: () =>
      fetchCatalogProducts({
        product_type: "service",
        is_procedure: true,
        procedure_context: "dental",
        sale_ok: true,
        active: true,
        search: search || undefined,
        pageSize: PAGE_SIZE,
      }),
    staleTime: 30_000,
  });
  const products = productsQuery.data?.results ?? [];

  return (
    <div className="space-y-2" data-testid="dental-procedure-picker">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-muted"
          aria-hidden="true"
        />
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search dental procedures"
          className="pl-9"
          aria-label="Search dental procedures"
        />
      </div>
      <div
        className="max-h-52 overflow-y-auto rounded-lg border border-dash-border"
        role="listbox"
        aria-label="Dental procedures"
      >
        {productsQuery.isLoading ? (
          <p className="flex items-center gap-2 px-3 py-3 text-sm text-brand-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading procedures...
          </p>
        ) : products.length === 0 ? (
          <p className="px-3 py-3 text-sm text-brand-muted">
            No dental procedures match. Add procedures to the catalog with the dental
            procedure context.
          </p>
        ) : (
          products.map((product) => {
            const isSelected = product.uuid === value;
            return (
              <button
                key={product.uuid}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => onChange(product)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 border-b border-dash-border/70 px-3 py-2 text-left text-sm last:border-b-0",
                  isSelected ? "bg-brand-primary/10 text-brand-navy" : "hover:bg-slate-50",
                )}
              >
                <span className="min-w-0 truncate">{formatProductLabel(product)}</span>
                {isSelected ? (
                  <Check className="size-4 shrink-0 text-brand-primary" aria-hidden="true" />
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
