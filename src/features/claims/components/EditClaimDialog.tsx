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
import { updateClaim } from "@/features/claims/services/claims.service";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const editClaimSchema = z.object({
  membership_number: z.string().trim().min(1, "Membership number is required"),
  practitioner_number: z.string().trim().optional(),
  service_provider_code: z.string().trim().optional(),
  height: z.string().trim().optional(),
  weight: z.string().trim().optional(),
  systolic_pressure: z.string().trim().optional(),
  diastolic_pressure: z.string().trim().optional(),
});

type EditClaimFormValues = z.infer<typeof editClaimSchema>;

type EditClaimDialogProps = {
  claim: ClaimDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

function toFormValues(claim: ClaimDetail): EditClaimFormValues {
  const vitals = claim.vitals ?? {};
  return {
    membership_number: claim.membership_number ?? "",
    practitioner_number: claim.practitioner_number ?? "",
    service_provider_code: claim.service_provider_code ?? "",
    height: vitals.height != null ? String(vitals.height) : "",
    weight: vitals.weight != null ? String(vitals.weight) : "",
    systolic_pressure:
      vitals.systolic_pressure != null ? String(vitals.systolic_pressure) : "",
    diastolic_pressure:
      vitals.diastolic_pressure != null ? String(vitals.diastolic_pressure) : "",
  };
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function EditClaimDialog({
  claim,
  open,
  onOpenChange,
  onSuccess,
}: EditClaimDialogProps) {
  const { toast } = useToast();
  const form = useForm<EditClaimFormValues>({
    resolver: zodResolver(editClaimSchema),
    defaultValues: toFormValues(claim),
  });

  useEffect(() => {
    if (open) {
      form.reset(toFormValues(claim));
    }
  }, [claim, form, open]);

  async function handleSubmit(values: EditClaimFormValues) {
    try {
      await updateClaim(claim.id, {
        membership_number: values.membership_number.trim(),
        practitioner_number: values.practitioner_number?.trim() || undefined,
        service_provider_code: values.service_provider_code?.trim() || undefined,
        vitals: {
          height: parseOptionalNumber(values.height),
          weight: parseOptionalNumber(values.weight),
          systolic_pressure: parseOptionalNumber(values.systolic_pressure),
          diastolic_pressure: parseOptionalNumber(values.diastolic_pressure),
        },
      });

      toast({
        variant: "success",
        title: "Claim updated",
        description: "Draft claim details were saved.",
      });
      await onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update claim",
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
        data-testid="edit-claim-dialog"
      >
        <DialogHeader>
          <DialogTitle>Edit draft claim</DialogTitle>
          <DialogDescription>
            Update membership, practitioner, and vitals before submitting to MASM.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="membership_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Membership number</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input {...field} inputMode="decimal" autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input {...field} inputMode="decimal" autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="systolic_pressure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Systolic pressure</FormLabel>
                    <FormControl>
                      <Input {...field} inputMode="numeric" autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="diastolic_pressure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diastolic pressure</FormLabel>
                    <FormControl>
                      <Input {...field} inputMode="numeric" autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <SecondaryButton
                type="button"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
