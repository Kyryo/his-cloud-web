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
import { RegistryPayerPicker } from "@/features/settings/components/RegistryPayerPicker";
import {
  createOrganizationPayerDefaultValues,
  createOrganizationPayerSchema,
  toCreateOrganizationPayerPayload,
  type CreateOrganizationPayerFormValues,
} from "@/features/settings/schemas/organization-payer.schema";
import { updateOrganizationPayer } from "@/features/settings/services/settings.service";
import type { OrganizationPayer } from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type EditPayerDialogProps = {
  payer: OrganizationPayer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (payer: OrganizationPayer) => void;
};

function toFormValues(payer: OrganizationPayer): CreateOrganizationPayerFormValues {
  return {
    name: payer.name,
    code: payer.code,
    description: payer.description ?? "",
    email: payer.email ?? "",
    phone_number: payer.phone_number ?? "",
    address: payer.address ?? "",
    registry_payer: payer.registry_payer ?? null,
  };
}

export function EditPayerDialog({
  payer,
  open,
  onOpenChange,
  onUpdated,
}: EditPayerDialogProps) {
  const { toast } = useToast();

  const form = useForm<CreateOrganizationPayerFormValues>({
    resolver: zodResolver(createOrganizationPayerSchema),
    defaultValues: createOrganizationPayerDefaultValues,
  });

  useEffect(() => {
    if (open && payer) {
      form.reset(toFormValues(payer));
    }
  }, [form, open, payer]);

  async function handleSubmit(values: CreateOrganizationPayerFormValues) {
    if (!payer) {
      return;
    }

    try {
      const updated = await updateOrganizationPayer(payer.uuid, {
        ...toCreateOrganizationPayerPayload(values),
        is_active: payer.is_active,
      });
      toast({
        variant: "success",
        title: "Payer updated",
        description: `${updated.name} was saved.`,
      });
      onUpdated(updated);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createOrganizationPayerDefaultValues) {
            form.setError(field as keyof CreateOrganizationPayerFormValues, {
              message,
            });
          }
        }
        toast({
          variant: "error",
          title: "Could not update payer",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update payer",
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
        data-testid="edit-payer-dialog"
      >
        <DialogHeader className="shrink-0 border-b border-brand-border px-6 py-5">
          <DialogTitle>Edit payer</DialogTitle>
          <DialogDescription>
            Update the details for {payer?.name ?? "this payer"}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="off" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </div>

              <FormField
                control={form.control}
                name="registry_payer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link to registry payer (optional)</FormLabel>
                    <FormControl>
                      <RegistryPayerPicker
                        value={field.value ?? null}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} autoComplete="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} autoComplete="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="street-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-0 shrink-0 border-t border-brand-border px-6 py-4 sm:justify-end">
              <SecondaryButton
                type="button"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={isSubmitting || !payer}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  "Save payer"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
