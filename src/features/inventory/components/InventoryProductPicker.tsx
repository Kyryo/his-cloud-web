"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchInventoryProducts } from "@/features/inventory/services/inventory.service";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

const BATCH_ELIGIBLE_PRODUCT_TYPES = new Set(["product", "consu"]);

type InventoryProductPickerProps = {
  id?: string;
  label?: string;
  required?: boolean;
  product: InventoryProduct | null;
  onProductChange: (product: InventoryProduct | null) => void;
  disabled?: boolean;
  invalid?: boolean;
  helperText?: string;
  filterBatchEligible?: boolean;
};

function isBatchEligibleProduct(product: InventoryProduct): boolean {
  if (!product.product_type) {
    return true;
  }
  return BATCH_ELIGIBLE_PRODUCT_TYPES.has(product.product_type);
}

export function InventoryProductPicker({
  id = "inventory-product-picker",
  label = "Product",
  required = false,
  product,
  onProductChange,
  disabled = false,
  invalid = false,
  helperText = "Search by product name or SKU.",
  filterBatchEligible = false,
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
          const products = await searchInventoryProducts({
            q: search.trim(),
            active: true,
          });
          const filtered = filterBatchEligible
            ? products.filter(isBatchEligibleProduct)
            : products;
          setOptions(filtered);
        } catch {
          setOptions(product ? [product] : []);
        } finally {
          setIsLoadingResults(false);
        }
      })();
    }, 250);

    return () => window.clearTimeout(handle);
  }, [filterBatchEligible, open, product, search]);

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
    <div className="space-y-2">
      <div>
        <Label htmlFor={id}>
          {label}
          {required ? <> <RequiredFieldMarker /></> : null}
        </Label>
        {helperText ? (
          <p className="mt-1 text-xs text-brand-muted">{helperText}</p>
        ) : null}
      </div>

      <Select
        value={product?.uuid}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          className={cn("w-full", invalid && "border-destructive")}
          aria-invalid={invalid}
        >
          <SelectValue placeholder="Select a product">
            {product ? formatProductLabel(product) : null}
          </SelectValue>
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
              {filterBatchEligible
                ? "No stockable or consumable products found."
                : "No products found."}
            </div>
          ) : (
            options.map((option) => (
              <SelectItem key={option.uuid} value={option.uuid}>
                <div className="flex flex-col items-start">
                  <span>{formatProductLabel(option)}</span>
                  {option.product_type_label ? (
                    <span className="text-xs text-brand-muted capitalize">
                      {option.product_type_label}
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
