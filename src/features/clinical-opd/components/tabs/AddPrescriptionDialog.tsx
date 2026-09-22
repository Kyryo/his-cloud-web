"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { SearchableSelect, SelectItem } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePrescription } from "@/features/clinical-opd/hooks/use-clinical-opd";
import {
  prescriptionSchema,
  type PrescriptionFormValues,
} from "@/features/clinical-opd/schemas/clinical-opd.schema";
import { formatAllergyAlertMessage } from "@/features/clinical-opd/utils/opd-allergy-alerts";
import {
  calculatePrescribedQuantity,
  formatPrescriptionDuration,
  PRESCRIPTION_DURATION_UNIT_OPTIONS,
  PRESCRIPTION_FREQUENCY_OPTIONS,
  PRESCRIPTION_ROUTE_OPTIONS,
  PRESCRIPTION_UOM_OPTIONS,
} from "@/features/clinical-opd/utils/prescription-form-options";
import { InventoryProductPicker } from "@/features/inventory/components/InventoryProductPicker";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

export const PRESCRIPTION_FORM_ID = "opd-prescription-form";

type AddPrescriptionDialogProps = {
  visitUuid: string;
  encounterUuid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embedded?: boolean;
};

const EMPTY_FORM_VALUES: PrescriptionFormValues = {
  product_uuid: "",
  dose: "",
  route: "",
  frequency: "",
  duration_value: "",
  duration_unit: "Day",
  clinical_quantity: 1,
  clinical_uom: "",
  charge_quantity: 1,
  instructions: "",
  is_prn: false,
  clinical_notes: "",
};

type PrescriptionOptionSelectProps = {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  placeholder: string;
  searchPlaceholder?: string;
  onChange: (value: string) => void;
  compact?: boolean;
  hideLabel?: boolean;
  required?: boolean;
  className?: string;
  "data-testid"?: string;
};

function PrescriptionOptionSelect({
  id,
  label,
  value,
  options,
  placeholder,
  searchPlaceholder = "Search…",
  onChange,
  compact = false,
  hideLabel = false,
  required = false,
  className,
  "data-testid": dataTestId,
}: PrescriptionOptionSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return options;
    }
    return options.filter((option) => option.toLowerCase().includes(query));
  }, [options, search]);

  return (
    <div className={cn(!hideLabel && (compact ? "space-y-1" : "space-y-2"), className)}>
      {hideLabel ? (
        <span className="sr-only">
          <Label htmlFor={id}>{label}</Label>
        </span>
      ) : (
        <Label htmlFor={id} className={cn(compact && "text-xs")}>
          {label}
          {required ? (
            <>
              {" "}
              <RequiredFieldMarker />
            </>
          ) : null}
        </Label>
      )}
      <SearchableSelect
        id={id}
        value={value || undefined}
        onValueChange={(next) => {
          onChange(next);
          setOpen(false);
          setSearch("");
        }}
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setSearch("");
          }
        }}
        placeholder={placeholder}
        displayValue={value || undefined}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={searchPlaceholder}
        minSearchLength={0}
        emptySearchMessage="No options."
        noResultsMessage="No matching options."
        triggerClassName={cn(compact && "h-8")}
        data-testid={dataTestId}
      >
        {filteredOptions.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SearchableSelect>
    </div>
  );
}

