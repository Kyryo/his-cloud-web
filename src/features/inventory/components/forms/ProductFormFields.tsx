"use client";

import type { UseFormReturn } from "react-hook-form";
import { Info } from "lucide-react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INVENTORY_LAB_CHARGE_TYPE_OPTIONS,
  INVENTORY_PROCEDURE_SCOPE_OPTIONS,
  INVENTORY_PRODUCT_TYPE_OPTIONS,
  type CreateInventoryProductFormValues,
} from "@/features/inventory/schemas/product.schema";
import type {
  InventoryProduct,
  LabConfigurationStatus,
} from "@/features/inventory/types/inventory.types";

export type ProductFormTab =
  | "general"
  | "pricing"
  | "classification"
  | "availability";

const LAB_CONFIGURATION_LABELS: Record<LabConfigurationStatus, string> = {
  none: "Unconfigured",
  test: "Individual test",
  panel: "Panel",
};

type ProductFormFieldsProps = {
  form: UseFormReturn<CreateInventoryProductFormValues>;
  activeTab: ProductFormTab;
  productType: CreateInventoryProductFormValues["product_type"];
  isDrug: boolean;
  isProcedure: boolean;
  testIdPrefix: string;
  /** When editing, used to show lab catalog bind status. */
  product?: InventoryProduct | null;
  onChangeTab?: (tab: ProductFormTab) => void;
};

