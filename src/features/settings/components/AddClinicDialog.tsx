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
  createOrganizationClinicDefaultValues,
  createOrganizationClinicSchema,
  type CreateOrganizationClinicFormValues,
} from "@/features/settings/schemas/organization-clinic.schema";
import { createOrganizationClinic } from "@/features/settings/services/settings.service";
import type { OrganizationClinic } from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AddClinicDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (clinic: OrganizationClinic) => void;
};

export function AddClinicDialog({
  open,
  onOpenChange,
  onCreated,
}: AddClinicDialogProps) {
  const { toast } = useToast();
  const form = useForm<CreateOrganizationClinicFormValues>({
    resolver: zodResolver(createOrganizationClinicSchema),
    defaultValues: createOrganizationClinicDefaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(createOrganizationClinicDefaultValues);
    }
  }, [form, open]);

  async function handleSubmit(values: CreateOrganizationClinicFormValues) {
    try {
      const clinic = await createOrganizationClinic({
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
      });
      toast({
        variant: "success",
        title: "Clinic created",
        description: `${clinic.name} was added successfully.`,
      });
      onCreated(clinic);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field === "name" || field === "code") {
            form.setError(field, { message });
          }
        }
        toast({
          variant: "error",
          title: "Could not create clinic",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not create clinic",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(appFont.className, "sm:max-w-md")}>
        <DialogHeader>
          <DialogTitle>Add clinic</DialogTitle>
          <DialogDescription>
            Create a clinic within your organization.
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
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      className="uppercase"
                      onChange={(event) =>
                        field.onChange(event.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <SecondaryButton
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create clinic"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
