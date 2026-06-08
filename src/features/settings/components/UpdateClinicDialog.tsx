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
  updateOrganizationClinicSchema,
  type UpdateOrganizationClinicFormValues,
} from "@/features/settings/schemas/organization-clinic.schema";
import { updateOrganizationClinic } from "@/features/settings/services/settings.service";
import type { OrganizationClinic } from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type UpdateClinicDialogProps = {
  clinic: OrganizationClinic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (clinic: OrganizationClinic) => void;
};

export function UpdateClinicDialog({
  clinic,
  open,
  onOpenChange,
  onUpdated,
}: UpdateClinicDialogProps) {
  const { toast } = useToast();
  const form = useForm<UpdateOrganizationClinicFormValues>({
    resolver: zodResolver(updateOrganizationClinicSchema),
    defaultValues: { name: clinic.name },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: clinic.name });
    }
  }, [clinic, form, open]);

  async function handleSubmit(values: UpdateOrganizationClinicFormValues) {
    try {
      const updatedClinic = await updateOrganizationClinic(clinic.uuid, {
        name: values.name.trim(),
      });
      toast({
        variant: "success",
        title: "Clinic updated",
        description: `${updatedClinic.name} was saved successfully.`,
      });
      onUpdated(updatedClinic);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field === "name") {
            form.setError("name", { message });
          }
        }
        toast({
          variant: "error",
          title: "Could not update clinic",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update clinic",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-h-[90vh] overflow-y-auto sm:max-w-md", appFont.className)}
        data-testid="update-clinic-dialog"
      >
        <DialogHeader>
          <DialogTitle>Update clinic</DialogTitle>
          <DialogDescription>
            Change the display name for {clinic.code}.
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
