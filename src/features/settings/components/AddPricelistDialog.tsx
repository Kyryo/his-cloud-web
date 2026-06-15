"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Receipt } from "lucide-react";
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
  createOrganizationPricelistDefaultValues,
  createOrganizationPricelistSchema,
  toCreateOrganizationPricelistPayload,
  type CreateOrganizationPricelistFormValues,
} from "@/features/settings/schemas/organization-pricelist.schema";
import { createOrganizationPricelist } from "@/features/settings/services/settings.service";
import type { OrganizationPricelist } from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AddPricelistDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (pricelist: OrganizationPricelist) => void;
};

export function AddPricelistDialog({
  open,
  onOpenChange,
  onCreated,
}: AddPricelistDialogProps) {
  const { toast } = useToast();

  const form = useForm<CreateOrganizationPricelistFormValues>({
    resolver: zodResolver(createOrganizationPricelistSchema),
    defaultValues: createOrganizationPricelistDefaultValues,
  });

  useEffect(() => {
    if (!open) {
      form.reset(createOrganizationPricelistDefaultValues);
    }
  }, [form, open]);

  async function handleSubmit(values: CreateOrganizationPricelistFormValues) {
    try {
      const pricelist = await createOrganizationPricelist(
        toCreateOrganizationPricelistPayload(values),
      );
      toast({
        variant: "success",
        title: "Pricelist added",
        description: `${pricelist.name} was created in ERP.`,
      });
      form.reset(createOrganizationPricelistDefaultValues);
      onCreated(pricelist);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createOrganizationPricelistDefaultValues) {
            form.setError(field as keyof CreateOrganizationPricelistFormValues, {
              message,
            });
          }
        }
        toast({
          variant: "error",
          title: "Could not add pricelist",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not add pricelist",
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
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
          appFont.className,
        )}
        data-testid="add-pricelist-dialog"
      >
        <DialogHeader className="border-b border-brand-border px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <Receipt className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <DialogTitle>Add pricelist</DialogTitle>
              <DialogDescription>
                Create an ERP pricelist for cash billing or payer scheme tariffs.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <section className="space-y-4 rounded-xl border border-brand-border bg-slate-50/40 p-4">
                <div>
                  <p className="text-sm font-medium text-brand-navy">Details</p>
                  <p className="text-xs text-brand-muted">
                    This name appears in ERP and when linking payer schemes.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="off"
                          placeholder="Cash Pricelist"
                          className="bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-3 rounded-xl border border-brand-border px-4 py-4">
                <div>
                  <p className="text-sm font-medium text-brand-navy">Availability</p>
                  <p className="text-xs text-brand-muted">
                    Inactive pricelists cannot be used for new billing.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-4 space-y-0 rounded-lg border border-brand-border bg-white px-4 py-3">
                      <div>
                        <FormLabel className="font-medium text-brand-navy">
                          Active
                        </FormLabel>
                        <p className="text-xs text-brand-muted">
                          Available for cash visits and scheme linking.
                        </p>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="size-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </section>
            </div>

            <DialogFooter className="mt-0 border-t border-brand-border px-6 py-4">
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
                  "Add pricelist"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