export function AddPrescriptionDialog({
  visitUuid,
  encounterUuid,
  open,
  onOpenChange,
  embedded = false,
}: AddPrescriptionDialogProps) {
  const { toast } = useToast();
  const createPrescription = useCreatePrescription(visitUuid, encounterUuid);
  const [product, setProduct] = useState<InventoryProduct | null>(null);
  const compact = embedded;
  const fieldGap = compact ? "space-y-1" : "space-y-2";
  const gridGap = compact ? "gap-2" : "gap-4";
  const controlClassName = compact ? "h-8" : undefined;
  const labelClassName = compact ? "text-xs" : undefined;

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: EMPTY_FORM_VALUES,
  });

  const frequencyValue = useWatch({ control: form.control, name: "frequency" }) ?? "";
  const routeValue = useWatch({ control: form.control, name: "route" }) ?? "";
  const durationUnitValue =
    useWatch({ control: form.control, name: "duration_unit" }) ?? "Day";
  const durationValue =
    useWatch({ control: form.control, name: "duration_value" }) ?? "";
  const doseValue = useWatch({ control: form.control, name: "dose" }) ?? "";
  const clinicalUomValue =
    useWatch({ control: form.control, name: "clinical_uom" }) ?? "";
  const showUnitsToCharge = Boolean(product?.metadata?.liquid_or_cream);
  const calculatedQuantity = calculatePrescribedQuantity({
    dose: doseValue,
    frequency: frequencyValue,
    durationValue,
    durationUnit: durationUnitValue,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) {
        return;
      }
      setProduct(null);
      form.reset(EMPTY_FORM_VALUES);
    })();

    return () => {
      cancelled = true;
    };
  }, [form, open]);

  useEffect(() => {
    if (calculatedQuantity == null) {
      return;
    }
    form.setValue("clinical_quantity", calculatedQuantity, {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (!showUnitsToCharge) {
      form.setValue("charge_quantity", calculatedQuantity, {
        shouldValidate: true,
      });
    }
  }, [calculatedQuantity, form, showUnitsToCharge]);

  const handleProductChange = (next: InventoryProduct | null) => {
    setProduct(next);
    form.setValue("product_uuid", next?.uuid ?? "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (next?.uom_name) {
      form.setValue("clinical_uom", next.uom_name, { shouldValidate: true });
    }
    if (!next?.metadata?.liquid_or_cream) {
      const clinicalQty = form.getValues("clinical_quantity");
      form.setValue("charge_quantity", clinicalQty || 1, {
        shouldValidate: true,
      });
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const chargeQuantity = showUnitsToCharge
        ? values.charge_quantity
        : values.clinical_quantity;
      const created = await createPrescription.mutateAsync({
        product_uuid: values.product_uuid,
        dose: values.dose || undefined,
        route: values.route || undefined,
        frequency: values.frequency || undefined,
        duration: formatPrescriptionDuration(
          values.duration_value,
          values.duration_unit,
        ),
        quantity: values.clinical_quantity,
        clinical_quantity: values.clinical_quantity,
        clinical_uom: values.clinical_uom,
        charge_quantity: chargeQuantity,
        instructions: values.instructions || undefined,
        is_prn: values.is_prn,
        clinical_notes: values.clinical_notes || undefined,
      });
      const allergyAlerts = created.allergy_alerts ?? [];
      toast({
        title: allergyAlerts.length
          ? "Prescription ordered with allergy warning"
          : "Prescription ordered",
        description: allergyAlerts.length
          ? formatAllergyAlertMessage(allergyAlerts)
          : "Medication order placed for this visit.",
        variant: allergyAlerts.length ? "warning" : "success",
      });
      if (!embedded) {
        onOpenChange(false);
      } else {
        form.reset(EMPTY_FORM_VALUES);
        setProduct(null);
      }
    } catch (error) {
      toast({
        title: "Could not add prescription",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : "Unable to create the prescription.",
        variant: "error",
      });
    }
  });

  if (!open) {
    return null;
  }

  return (
    <section
      className={cn(compact ? "space-y-2" : "space-y-4", appFont.className)}
    >
      {embedded ? null : (
        <div>
          <h3 className="text-base font-semibold tracking-tight text-brand-navy">
            Add prescription
          </h3>
          <p className="mt-0.5 text-sm text-dash-muted">
            Select a drug and enter dosing details.
          </p>
        </div>
      )}

      <form
        id={PRESCRIPTION_FORM_ID}
        className={cn(compact ? "space-y-2" : "space-y-4")}
        onSubmit={onSubmit}
      >
        <InventoryProductPicker
          id="prescription-product"
          label="Drug name"
          required
          drugsOnly
          compact={compact}
          product={product}
          onProductChange={handleProductChange}
          invalid={Boolean(form.formState.errors.product_uuid)}
          helperText=""
        />
        {form.formState.errors.product_uuid ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.product_uuid.message}
          </p>
        ) : null}

        <div className={cn("grid grid-cols-[1fr_3fr]", gridGap)}>
          <div className={fieldGap}>
            <Label htmlFor="prescription-dose" className={labelClassName}>
              Dose
            </Label>
            <Input
              id="prescription-dose"
              className={controlClassName}
              {...form.register("dose")}
            />
          </div>
          <PrescriptionOptionSelect
            id="prescription-frequency"
            label="Frequency"
            value={frequencyValue}
            options={PRESCRIPTION_FREQUENCY_OPTIONS}
            placeholder="Select frequency"
            searchPlaceholder="Search frequency…"
            compact={compact}
            data-testid="prescription-frequency"
            onChange={(next) =>
              form.setValue("frequency", next, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
        </div>

        <PrescriptionOptionSelect
          id="prescription-route"
          label="Route"
          value={routeValue}
          options={PRESCRIPTION_ROUTE_OPTIONS}
          placeholder="Select route"
          searchPlaceholder="Search route…"
          compact={compact}
          data-testid="prescription-route"
          onChange={(next) =>
            form.setValue("route", next, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />

        <div className={fieldGap}>
          <Label
            htmlFor="prescription-duration-value"
            className={labelClassName}
          >
            Duration
          </Label>
          <div className={cn("grid grid-cols-[minmax(0,1fr)_7rem]", gridGap)}>
            <Input
              id="prescription-duration-value"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 5"
              className={controlClassName}
              {...form.register("duration_value")}
            />
            <PrescriptionOptionSelect
              id="prescription-duration-unit"
              label="Duration unit"
              value={durationUnitValue}
              options={PRESCRIPTION_DURATION_UNIT_OPTIONS}
              placeholder="Unit"
              searchPlaceholder="Search…"
              compact={compact}
              hideLabel
              data-testid="prescription-duration-unit"
              onChange={(next) =>
                form.setValue("duration_unit", next, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </div>
        </div>

        <div className={cn("grid grid-cols-2", gridGap)}>
          <div className={fieldGap}>
            <Label
              htmlFor="prescription-clinical-qty"
              className={labelClassName}
            >
              Amount prescribed <RequiredFieldMarker />
            </Label>
            <Input
              id="prescription-clinical-qty"
              type="number"
              step="any"
              min="0"
              readOnly
              className={cn(
                controlClassName,
                "bg-muted/40 text-brand-navy",
              )}
              {...form.register("clinical_quantity")}
            />
            {calculatedQuantity == null ? (
              <p className="text-[11px] text-brand-muted">
                Enter dose, frequency, and duration to calculate.
              </p>
            ) : null}
            {form.formState.errors.clinical_quantity ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.clinical_quantity.message}
              </p>
            ) : null}
          </div>
          <div className={fieldGap}>
            <PrescriptionOptionSelect
              id="prescription-uom"
              label="Unit"
              value={clinicalUomValue}
              options={PRESCRIPTION_UOM_OPTIONS}
              placeholder="Select unit"
              searchPlaceholder="Search unit…"
              compact={compact}
              required
              data-testid="prescription-uom"
              onChange={(next) =>
                form.setValue("clinical_uom", next, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            {form.formState.errors.clinical_uom ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.clinical_uom.message}
              </p>
            ) : null}
          </div>
        </div>

        {showUnitsToCharge ? (
          <div className={fieldGap}>
            <Label
              htmlFor="prescription-charge-qty"
              className={labelClassName}
            >
              Units to charge <RequiredFieldMarker />
            </Label>
            <Input
              id="prescription-charge-qty"
              type="number"
              step="any"
              min="0"
              className={controlClassName}
              {...form.register("charge_quantity")}
            />
            {form.formState.errors.charge_quantity ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.charge_quantity.message}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className={fieldGap}>
          <Label
            htmlFor="prescription-instructions"
            className={labelClassName}
          >
            Instructions
          </Label>
          <Textarea
            id="prescription-instructions"
            rows={compact ? 1 : 2}
            className={cn(compact && "min-h-8 py-1.5")}
            {...form.register("instructions")}
          />
        </div>

        {embedded ? null : (
          <div className="flex flex-wrap gap-2">
            <SecondaryButton
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={createPrescription.isPending}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={createPrescription.isPending}
              data-testid="prescription-submit"
            >
              {createPrescription.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </PrimaryButton>
          </div>
        )}
      </form>
    </section>
  );
}
