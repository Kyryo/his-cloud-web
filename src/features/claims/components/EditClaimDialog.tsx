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
});

type EditClaimFormValues = z.infer<typeof editClaimSchema>;

type EditClaimDialogProps = {
  claim: ClaimDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (claim: ClaimDetail) => void | Promise<void>;
};

function toFormValues(claim: ClaimDetail): EditClaimFormValues {
  return {
    membership_number: claim.membership_number ?? "",
    practitioner_number: claim.practitioner_number ?? "",
    service_provider_code: claim.service_provider_code ?? "",
  };
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
      const updated = await updateClaim(claim.id, {
        membership_number: values.membership_number.trim(),
        practitioner_number: values.practitioner_number?.trim() || undefined,
        service_provider_code: values.service_provider_code?.trim() || undefined,
      });

      toast({
        variant: "success",
        title: "Claim updated",
        description: "Draft claim details were saved.",
      });
      await onSuccess?.(updated);
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
        className={cn(
          "flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
          appFont.className,
        )}
        data-testid="edit-claim-dialog"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="border-b border-brand-border px-6 py-5">
            <DialogTitle>Edit draft claim</DialogTitle>
            <DialogDescription>
              Update membership and practitioner details before submitting to
              MASM.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
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
              </div>

              <DialogFooter className="mt-0 border-t border-brand-border px-6 py-5">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
