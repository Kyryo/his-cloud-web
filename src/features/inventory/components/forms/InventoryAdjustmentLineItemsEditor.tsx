"use client";

import { Plus, Trash2 } from "lucide-react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductSearchCombobox } from "@/features/inventory/components/ProductSearchCombobox";

export type InventoryAdjustmentLineItemDraft = {
  key: string;
  product_id: number | null;
  quantity_delta: string;
};

export function createEmptyAdjustmentLineItem(): InventoryAdjustmentLineItemDraft {
  return {
    key: crypto.randomUUID(),
    product_id: null,
    quantity_delta: "0",
  };
}

type InventoryAdjustmentLineItemsEditorProps = {
  lines: InventoryAdjustmentLineItemDraft[];
  onChange: (lines: InventoryAdjustmentLineItemDraft[]) => void;
  quantityDeltaLabel?: string;
};

export function InventoryAdjustmentLineItemsEditor({
  lines,
  onChange,
  quantityDeltaLabel = "Qty delta",
}: InventoryAdjustmentLineItemsEditorProps) {
  function updateLine(key: string, patch: Partial<InventoryAdjustmentLineItemDraft>) {
    onChange(
      lines.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  function removeLine(key: string) {
    onChange(lines.length === 1 ? lines : lines.filter((line) => line.key !== key));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Line items</Label>
        <SecondaryButton
          type="button"
          onClick={() => onChange([...lines, createEmptyAdjustmentLineItem()])}
        >
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Add line
        </SecondaryButton>
      </div>

      <div className="space-y-4 rounded-xl border border-brand-border p-4">
        {lines.map((line, index) => (
          <div
            key={line.key}
            className="grid gap-3 border-b border-brand-border pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[1fr_120px_auto]"
          >
            <ProductSearchCombobox
              id={`adj-line-product-${line.key}`}
              label={index === 0 ? "Product" : undefined}
              value={line.product_id}
              onSelect={(product) =>
                updateLine(line.key, { product_id: product.id })
              }
            />
            <div className="space-y-2">
              {index === 0 ? (
                <Label htmlFor={`adj-delta-${line.key}`}>{quantityDeltaLabel}</Label>
              ) : null}
              <Input
                id={`adj-delta-${line.key}`}
                type="number"
                step="any"
                value={line.quantity_delta}
                onChange={(event) =>
                  updateLine(line.key, { quantity_delta: event.target.value })
                }
              />
            </div>
            <div className="flex items-end">
              <SecondaryButton type="button" onClick={() => removeLine(line.key)}>
                <Trash2 className="mr-2 size-4" aria-hidden="true" />
                Remove
              </SecondaryButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
