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
  toUpdateOrganizationServiceFormValues,
  toUpdateOrganizationServicePayload,
  updateOrganizationServiceSchema,
  type UpdateOrganizationServiceFormValues,
} from "@/features/settings/schemas/organization-service.schema";
import { updateOrganizationService } from "@/features/settings/services/settings.service";
import type { OrganizationService } from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type UpdateServiceDialogProps = {
  service: OrganizationService;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (service: OrganizationService) => void;
};

export function UpdateServiceDialog({
  service,
  open,
  onOpenChange,
  onUpdated,
}: UpdateServiceDialogProps) {
  const { toast } = useToast();
  const form = useForm<UpdateOrganizationServiceFormValues>({
    resolver: zodResolver(updateOrganizationServiceSchema),
    defaultValues: toUpdateOrganizationServiceFormValues(service),
  });

  useEffect(() => {
    if (open) {
      form.reset(toUpdateOrganizationServiceFormValues(service));
    }
  }, [form, open, service]);

  async function handleSubmit(values: UpdateOrganizationServiceFormValues) {
    try {
      const updatedService = await updateOrganizationService(
        service.uuid,
        toUpdateOrganizationServicePayload(values),
      );
      toast({
        variant: "success",
        title: "Consultation service updated",
        description: `${updatedService.name} was saved successfully.`,
      });
      onUpdated(updatedService);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in toUpdateOrganizationServiceFormValues(service)) {
            form.setError(field as keyof UpdateOrganizationServiceFormValues, {
              message,
            });
          }
        }
        toast({
          variant: "error",
          title: "Could not update consultation service",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update consultation service",
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
        data-testid="update-service-dialog"
      >
        <DialogHeader>
          <DialogTitle>Update consultation service</DialogTitle>
          <DialogDescription>
            Edit this consultation service used when registering patient visits.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
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

            <div className="space-y-3 rounded-lg border border-brand-border px-4 py-3">
              <p className="text-sm font-medium text-brand-navy">Service type</p>
              {(
                [
                  ["is_consultation_visit", "Consultation"],
                  ["is_dentist_visit", "Dental"],
                  ["is_walk_in_visit", "Walk-in"],
                ] as const
              ).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="size-4 rounded border-brand-border"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">{label}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
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
