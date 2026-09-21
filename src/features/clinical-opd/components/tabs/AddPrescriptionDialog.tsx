"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePrescription } from "@/features/clinical-opd/hooks/use-clinical-opd";
import {
  prescriptionSchema,
  type PrescriptionFormValues,
} from "@/features/clinical-opd/schemas/clinical-opd.schema";
import { formatAllergyAlertMessage } from "@/features/clinical-opd/utils/opd-allergy-alerts";
import { InventoryProductPicker } from "@/features/inventory/components/InventoryProductPicker";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AddPrescriptionDialogProps = {
  visitUuid: string;
  encounterUuid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embedded?: boolean;
};

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

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      product_uuid: "",
      dose: "",
      route: "",
      frequency: "",
      duration: "",
      clinical_quantity: 1,
      clinical_uom: "",
      charge_quantity: 1,
      instructions: "",
      is_prn: false,
      clinical_notes: "",
    },
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
      form.reset({
        product_uuid: "",
        dose: "",
        route: "",
        frequency: "",
        duration: "",
        clinical_quantity: 1,
        clinical_uom: "",
        charge_quantity: 1,
        instructions: "",
        is_prn: false,
        clinical_notes: "",
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [form, open]);

  const handleProductChange = (next: InventoryProduct | null) => {
    setProduct(next);
    form.setValue("product_uuid", next?.uuid ?? "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (next?.uom_name) {
      form.setValue("clinical_uom", next.uom_name, { shouldValidate: true });
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const created = await createPrescription.mutateAsync({
        product_uuid: values.product_uuid,
        dose: values.dose || undefined,
        route: values.route || undefined,
        frequency: values.frequency || undefined,
        duration: values.duration || undefined,
        quantity: values.clinical_quantity,
        clinical_quantity: values.clinical_quantity,
        clinical_uom: values.clinical_uom,
        charge_quantity: values.charge_quantity,
        instructions: values.instructions || undefined,
        is_prn: values.is_prn,
        clinical_notes: values.clinical_notes || undefined,
      });
      const allergyAlerts = created.allergy_alerts ?? [];
      toast({
        title: allergyAlerts.length
          ? "Prescription added with allergy warning"
          : "Prescription added",
        description: allergyAlerts.length
          ? formatAllergyAlertMessage(allergyAlerts)
          : "Draft prescription created. Finalize to place the order.",
        variant: allergyAlerts.length ? "warning" : "success",
      });
      if (!embedded) {
        onOpenChange(false);
      } else {
        form.reset({
          product_uuid: "",
          dose: "",
          route: "",
          frequency: "",
          duration: "",
          clinical_quantity: 1,
          clinical_uom: "",
          charge_quantity: 1,
          instructions: "",
          is_prn: false,
          clinical_notes: "",
        });
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
    <section className={cn("space-y-4", appFont.className)}>
      {embedded ? null : (
        <div>
          <h3 className="text-base font-semibold tracking-tight text-brand-navy">
            Add prescription
          </h3>
          <p className="mt-0.5 text-sm text-dash-muted">
            Enter the amount prescribed and the units to charge separately.
          </p>
        </div>
      )}

      <form className="space-y-4" onSubmit={onSubmit}>
          <InventoryProductPicker
            id="prescription-product"
            label="Medication"
            required
            product={product}
            onProductChange={handleProductChange}
            invalid={Boolean(form.formState.errors.product_uuid)}
          />
          {form.formState.errors.product_uuid ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.product_uuid.message}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prescription-dose">Dose</Label>
              <Input id="prescription-dose" {...form.register("dose")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prescription-route">Route</Label>
              <Input id="prescription-route" {...form.register("route")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prescription-frequency">Frequency</Label>
              <Input
                id="prescription-frequency"
                {...form.register("frequency")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prescription-duration">Duration</Label>
              <Input
                id="prescription-duration"
                {...form.register("duration")}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prescription-clinical-qty">
                Amount prescribed <RequiredFieldMarker />
              </Label>
              <Input
                id="prescription-clinical-qty"
                type="number"
                step="any"
                min="0"
                {...form.register("clinical_quantity")}
              />
              {form.formState.errors.clinical_quantity ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.clinical_quantity.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="prescription-uom">
                Unit <RequiredFieldMarker />
              </Label>
              <Input id="prescription-uom" {...form.register("clinical_uom")} />
              {form.formState.errors.clinical_uom ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.clinical_uom.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prescription-charge-qty">
              Units to charge <RequiredFieldMarker />
            </Label>
            <Input
              id="prescription-charge-qty"
              type="number"
              step="any"
              min="0"
              {...form.register("charge_quantity")}
            />
            {form.formState.errors.charge_quantity ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.charge_quantity.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="prescription-instructions">Instructions</Label>
            <Textarea
              id="prescription-instructions"
              rows={2}
              {...form.register("instructions")}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {embedded ? null : (
              <SecondaryButton
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={createPrescription.isPending}
              >
                Cancel
              </SecondaryButton>
            )}
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
                "Add prescription"
              )}
            </PrimaryButton>
          </div>
        </form>
    </section>
  );
}
