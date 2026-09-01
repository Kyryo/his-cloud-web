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
  clientTagSchema,
  type ClientTagFormValues,
} from "@/features/settings/schemas/client-tag.schema";
import { updateTag } from "@/features/tags/services/tags.service";
import type { Tag } from "@/features/tags/types/tag.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const FORM_ID = "update-client-tag-form";

type UpdateClientTagDialogProps = {
  tag: Tag | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (tag: Tag) => void;
};

export function UpdateClientTagDialog({
  tag,
  open,
  onOpenChange,
  onUpdated,
}: UpdateClientTagDialogProps) {
  const { toast } = useToast();
  const form = useForm<ClientTagFormValues>({
    resolver: zodResolver(clientTagSchema),
    defaultValues: {
      name: "",
      color: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open && tag) {
      form.reset({
        name: tag.name,
        color: tag.color,
        description: tag.description,
      });
    }
  }, [form, open, tag]);

  async function handleSubmit(values: ClientTagFormValues) {
    if (!tag) {
      return;
    }

    try {
      const updatedTag = await updateTag(tag.uuid, {
        name: values.name.trim(),
        color: values.color?.trim() || "",
        description: values.description?.trim() || "",
      });
      toast({
        variant: "success",
        title: "Tag updated",
        description: `${updatedTag.name} was saved.`,
      });
      onUpdated(updatedTag);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          form.setError(field as keyof ClientTagFormValues, { message });
        }
        toast({
          variant: "error",
          title: "Could not update tag",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not update tag",
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
      title="Update client tag"
      description="Edit the tag name, color, or description."
      className={cn("sm:max-w-lg", appFont.className)}
      data-testid="update-client-tag-dialog"
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
                Saving...
              </>
            ) : (
              "Save changes"
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
            idPrefix="update-client-tag"
          />
        </form>
      </Form>
    </SectionedDialog>
  );
}
