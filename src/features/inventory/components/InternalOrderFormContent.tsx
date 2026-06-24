"use client";

import type { UseFormReturn } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { InventoryLocationSelect } from "@/features/inventory/components/InventoryLocationSelect";
import type { CreateInternalOrderFormValues } from "@/features/inventory/schemas/internal-order.schema";

type InternalOrderFormContentProps = {
  form: UseFormReturn<CreateInternalOrderFormValues>;
  sourceLocationSelectId?: string;
  destinationLocationSelectId?: string;
  locationsEnabled?: boolean;
};

export function InternalOrderFormContent({
  form,
  sourceLocationSelectId = "io-source-location",
  destinationLocationSelectId = "io-destination-location",
  locationsEnabled = true,
}: InternalOrderFormContentProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="source_location"
          render={({ field }) => (
            <FormItem>
              <InventoryLocationSelect
                id={sourceLocationSelectId}
                label="Source location"
                required
                enabled={locationsEnabled}
                value={field.value ? String(field.value) : ""}
                onValueChange={(locationId) => {
                  field.onChange(Number(locationId));
                  void form.trigger("destination_location");
                }}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="destination_location"
          render={({ field }) => (
            <FormItem>
              <InventoryLocationSelect
                id={destinationLocationSelectId}
                label="Destination location"
                required
                enabled={locationsEnabled}
                value={field.value ? String(field.value) : ""}
                onValueChange={(locationId) => {
                  field.onChange(Number(locationId));
                  void form.trigger("destination_location");
                }}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                rows={3}
                placeholder="Optional context for this transfer..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
