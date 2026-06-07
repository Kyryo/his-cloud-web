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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createOrganizationPayerSchemeDefaultValues,
  createOrganizationPayerSchemeSchema,
  toCreateOrganizationPayerSchemePayload,
  type CreateOrganizationPayerSchemeFormValues,
} from "@/features/settings/schemas/organization-payer-scheme.schema";
import { createOrganizationPayerScheme } from "@/features/settings/services/settings.service";
import type {
  OrganizationPayer,
  OrganizationPayerScheme,
} from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AddPayerSchemeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payers: OrganizationPayer[];
  onCreated: (scheme: OrganizationPayerScheme) => void;
};

export function AddPayerSchemeDialog({
  open,
  onOpenChange,
  payers,
  onCreated,
}: AddPayerSchemeDialogProps) {
  const { toast } = useToast();

  const form = useForm<CreateOrganizationPayerSchemeFormValues>({
    resolver: zodResolver(createOrganizationPayerSchemeSchema),
    defaultValues: createOrganizationPayerSchemeDefaultValues,
  });

  useEffect(() => {
    if (!open) {
      form.reset(createOrganizationPayerSchemeDefaultValues);
      return;
    }

    if (payers.length === 1) {
      form.setValue("insurance_company", String(payers[0].id));
    }
  }, [form, open, payers]);

  async function handleSubmit(values: CreateOrganizationPayerSchemeFormValues) {
    try {
      const scheme = await createOrganizationPayerScheme(
        toCreateOrganizationPayerSchemePayload(values),
      );
      toast({
        variant: "success",
        title: "Payer scheme added",
        description: `${scheme.name} was created successfully.`,
      });
      form.reset(createOrganizationPayerSchemeDefaultValues);
      onCreated(scheme);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createOrganizationPayerSchemeDefaultValues) {
            form.setError(field as keyof CreateOrganizationPayerSchemeFormValues, {
              message,
            });
          }
        }
        toast({
          variant: "error",
          title: "Could not add payer scheme",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not add payer scheme",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-h-[90vh] overflow-y-auto sm:max-w-lg", appFont.className)}
        data-testid="add-payer-scheme-dialog"
      >
        <DialogHeader>
          <DialogTitle>Add payer scheme</DialogTitle>
          <DialogDescription>
            Create an insurance scheme under one of your payers.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="insurance_company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payer</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={payers.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            payers.length === 0
                              ? "Add a payer first"
                              : "Select a payer"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {payers.map((payer) => (
                        <SelectItem key={payer.uuid} value={String(payer.id)}>
                          {payer.name} ({payer.code})
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheme name</FormLabel>
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
            </div>

            <DialogFooter>
              <SecondaryButton
                type="button"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                disabled={isSubmitting || payers.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  "Add scheme"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
