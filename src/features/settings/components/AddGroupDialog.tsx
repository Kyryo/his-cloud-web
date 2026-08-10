"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PORTAL_GROUP_OPTIONS } from "@/constants/portal-groups";
import {
  organizationGroupDefaultValues,
  organizationGroupSchema,
  toCreateOrganizationGroupPayload,
  type OrganizationGroupFormInput,
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
  existingGroupNames?: string[];
};

export function AddGroupDialog({
  open,
  onOpenChange,
  onCreated,
  existingGroupNames = [],
}: AddGroupDialogProps) {
  const { toast } = useToast();
  const form = useForm<
    OrganizationGroupFormInput,
    unknown,
    OrganizationGroupFormValues
  >({
    resolver: zodResolver(organizationGroupSchema),
    defaultValues: organizationGroupDefaultValues,
  });

  const availableOptions = useMemo(() => {
    const taken = new Set(existingGroupNames.map((name) => name.toLowerCase()));
    return PORTAL_GROUP_OPTIONS.filter(
      (option) => !taken.has(option.name.toLowerCase()),
    );
  }, [existingGroupNames]);

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
            form.setError(field as keyof OrganizationGroupFormInput, {
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
            Choose a portal permission group to make available for your team.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group</FormLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    disabled={
                      form.formState.isSubmitting || availableOptions.length === 0
                    }
                  >
                    <FormControl>
                      <SelectTrigger data-testid="add-group-select">
                        <SelectValue
                          placeholder={
                            availableOptions.length === 0
                              ? "All portal groups are already added"
                              : "Select a group"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-72">
                      {availableOptions.map((option) => (
                        <SelectItem key={option.name} value={option.name}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <PrimaryButton
                type="submit"
                disabled={
                  form.formState.isSubmitting || availableOptions.length === 0
                }
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Creating...
                  </>
                ) : (
                  "Add group"
                )}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
