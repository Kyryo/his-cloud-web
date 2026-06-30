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
import { fetchCatalogProducts } from "@/features/catalog/services/catalog.service";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";

type InventoryProductPickerProps = {
  product: InventoryProduct | null;
  onProductChange: (product: InventoryProduct | null) => void;
  excludeProductUuids?: string[];
  disabled?: boolean;
  label?: string;
  description?: string;
  id?: string;
};

export function InventoryProductPicker({
  product,
  onProductChange,
  excludeProductUuids = [],
  disabled = false,
  label = "Product",
  description = "Search by name, code, or barcode.",
  id = "inventory-product-picker",
}: InventoryProductPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<InventoryProduct[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }

    if (search.trim().length < 2) {
      setOptions(product ? [product] : []);
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsLoadingResults(true);
        try {
          const response = await fetchCatalogProducts({
            search: search.trim(),
            active: true,
            pageSize: 8,
          });
          const excluded = new Set(excludeProductUuids);
          setOptions(
            response.results.filter((item) => item.uuid && !excluded.has(item.uuid)),
          );
        } catch {
          setOptions(product ? [product] : []);
        } finally {
          setIsLoadingResults(false);
        }
      })();
    }, 250);

    return () => window.clearTimeout(handle);
  }, [excludeProductUuids, open, product, search]);

  const handleValueChange = (uuid: string) => {
    const match =
      options.find((option) => option.uuid === uuid) ??
      (product?.uuid === uuid ? product : null);

    if (match) {
      onProductChange(match);
      setOpen(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <div>
        <Label htmlFor={id}>{label}</Label>
        {description ? (
          <p className="mt-1 text-xs text-brand-muted">{description}</p>
        ) : null}
      </div>

      <Select
        value={product?.uuid}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Search and select a product...">
            {product ? formatProductLabel(product) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <div className="border-b border-brand-border p-2">
            <Input
              value={search}
              placeholder="Search products..."
              className="h-9 w-full"
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
              <SelectItem key={option.uuid} value={option.uuid}>
                <div className="flex flex-col items-start">
                  <span>{formatProductLabel(option)}</span>
                  {option.default_code ? (
                    <span className="text-xs text-brand-muted">
                      {option.default_code}
                      {option.list_price != null ? ` · ${option.list_price}` : ""}
                    </span>
                  ) : null}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
