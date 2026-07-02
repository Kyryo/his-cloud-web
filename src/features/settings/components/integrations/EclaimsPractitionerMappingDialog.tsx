"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
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
import { upsertEClaimPractitionerMapping } from "@/features/claims/services/claims.service";
import type { EClaimPractitionerMapping } from "@/features/claims/types/claims.types";
import type { InsuranceScheme } from "@/features/customers/types/customer-insurance.types";
import type { OrganizationClinic } from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { coerceToOptionalString } from "@/lib/coerce-string";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const practitionerMappingSchema = z.object({
  clinic: z.string().trim().min(1, "Select a clinic"),
  insurance_scheme: z.string().trim().min(1, "Select an insurance scheme"),
  practitioner_number: z.string().trim().min(1, "Practitioner number is required"),
  service_provider_code: z.string().trim().min(1, "Service provider code is required"),
});

type PractitionerMappingFormValues = z.infer<typeof practitionerMappingSchema>;

type EclaimsPractitionerMappingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinics: OrganizationClinic[];
  insuranceSchemes: InsuranceScheme[];
  isLoadingSchemes?: boolean;
  mapping?: EClaimPractitionerMapping | null;
  defaultClinicId?: number;
  onSaved: (mapping: EClaimPractitionerMapping) => void;
};

function toFormValues(
  mapping: EClaimPractitionerMapping | null | undefined,
  defaultClinicId?: number,
): PractitionerMappingFormValues {
  return {
    clinic:
      mapping?.clinic != null
        ? String(mapping.clinic)
        : defaultClinicId
          ? String(defaultClinicId)
          : "",
    insurance_scheme:
      mapping?.insurance_scheme != null ? String(mapping.insurance_scheme) : "",
    practitioner_number: mapping?.practitioner_number ?? "",
    service_provider_code: coerceToOptionalString(mapping?.service_provider_code),
  };
}

function formatClinicOption(clinic: OrganizationClinic): string {
  return `${clinic.name} · ${clinic.code}`;
}

function formatSchemeOption(scheme: InsuranceScheme): string {
  return `${scheme.name} · ${scheme.insurance_company_name}`;
}

export function EclaimsPractitionerMappingDialog({
  open,
  onOpenChange,
  clinics,
  insuranceSchemes,
  isLoadingSchemes = false,
  mapping,
  defaultClinicId,
  onSaved,
}: EclaimsPractitionerMappingDialogProps) {
  const { toast } = useToast();
  const isEditing = Boolean(mapping);

  const form = useForm<PractitionerMappingFormValues>({
    resolver: zodResolver(practitionerMappingSchema),
    defaultValues: toFormValues(mapping, defaultClinicId),
  });

  useEffect(() => {
    if (open) {
      form.reset(toFormValues(mapping, defaultClinicId));
    }
  }, [defaultClinicId, form, mapping, open]);

  async function handleSubmit(values: PractitionerMappingFormValues) {
    try {
      const saved = await upsertEClaimPractitionerMapping({
        clinic: Number(values.clinic),
        mapping_type: "scheme",
        insurance_scheme: Number(values.insurance_scheme),
        practitioner_number: values.practitioner_number.trim(),
        service_provider_code: values.service_provider_code.trim(),
        is_active: true,
      });

      toast({
        variant: "success",
        title: isEditing ? "Mapping updated" : "Mapping added",
        description: "Practitioner mapping was saved.",
      });
      onSaved(saved);
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not save mapping",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-h-[90vh] overflow-y-auto sm:max-w-lg", appFont.className)}
        data-testid="eclaims-practitioner-mapping-dialog"
      >
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit practitioner mapping" : "Add practitioner mapping"}
          </DialogTitle>
          <DialogDescription>
            Map a clinic and insurance scheme to MASM practitioner and service provider
            numbers.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="clinic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic</FormLabel>
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select clinic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clinics.map((clinic) => (
                        <SelectItem key={clinic.uuid} value={String(clinic.id)}>
                          {formatClinicOption(clinic)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="insurance_scheme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insurance scheme</FormLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    disabled={isLoadingSchemes}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingSchemes
                              ? "Loading schemes..."
                              : "Select insurance scheme"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {insuranceSchemes.map((scheme) => (
                        <SelectItem key={scheme.uuid} value={String(scheme.id)}>
                          {formatSchemeOption(scheme)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="practitioner_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Practitioner number</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_provider_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service provider code</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <SecondaryButton
                type="button"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={isSubmitting || isLoadingSchemes}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
