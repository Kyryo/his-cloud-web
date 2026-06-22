"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Receipt, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
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
  toUpdateOrganizationPricelistFormValues,
  toUpdateOrganizationPricelistPayload,
  updateOrganizationPricelistSchema,
  type UpdateOrganizationPricelistFormValues,
} from "@/features/settings/schemas/organization-pricelist.schema";
import {
  archiveOrganizationPricelist,
  setOrganizationDefaultPricelist,
  updateOrganizationPricelist,
} from "@/features/settings/services/settings.service";
import type { OrganizationPricelist } from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type UpdatePricelistDialogProps = {
  pricelist: OrganizationPricelist;
  isDefault: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (pricelist: OrganizationPricelist) => void;
  onArchived: (pricelistUuid: string) => void;
  onDefaultChanged: (defaultPricelistUuid: string | null) => void;
};

export function UpdatePricelistDialog({
  pricelist,
  isDefault,
  open,
  onOpenChange,
  onUpdated,
  onArchived,
  onDefaultChanged,
}: UpdatePricelistDialogProps) {
  const { toast } = useToast();
  const [isArchiving, setIsArchiving] = useState(false);
  const [isUpdatingDefault, setIsUpdatingDefault] = useState(false);

  const form = useForm<UpdateOrganizationPricelistFormValues>({
    resolver: zodResolver(updateOrganizationPricelistSchema),
    defaultValues: toUpdateOrganizationPricelistFormValues(pricelist),
  });

  useEffect(() => {
    if (open) {
      form.reset(toUpdateOrganizationPricelistFormValues(pricelist));
    }
  }, [form, open, pricelist]);

  async function handleSubmit(values: UpdateOrganizationPricelistFormValues) {
    try {
      const updatedPricelist = await updateOrganizationPricelist(
        pricelist.uuid,
        toUpdateOrganizationPricelistPayload(values),
      );
      toast({
        variant: "success",
        title: "Pricelist updated",
        description: `${updatedPricelist.name} was saved successfully.`,
      });
      onUpdated(updatedPricelist);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in toUpdateOrganizationPricelistFormValues(pricelist)) {
            form.setError(field as keyof UpdateOrganizationPricelistFormValues, {
              message,
            });
          }
        }
        toast({
          variant: "error",
          title: "Could not update pricelist",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update pricelist",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  async function handleSetDefault() {
    setIsUpdatingDefault(true);

    try {
      const response = await setOrganizationDefaultPricelist({
        default_pricelist_uuid: pricelist.uuid,
      });
      toast({
        variant: "success",
        title: "Default pricelist updated",
        description: `${pricelist.name} is now the organization default.`,
      });
      onDefaultChanged(response.default_pricelist_uuid);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not set default pricelist",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsUpdatingDefault(false);
    }
  }

  async function handleClearDefault() {
    setIsUpdatingDefault(true);

    try {
      const response = await setOrganizationDefaultPricelist({
        default_pricelist_uuid: null,
      });
      toast({
        variant: "success",
        title: "Default pricelist cleared",
        description: "No organization default pricelist is set.",
      });
      onDefaultChanged(response.default_pricelist_uuid);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not clear default pricelist",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsUpdatingDefault(false);
    }
  }

  async function handleArchive() {
    setIsArchiving(true);

    try {
      if (isDefault) {
        await setOrganizationDefaultPricelist({ default_pricelist_uuid: null });
        onDefaultChanged(null);
      }

      await archiveOrganizationPricelist(pricelist.uuid);
      toast({
        variant: "success",
        title: "Pricelist archived",
        description: `${pricelist.name} was deactivated in ERP.`,
      });
      onArchived(pricelist.uuid);
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not archive pricelist",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsArchiving(false);
    }
  }

  const isSubmitting = form.formState.isSubmitting;
  const isBusy = isSubmitting || isArchiving || isUpdatingDefault;
  const canSetDefault = pricelist.is_active && !isDefault;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
          appFont.className,
        )}
        data-testid="update-pricelist-dialog"
      >
        <DialogHeader className="border-b border-brand-border px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <Receipt className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle>Update pricelist</DialogTitle>
                {isDefault ? (
                  <Badge className="gap-1">
                    <Star className="size-3 fill-current" aria-hidden="true" />
                    Default
                  </Badge>
                ) : null}
              </div>
              <DialogDescription>
                Edit ERP pricelist details and billing defaults for your organization.
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
              <section className="rounded-xl border border-brand-border bg-slate-50/40 p-4">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-brand-muted">
                      ERP ID
                    </dt>
                    <dd className="mt-1 font-mono text-sm font-medium text-brand-navy">
                      {pricelist.uuid}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-brand-muted">
                      Currency
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-brand-navy">
                      {pricelist.currency_code}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="space-y-4 rounded-xl border border-brand-border bg-slate-50/40 p-4">
                <div>
                  <p className="text-sm font-medium text-brand-navy">Details</p>
                  <p className="text-xs text-brand-muted">
                    Update the display name used across billing workflows.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="off" className="bg-white" />
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
                    Archived pricelists are deactivated in ERP and linked schemes.
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
                          Reactivate an archived pricelist by enabling this option.
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

              <section className="space-y-3 rounded-xl border border-brand-border px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-brand-navy">
                      Organization default
                    </p>
                    <p className="text-xs text-brand-muted">
                      Used for cash billing when no scheme-specific pricelist applies.
                    </p>
                  </div>
                  {isDefault ? (
                    <Badge variant="outline" className="gap-1 shrink-0">
                      <Star className="size-3 fill-current text-amber-500" aria-hidden="true" />
                      Current default
                    </Badge>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {canSetDefault ? (
                    <SecondaryButton
                      type="button"
                      disabled={isBusy}
                      onClick={() => void handleSetDefault()}
                    >
                      {isUpdatingDefault ? (
                        <>
                          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Star className="size-4" aria-hidden="true" />
                          Set as default
                        </>
                      )}
                    </SecondaryButton>
                  ) : null}
                  {isDefault ? (
                    <SecondaryButton
                      type="button"
                      disabled={isBusy}
                      onClick={() => void handleClearDefault()}
                    >
                      Remove as default
                    </SecondaryButton>
                  ) : null}
                </div>
              </section>
            </div>

            <DialogFooter className="mt-0 flex-col gap-3 border-t border-brand-border px-6 py-4 sm:flex-row sm:justify-between">
              {pricelist.is_active ? (
                <DestructiveButton
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleArchive()}
                >
                  {isArchiving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Archiving...
                    </>
                  ) : (
                    "Archive pricelist"
                  )}
                </DestructiveButton>
              ) : (
                <span />
              )}
              <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
                <SecondaryButton
                  type="button"
                  disabled={isBusy}
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={isBusy}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </PrimaryButton>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
