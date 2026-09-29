"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

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
  proposeCountryPayerDefaultValues,
  proposeCountryPayerSchema,
  type ProposeCountryPayerFormValues,
} from "@/features/settings/schemas/organization-payer.schema";
import { proposeCountryPayer } from "@/features/settings/services/settings.service";
import type { CountryPayer } from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type ProposeRegistryPayerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (payer: CountryPayer) => void;
};

export function ProposeRegistryPayerDialog({
  open,
  onOpenChange,
  onCreated,
}: ProposeRegistryPayerDialogProps) {
  const { toast } = useToast();

  const form = useForm<ProposeCountryPayerFormValues>({
    resolver: zodResolver(proposeCountryPayerSchema),
    defaultValues: proposeCountryPayerDefaultValues,
  });

  useEffect(() => {
    if (!open) {
      form.reset(proposeCountryPayerDefaultValues);
    }
  }, [form, open]);

  async function handleSubmit(values: ProposeCountryPayerFormValues) {
    try {
      const payer = await proposeCountryPayer({
        code: values.code.trim(),
        official_name: values.official_name.trim(),
        display_name: values.display_name?.trim() || values.official_name.trim(),
      });

      const pending = payer.status === "pending_approval";
      toast({
        variant: "success",
        title: pending ? "Payer submitted for approval" : "Registry payer added",
        description: pending
          ? `${payer.display_name} is pending platform approval before it can be linked.`
          : `${payer.display_name} is available to link.`,
      });
      form.reset(proposeCountryPayerDefaultValues);
      onCreated(payer);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in proposeCountryPayerDefaultValues) {
            form.setError(field as keyof ProposeCountryPayerFormValues, {
              message,
            });
          }
        }
        toast({
          variant: "error",
          title: "Could not request registry payer",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not request registry payer",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md",
          appFont.className,
        )}
        data-testid="propose-registry-payer-dialog"
      >
        <DialogHeader className="shrink-0 border-b border-brand-border px-6 py-5">
          <DialogTitle>Request new registry payer</DialogTitle>
          <DialogDescription>
            Propose a country-level payer. In some countries (for example Malawi)
            new payers require platform-admin approval before they can be linked.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <FormField
                control={form.control}
                name="official_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Official name</FormLabel>
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
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="off" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="off"
                          placeholder="Optional"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="mt-0 shrink-0 border-t border-brand-border px-6 py-4 sm:justify-end">
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
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
