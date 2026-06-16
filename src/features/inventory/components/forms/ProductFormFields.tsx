"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INVENTORY_PROCEDURE_SCOPE_OPTIONS,
  INVENTORY_PRODUCT_TYPE_OPTIONS,
  type CreateInventoryProductFormValues,
} from "@/features/inventory/schemas/product.schema";

export type ProductFormTab =
  | "general"
  | "pricing"
  | "classification"
  | "availability";

type ProductFormFieldsProps = {
  form: UseFormReturn<CreateInventoryProductFormValues>;
  activeTab: ProductFormTab;
  productType: CreateInventoryProductFormValues["product_type"];
  isDrug: boolean;
  isProcedure: boolean;
  testIdPrefix: string;
};

export function ProductFormFields({
  form,
  activeTab,
  productType,
  isDrug,
  isProcedure,
  testIdPrefix,
}: ProductFormFieldsProps) {
  if (activeTab === "general") {
    return (
      <>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. Paracetamol 500mg"
                  data-testid={`${testIdPrefix}-name`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="default_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internal reference</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={typeof field.value === "string" ? field.value : ""}
                  placeholder="SKU or item code"
                  data-testid={`${testIdPrefix}-default-code`}
                />
              </FormControl>
              <p className="text-xs text-brand-muted">
                Optional code used in purchase orders and stock reports.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Barcode</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={typeof field.value === "string" ? field.value : ""}
                  placeholder="EAN or barcode"
                  data-testid={`${testIdPrefix}-barcode`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="product_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger data-testid={`${testIdPrefix}-type`}>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INVENTORY_PRODUCT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-brand-muted">
                Storable products track inventory quantities. Consumables and
                services follow ERP rules.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    );
  }

  if (activeTab === "pricing") {
    return (
      <>
        <FormField
          control={form.control}
          name="list_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sales price</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  data-testid={`${testIdPrefix}-list-price`}
                />
              </FormControl>
              <p className="text-xs text-brand-muted">
                Customer-facing price in ERP. Leave blank to keep the current
                value.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="standard_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  data-testid={`${testIdPrefix}-standard-price`}
                />
              </FormControl>
              <p className="text-xs text-brand-muted">
                Standard cost used for inventory valuation.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    );
  }

  if (activeTab === "classification") {
    return (
      <>
        <FormField
          control={form.control}
          name="is_drug"
          render={({ field }) => (
            <FormItem className="flex items-start gap-3 space-y-0 rounded-lg border border-brand-border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  className="mt-1 size-4 rounded border-brand-border"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                  data-testid={`${testIdPrefix}-is-drug`}
                />
              </FormControl>
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium text-brand-navy">
                  Drug product
                </FormLabel>
                <p className="text-xs text-brand-muted">
                  Mark pharmaceutical items for dispensing workflows.
                </p>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="liquid_or_cream"
          render={({ field }) => (
            <FormItem className="flex items-start gap-3 space-y-0 rounded-lg border border-brand-border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  className="mt-1 size-4 rounded border-brand-border"
                  checked={field.value}
                  disabled={!isDrug}
                  onChange={(event) => field.onChange(event.target.checked)}
                  data-testid={`${testIdPrefix}-liquid-or-cream`}
                />
              </FormControl>
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium text-brand-navy">
                  Liquid or cream
                </FormLabel>
                <p className="text-xs text-brand-muted">
                  Only available for drug products.
                </p>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_procedure"
          render={({ field }) => (
            <FormItem className="flex items-start gap-3 space-y-0 rounded-lg border border-brand-border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  className="mt-1 size-4 rounded border-brand-border"
                  checked={field.value}
                  disabled={productType !== "service"}
                  onChange={(event) => field.onChange(event.target.checked)}
                  data-testid={`${testIdPrefix}-is-procedure`}
                />
              </FormControl>
              <div className="space-y-1">
                <FormLabel className="text-sm font-medium text-brand-navy">
                  Procedure
                </FormLabel>
                <p className="text-xs text-brand-muted">
                  Only service products can be marked as procedures.
                </p>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="procedure_scope"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Procedure scope</FormLabel>
              <Select
                value={field.value || "__none__"}
                onValueChange={(value) =>
                  field.onChange(value === "__none__" ? "" : value)
                }
                disabled={!isProcedure}
              >
                <FormControl>
                  <SelectTrigger data-testid={`${testIdPrefix}-procedure-scope`}>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__none__">Select scope</SelectItem>
                  {INVENTORY_PROCEDURE_SCOPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-brand-muted">
                Required when the product is a procedure. Choose exactly one
                scope.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    );
  }

  return (
    <>
      <FormField
        control={form.control}
        name="sale_ok"
        render={({ field }) => (
          <FormItem className="flex items-start gap-3 space-y-0 rounded-lg border border-brand-border p-4">
            <FormControl>
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border-brand-border"
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                data-testid={`${testIdPrefix}-sale-ok`}
              />
            </FormControl>
            <div className="space-y-1">
              <FormLabel className="text-sm font-medium text-brand-navy">
                Can be sold
              </FormLabel>
              <p className="text-xs text-brand-muted">
                Allow this product on sales orders and invoices.
              </p>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="purchase_ok"
        render={({ field }) => (
          <FormItem className="flex items-start gap-3 space-y-0 rounded-lg border border-brand-border p-4">
            <FormControl>
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border-brand-border"
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                data-testid={`${testIdPrefix}-purchase-ok`}
              />
            </FormControl>
            <div className="space-y-1">
              <FormLabel className="text-sm font-medium text-brand-navy">
                Can be purchased
              </FormLabel>
              <p className="text-xs text-brand-muted">
                Allow this product on purchase orders and receipts.
              </p>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="active"
        render={({ field }) => (
          <FormItem className="flex items-start gap-3 space-y-0 rounded-lg border border-brand-border p-4">
            <FormControl>
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border-brand-border"
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                data-testid={`${testIdPrefix}-active`}
              />
            </FormControl>
            <div className="space-y-1">
              <FormLabel className="text-sm font-medium text-brand-navy">
                Active
              </FormLabel>
              <p className="text-xs text-brand-muted">
                Inactive products are hidden from search and new transactions.
              </p>
            </div>
          </FormItem>
        )}
      />
    </>
  );
}
