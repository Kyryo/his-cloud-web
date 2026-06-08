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
  organizationGroupDefaultValues,
  organizationGroupSchema,
  toCreateOrganizationGroupPayload,
  type OrganizationGroupFormValues,
} from "@/features/settings/schemas/organization-group.schema";
import { createOrganizationGroup } from "@/features/settings/services/user-management.service";
import type { OrganizationGroup } from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AddGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (group: OrganizationGroup) => void;
};

export function AddGroupDialog({
  open,
  onOpenChange,
  onCreated,
}: AddGroupDialogProps) {
  const { toast } = useToast();
  const form = useForm<OrganizationGroupFormValues>({
    resolver: zodResolver(organizationGroupSchema),
    defaultValues: organizationGroupDefaultValues,
  });

  useEffect(() => {
    if (!open) {
      form.reset(organizationGroupDefaultValues);
    }
  }, [form, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const group = await createOrganizationGroup(
        toCreateOrganizationGroupPayload(values),
      );
      toast({
        variant: "success",
        title: "Group created",
        description: `${group.name} is ready for member assignments.`,
      });
      onCreated(group);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in organizationGroupDefaultValues) {
            form.setError(field as keyof OrganizationGroupFormValues, {
              message,
            });
          }
        }
        toast({
          variant: "error",
          title: "Could not create group",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not create group",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", appFont.className)}>
        <DialogHeader>
          <DialogTitle>Add group</DialogTitle>
          <DialogDescription>
            Create a permission group to organize access for your team.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group name</FormLabel>
                  <FormControl>
                    <Input placeholder="Billing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <SecondaryButton
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Creating...
                  </>
                ) : (
                  "Create group"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