export function ProductFormFields({
  form,
  activeTab,
  productType,
  isDrug,
  isProcedure,
  testIdPrefix,
  product = null,
  onChangeTab,
}: ProductFormFieldsProps) {
  const isSundry = form.watch("is_sundry");
  const isLabTest = form.watch("is_lab_test");
  const isRadiology = form.watch("is_radiology");
  const isStorableProduct = productType === "product";
  const isServiceProduct = productType === "service";

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
    const productTypeLabel =
      productType === "service"
        ? "Service"
        : productType === "consu"
          ? "Consumable"
          : "Storable";
    const hiddenClassificationLabels = isStorableProduct
      ? ["Laboratory product", "Radiology", "Procedure"]
      : isServiceProduct
        ? ["Drug product", "Sundry"]
        : [
            "Drug product",
            "Sundry",
            "Laboratory product",
            "Radiology",
            "Procedure",
          ];

    return (
      <>
        <Alert
          variant="warning"
          data-testid={`${testIdPrefix}-classification-type-note`}
        >
          <Info className="size-4" aria-hidden="true" />
          <AlertTitle>Some classifications are hidden</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>
              {hiddenClassificationLabels.join(", ")}{" "}
              {hiddenClassificationLabels.length === 1 ? "is" : "are"} not shown
              because the product type is {productTypeLabel}.
            </p>
            {onChangeTab ? (
              <SecondaryButton
                type="button"
                size="sm"
                className="shrink-0 self-start"
                onClick={() => onChangeTab("general")}
                data-testid={`${testIdPrefix}-classification-change-type`}
              >
                Change type
              </SecondaryButton>
            ) : null}
          </AlertDescription>
        </Alert>

        {isStorableProduct ? (
          <>
            <FormField
              control={form.control}
              name="is_drug"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 space-y-0 rounded-lg border border-brand-border p-4">
                  <div className="space-y-1">
                    <FormLabel className="text-sm font-medium text-brand-navy">
                      Drug product
                    </FormLabel>
                    <p className="text-xs text-brand-muted">
                      Mark pharmaceutical items for dispensing workflows. Cannot
                      be combined with sundry items.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      disabled={isSundry}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue("is_sundry", false);
                        }
                      }}
                      data-testid={`${testIdPrefix}-is-drug`}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_sundry"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 space-y-0 rounded-lg border border-brand-border p-4">
                  <div className="space-y-1">
                    <FormLabel className="text-sm font-medium text-brand-navy">
                      Sundry
                    </FormLabel>
                    <p className="text-xs text-brand-muted">
                      Mark non-drug storable items such as supplies or
                      accessories. Cannot be combined with drug products.
                    </p>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      disabled={isDrug}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue("is_drug", false);
                        }
                      }}
                      data-testid={`${testIdPrefix}-is-sundry`}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isDrug || isSundry ? (
              <FormField
                control={form.control}
                name="liquid_or_cream"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 space-y-0 rounded-lg border border-brand-border p-4">
                    <div className="space-y-1">
                      <FormLabel className="text-sm font-medium text-brand-navy">
                        Liquid or cream
                      </FormLabel>
                      <p className="text-xs text-brand-muted">
                        Available after Drug or Sundry is selected.
                      </p>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid={`${testIdPrefix}-liquid-or-cream`}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ) : null}
          </>
        ) : null}

        {isServiceProduct ? (
          <>
            <FormField
              control={form.control}
              name="is_lab_test"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 space-y-0 rounded-lg border border-brand-border p-4">
                  <div className="space-y-1">
                    <FormLabel className="text-sm font-medium text-brand-navy">
                      Laboratory product
                    </FormLabel>
                    <p className="text-xs text-brand-muted">
                      Marks this service as a billable lab SKU. Choose whether it
                      is charged as an individual test or a panel; the matching
                      laboratory catalog row is created automatically. Cannot be
                      combined with radiology or procedures.
                    </p>
                    {field.value && product ? (
                      <p
                        className="text-xs font-medium text-brand-navy"
                        data-testid={`${testIdPrefix}-lab-configuration`}
                      >
                        Catalog status:{" "}
                        {LAB_CONFIGURATION_LABELS[
                          product.lab_configuration ?? "none"
                        ]}
                      </p>
                    ) : null}
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      disabled={isProcedure || isRadiology}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue("is_procedure", false);
                          form.setValue("is_radiology", false);
                          form.setValue("procedure_scope", "");
                        } else {
                          form.setValue("lab_charge_type", "");
                        }
                      }}
                      data-testid={`${testIdPrefix}-is-lab-test`}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isLabTest ? (
              <FormField
                control={form.control}
                name="lab_charge_type"
                render={({ field }) => (
                  <FormItem className="space-y-3 rounded-lg border border-brand-border p-4">
                    <div className="space-y-1">
                      <FormLabel className="text-sm font-medium text-brand-navy">
                        Lab charge type
                      </FormLabel>
                      <p className="text-xs text-brand-muted">
                        Individual test (e.g. pregnancy test) or panel (e.g. full
                        blood count). This creates the related catalog entry for
                        laboratory staff to finish configuring.
                      </p>
                    </div>
                    <FormControl>
                      <div
                        className="space-y-2"
                        role="radiogroup"
                        aria-label="Lab charge type"
                      >
                        {INVENTORY_LAB_CHARGE_TYPE_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className="flex cursor-pointer items-start gap-3 rounded-lg border border-brand-border/80 px-3 py-2"
                          >
                            <input
                              type="radio"
                              name={`${testIdPrefix}-lab-charge-type`}
                              value={option.value}
                              checked={field.value === option.value}
                              onChange={() => field.onChange(option.value)}
                              className="mt-1"
                              data-testid={`${testIdPrefix}-lab-charge-type-${option.value}`}
                            />
                            <span>
                              <span className="block text-sm font-medium text-brand-navy">
                                {option.label}
                              </span>
                              <span className="block text-xs text-brand-muted">
                                {option.example}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="is_radiology"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 space-y-0 rounded-lg border border-brand-border p-4">
                  <div className="space-y-1">
                    <FormLabel className="text-sm font-medium text-brand-navy">
                      Radiology
                    </FormLabel>
                    <p className="text-xs text-brand-muted">
                      Cannot be combined with laboratory products or procedures.
                    </p>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      disabled={isProcedure || isLabTest}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue("is_procedure", false);
                          form.setValue("is_lab_test", false);
                          form.setValue("procedure_scope", "");
                        }
                      }}
                      data-testid={`${testIdPrefix}-is-radiology`}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_procedure"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-4 space-y-0 rounded-lg border border-brand-border p-4">
                  <div className="space-y-1">
                    <FormLabel className="text-sm font-medium text-brand-navy">
                      Procedure
                    </FormLabel>
                    <p className="text-xs text-brand-muted">
                      Cannot be combined with laboratory products or radiology.
                    </p>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      disabled={isLabTest || isRadiology}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue("is_lab_test", false);
                          form.setValue("is_radiology", false);
                        }
                      }}
                      data-testid={`${testIdPrefix}-is-procedure`}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isProcedure ? (
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
                    >
                      <FormControl>
                        <SelectTrigger
                          data-testid={`${testIdPrefix}-procedure-scope`}
                        >
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
                      Required when the product is a procedure. Choose exactly
                      one scope.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </>
        ) : null}
      </>
    );
  }

  return (
    <>
      <FormField
        control={form.control}
        name="sale_ok"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between gap-4 space-y-0 rounded-lg border border-brand-border p-4">
            <div className="space-y-1">
              <FormLabel className="text-sm font-medium text-brand-navy">
                Can be sold
              </FormLabel>
              <p className="text-xs text-brand-muted">
                Allow this product on sales orders and invoices.
              </p>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                data-testid={`${testIdPrefix}-sale-ok`}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="purchase_ok"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between gap-4 space-y-0 rounded-lg border border-brand-border p-4">
            <div className="space-y-1">
              <FormLabel className="text-sm font-medium text-brand-navy">
                Can be purchased
              </FormLabel>
              <p className="text-xs text-brand-muted">
                {productType === "service"
                  ? "Service products cannot be purchased."
                  : "Allow this product on purchase orders and receipts."}
              </p>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                disabled={productType === "service"}
                onCheckedChange={field.onChange}
                data-testid={`${testIdPrefix}-purchase-ok`}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="active"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between gap-4 space-y-0 rounded-lg border border-brand-border p-4">
            <div className="space-y-1">
              <FormLabel className="text-sm font-medium text-brand-navy">
                Active
              </FormLabel>
              <p className="text-xs text-brand-muted">
                Inactive products are hidden from search and new transactions.
              </p>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                data-testid={`${testIdPrefix}-active`}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}
