"use client";

import type { UseFormReturn } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InventoryLocationSelect } from "@/features/inventory/components/InventoryLocationSelect";
import { InventorySupplierPicker } from "@/features/inventory/components/InventorySupplierPicker";
import {
  PURCHASE_ORDER_DELIVERY_DATE_FUTURE_MESSAGE,
  todayDateInputValue,
  type UpdatePurchaseOrderFormValues,
} from "@/features/inventory/schemas/purchase-order.schema";
import { validateDateInput } from "@/lib/validate-date-input";

type PurchaseOrderFormTab = "details" | "references";

type PurchaseOrderFormTabContentProps = {
  form: UseFormReturn<UpdatePurchaseOrderFormValues>;
  activeTab: PurchaseOrderFormTab;
  locationSelectId: string;
};

export function PurchaseOrderFormTabContent({
  form,
  activeTab,
  locationSelectId,
}: PurchaseOrderFormTabContentProps) {
  function handleDeliveryDateChange(value: string) {
    const error = validateDateInput(value, {
      futureMessage: PURCHASE_ORDER_DELIVERY_DATE_FUTURE_MESSAGE,
    });

    if (error) {
      form.setError("delivery_date", { type: "manual", message: error });
    } else {
      form.clearErrors("delivery_date");
    }
  }

  if (activeTab === "details") {
    return (
      <>
        <FormField
          control={form.control}
          name="vendor_name"
          render={({ field }) => (
            <FormItem>
              <InventorySupplierPicker
                id={`${locationSelectId}-vendor-name`}
                label="Vendor name"
                required
                supplier={field.value}
                onSupplierChange={(vendorName) => {
                  field.onChange(vendorName);
                  if (vendorName.trim()) {
                    form.clearErrors("vendor_name");
                  }
                }}
                invalid={Boolean(form.formState.errors.vendor_name)}
                helperText="Search existing vendors or enter a new name."
                placeholder="Select a vendor"
                searchPlaceholder="Search vendors..."
                emptyMessage="No vendors found."
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="receiving_location"
          render={({ field }) => (
            <FormItem>
              <InventoryLocationSelect
                id={locationSelectId}
                label="Receiving location"
                value={field.value ? String(field.value) : ""}
                onValueChange={(locationId) => field.onChange(Number(locationId))}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="delivery_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery date</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  max={todayDateInputValue()}
                  onChange={(event) => {
                    field.onChange(event);
                    handleDeliveryDateChange(event.target.value);
                  }}
                  onBlur={(event) => {
                    field.onBlur();
                    handleDeliveryDateChange(event.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="lpo_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LPO number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="grn_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GRN number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="invoice_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="invoice_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice date</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
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
              <textarea
                {...field}
                rows={4}
                className="flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
