"use client";

import { Plus, Trash2 } from "lucide-react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductSearchCombobox } from "@/features/inventory/components/ProductSearchCombobox";

export type InventoryLineItemDraft = {
  key: string;
  product_id: number | null;
  quantity: string;
  unit_cost: string;
};

export function createEmptyLineItem(): InventoryLineItemDraft {
  return {
    key: crypto.randomUUID(),
    product_id: null,
    quantity: "1",
    unit_cost: "0",
  };
}

type InventoryLineItemsEditorProps = {
  lines: InventoryLineItemDraft[];
  onChange: (lines: InventoryLineItemDraft[]) => void;
  quantityLabel?: string;
  unitCostLabel?: string;
  showUnitCost?: boolean;
};

export function InventoryLineItemsEditor({
  lines,
  onChange,
  quantityLabel = "Qty",
  unitCostLabel = "Unit cost",
  showUnitCost = true,
}: InventoryLineItemsEditorProps) {
  function updateLine(key: string, patch: Partial<InventoryLineItemDraft>) {
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
          onClick={() => onChange([...lines, createEmptyLineItem()])}
        >
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Add line
        </SecondaryButton>
      </div>

      <div className="space-y-4 rounded-xl border border-brand-border p-4">
        {lines.map((line, index) => (
          <div
            key={line.key}
            className={
              showUnitCost
                ? "grid gap-3 border-b border-brand-border pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[1fr_100px_100px_auto]"
                : "grid gap-3 border-b border-brand-border pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[1fr_120px_auto]"
            }
          >
            <ProductSearchCombobox
              id={`line-product-${line.key}`}
              label={index === 0 ? "Product" : undefined}
              value={line.product_id}
              onSelect={(product) =>
                updateLine(line.key, { product_id: product.id })
              }
            />
            <div className="space-y-2">
              {index === 0 ? (
                <Label htmlFor={`line-qty-${line.key}`}>{quantityLabel}</Label>
              ) : null}
              <Input
                id={`line-qty-${line.key}`}
                type="number"
                min="0"
                step="any"
                value={line.quantity}
                onChange={(event) =>
                  updateLine(line.key, { quantity: event.target.value })
                }
              />
            </div>
            {showUnitCost ? (
              <div className="space-y-2">
                {index === 0 ? (
                  <Label htmlFor={`line-cost-${line.key}`}>{unitCostLabel}</Label>
                ) : null}
                <Input
                  id={`line-cost-${line.key}`}
                  type="number"
                  min="0"
                  step="any"
                  value={line.unit_cost}
                  onChange={(event) =>
                    updateLine(line.key, { unit_cost: event.target.value })
                  }
                />
              </div>
            ) : null}
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
