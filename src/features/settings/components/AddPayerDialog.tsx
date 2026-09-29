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
import { createOrganizationPayer } from "@/features/settings/services/settings.service";
import type { OrganizationPayer } from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AddPayerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (payer: OrganizationPayer) => void;
};

export function AddPayerDialog({
  open,
  onOpenChange,
  onCreated,
}: AddPayerDialogProps) {
  const { toast } = useToast();

  const form = useForm<CreateOrganizationPayerFormValues>({
    resolver: zodResolver(createOrganizationPayerSchema),
    defaultValues: createOrganizationPayerDefaultValues,
  });

  useEffect(() => {
    if (!open) {
      form.reset(createOrganizationPayerDefaultValues);
    }
  }, [form, open]);

  async function handleSubmit(values: CreateOrganizationPayerFormValues) {
    try {
      const payer = await createOrganizationPayer(
        toCreateOrganizationPayerPayload(values),
      );
      toast({
        variant: "success",
        title: "Payer added",
        description: `${payer.name} was created successfully.`,
      });
      form.reset(createOrganizationPayerDefaultValues);
      onCreated(payer);
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
          title: "Could not add payer",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not add payer",
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
        data-testid="add-payer-dialog"
      >
        <DialogHeader className="shrink-0 border-b border-brand-border px-6 py-5">
          <DialogTitle>Add payer</DialogTitle>
          <DialogDescription>
            Create an insurance company that can offer schemes to your patients.
            Optionally link it to the country payer registry.
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
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  "Add payer"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
