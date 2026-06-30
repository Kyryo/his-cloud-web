"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchCatalogPricelistProducts } from "@/features/catalog/services/catalog.service";
import type { CatalogPricelistMembership } from "@/features/catalog/types/catalog.types";

type PricelistProductPickerProps = {
  pricelistUuid: string;
  onProductSelect: (membership: CatalogPricelistMembership) => void;
  excludeProductUuids?: string[];
  disabled?: boolean;
  label?: string;
  description?: string;
};

export function PricelistProductPicker({
  pricelistUuid,
  onProductSelect,
  excludeProductUuids = [],
  disabled = false,
  label = "Add product",
  description = "Search products on this pricelist by name or code.",
}: PricelistProductPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<CatalogPricelistMembership[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (search.trim().length < 2) {
      setOptions([]);
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsLoadingResults(true);
        try {
          const response = await fetchCatalogPricelistProducts(pricelistUuid, {
            search: search.trim(),
            pageSize: 8,
          });
          const excluded = new Set(excludeProductUuids);
          setOptions(
            response.results.filter(
              (item) => !excluded.has(item.product_uuid),
            ),
          );
        } catch {
          setOptions([]);
        } finally {
          setIsLoadingResults(false);
        }
      })();
    }, 250);

    return () => window.clearTimeout(handle);
  }, [excludeProductUuids, open, pricelistUuid, search]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
      setSelectedValue("");
    }
  }

  function handleValueChange(productUuid: string) {
    const match = options.find((item) => item.product_uuid === productUuid);
    if (!match) {
      return;
    }

    onProductSelect(match);
    setSelectedValue("");
    setSearch("");
    setOpen(false);
  }

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="pricelist-product-picker">{label}</Label>
        {description ? (
          <p className="mt-1 text-xs text-brand-muted">{description}</p>
        ) : null}
      </div>

      <Select
        value={selectedValue || undefined}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={handleOpenChange}
        disabled={disabled}
      >
        <SelectTrigger
          id="pricelist-product-picker"
          className="w-full"
          data-testid="pricelist-product-picker-trigger"
        >
          <SelectValue placeholder="Search and add a product" />
        </SelectTrigger>
        <SelectContent>
          <div className="border-b border-brand-border p-2">
            <Input
              value={search}
              placeholder="Search products..."
              className="h-9"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
            />
          </div>

          {isLoadingResults ? (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-brand-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Searching...
            </div>
          ) : search.trim().length < 2 ? (
            <div className="px-3 py-6 text-center text-sm text-brand-muted">
              Type at least 2 characters to search.
            </div>
          ) : options.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-brand-muted">
              No products found.
            </div>
          ) : (
            options.map((option) => (
              <SelectItem
                key={option.product_uuid}
                value={option.product_uuid}
              >
                <span>{option.product_name?.trim() || option.product_uuid}</span>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
