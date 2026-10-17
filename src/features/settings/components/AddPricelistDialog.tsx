"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { SetupSaveActions } from "@/components/ui/setup-save-actions";
import { useOnboardingReturn } from "@/features/overview/hooks/use-onboarding-return";
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
  onCreated: (
    pricelist: OrganizationPricelist,
    meta?: { addAnother: boolean },
  ) => void;
};

export function AddPricelistDialog({
  open,
  onOpenChange,
  onCreated,
}: AddPricelistDialogProps) {
  const { toast } = useToast();
  const { finishSetup } = useOnboardingReturn();
  const addAnotherRef = useRef(false);

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
    const addAnother = addAnotherRef.current;
    addAnotherRef.current = false;
    try {
      const pricelist = await createOrganizationPricelist(
        toCreateOrganizationPricelistPayload(values),
      );
      toast({
        variant: "success",
        title: "Pricelist added",
        description: `${pricelist.name} was created in ERP.`,
      });
      onCreated(pricelist, { addAnother });
      if (addAnother) {
        form.reset(createOrganizationPricelistDefaultValues);
        return;
      }
      form.reset(createOrganizationPricelistDefaultValues);
      onOpenChange(false);
      finishSetup();
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
          <DialogTitle>Add pricelist</DialogTitle>
          <DialogDescription>
            Create an ERP pricelist for cash billing or payer scheme tariffs.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="add-pricelist-form"
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
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
                      />
                    </FormControl>
                    <p className="text-xs text-brand-muted">
                      This name appears in ERP and when linking payer schemes.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 space-y-0">
                    <div>
                      <FormLabel className="font-medium text-brand-navy">
                        Active
                      </FormLabel>
                      <p className="text-xs text-brand-muted">
                        Available for cash visits and scheme linking. Inactive
                        pricelists cannot be used for new billing.
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
            </div>

            <DialogFooter className="mt-0 border-t border-brand-border px-6 py-4">
              <SetupSaveActions
                formId="add-pricelist-form"
                open={open}
                isSubmitting={isSubmitting}
                onCancel={() => onOpenChange(false)}
                onIntent={(addAnother) => {
                  addAnotherRef.current = addAnother;
                }}
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
