"use client";

import type { UseFormReturn } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InventoryLocationSelect } from "@/features/inventory/components/InventoryLocationSelect";
import type { CreateStockAdjustmentFormValues } from "@/features/inventory/schemas/stock-adjustment.schema";

type StockAdjustmentFormContentProps = {
  form: UseFormReturn<CreateStockAdjustmentFormValues>;
  locationSelectId?: string;
  adjustmentTypeSelectId?: string;
};

export function StockAdjustmentFormContent({
  form,
  locationSelectId = "sa-location",
  adjustmentTypeSelectId = "sa-type",
}: StockAdjustmentFormContentProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <InventoryLocationSelect
                id={locationSelectId}
                label="Location"
                value={field.value ? String(field.value) : ""}
                onValueChange={(locationId) => field.onChange(Number(locationId))}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="adjustment_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={adjustmentTypeSelectId}>Adjustment type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger id={adjustmentTypeSelectId}>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="QUANTITY">Quantity</SelectItem>
                  <SelectItem value="COST">Cost</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="reason"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="sa-reason">Reason</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                id="sa-reason"
                rows={2}
                placeholder="Optional reason for this adjustment"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
