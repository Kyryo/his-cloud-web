"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { ClientTagFormFields } from "@/features/settings/components/ClientTagFormFields";
import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Form } from "@/components/ui/form";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import {
  clientTagDefaultValues,
  clientTagSchema,
  type ClientTagFormValues,
} from "@/features/settings/schemas/client-tag.schema";
import { TAG_TARGET_TYPES } from "@/features/tags/constants/tag-target-types";
import { createTag } from "@/features/tags/services/tags.service";
import type { Tag } from "@/features/tags/types/tag.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const FORM_ID = "add-client-tag-form";

type AddClientTagDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (tag: Tag) => void;
};

export function AddClientTagDialog({
  open,
  onOpenChange,
  onCreated,
}: AddClientTagDialogProps) {
  const { toast } = useToast();
  const form = useForm<ClientTagFormValues>({
    resolver: zodResolver(clientTagSchema),
    defaultValues: clientTagDefaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(clientTagDefaultValues);
    }
  }, [form, open]);

  async function handleSubmit(values: ClientTagFormValues) {
    try {
      const tag = await createTag({
        target_type: TAG_TARGET_TYPES.CUSTOMER,
        name: values.name.trim(),
        color: values.color?.trim() || "",
        description: values.description?.trim() || "",
      });
      toast({
        variant: "success",
        title: "Tag created",
        description: `${tag.name} was added to the catalog.`,
      });
      onCreated(tag);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in clientTagDefaultValues) {
            form.setError(field as keyof ClientTagFormValues, { message });
          }
        }
        toast({
          variant: "error",
          title: "Could not create tag",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not create tag",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add client tag"
      description="Create a tag that staff can assign to clients."
      className={cn("sm:max-w-lg", appFont.className)}
      data-testid="add-client-tag-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form={FORM_ID} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Creating...
              </>
            ) : (
              "Create tag"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form
          id={FORM_ID}
          className="space-y-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <ClientTagFormFields
            control={form.control}
            isSubmitting={isSubmitting}
            idPrefix="add-client-tag"
          />
        </form>
      </Form>
    </SectionedDialog>
  );
}
