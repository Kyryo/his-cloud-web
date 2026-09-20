"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  createLabSpecimenType,
  updateLabSpecimenType,
} from "@/features/laboratory/services/laboratory-catalog.service";
import {
  specimenTypeDefaultValues,
  specimenTypeSchema,
  type SpecimenTypeFormValues,
} from "@/features/laboratory/schemas/specimen-type.schema";
import type { LabSpecimenType } from "@/features/laboratory/types/laboratory-catalog.types";
import { toSpecimenTypePayload } from "@/features/laboratory/utils/catalog-payloads";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const ADD_FORM_ID = "add-lab-specimen-type-form";
const EDIT_FORM_ID = "edit-lab-specimen-type-form";

function toFormValues(item?: LabSpecimenType | null): SpecimenTypeFormValues {
  if (!item) return specimenTypeDefaultValues;
  return {
    code: item.code,
    name: item.name,
    container: item.container ?? "",
    volume: item.volume == null ? "" : String(item.volume),
    volume_unit: item.volume_unit ?? "",
    handling_notes: item.handling_notes ?? "",
  };
}

type AddSpecimenTypeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (item: LabSpecimenType) => void;
};

export function AddSpecimenTypeDialog({
  open,
  onOpenChange,
  onCreated,
}: AddSpecimenTypeDialogProps) {
  const { toast } = useToast();
  const form = useForm<SpecimenTypeFormValues>({
    resolver: zodResolver(specimenTypeSchema),
    defaultValues: specimenTypeDefaultValues,
  });

  useEffect(() => {
    if (open) form.reset(specimenTypeDefaultValues);
  }, [form, open]);

  async function handleSubmit(values: SpecimenTypeFormValues) {
    try {
      const item = await createLabSpecimenType(toSpecimenTypePayload(values));
      toast({
        variant: "success",
        title: "Specimen type created",
        description: `${item.name} was added to the catalog.`,
      });
      onCreated(item);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in specimenTypeDefaultValues) {
            form.setError(field as keyof SpecimenTypeFormValues, { message });
          }
        }
        toast({
          variant: "error",
          title: "Could not create specimen type",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }
      toast({
        variant: "error",
        title: "Could not create specimen type",
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
      title="Add specimen type"
      description="Define a specimen type used for collection and processing."
      className={cn("sm:max-w-lg", appFont.className)}
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form={ADD_FORM_ID} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form
          id={ADD_FORM_ID}
          className="space-y-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <SpecimenTypeFields control={form.control} isSubmitting={isSubmitting} />
        </form>
      </Form>
    </SectionedDialog>
  );
}

type EditSpecimenTypeDialogProps = {
  item: LabSpecimenType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (item: LabSpecimenType) => void;
};

export function EditSpecimenTypeDialog({
  item,
  open,
  onOpenChange,
  onUpdated,
}: EditSpecimenTypeDialogProps) {
  const { toast } = useToast();
  const form = useForm<SpecimenTypeFormValues>({
    resolver: zodResolver(specimenTypeSchema),
    defaultValues: specimenTypeDefaultValues,
  });

  useEffect(() => {
    if (open && item) form.reset(toFormValues(item));
  }, [form, item, open]);

  async function handleSubmit(values: SpecimenTypeFormValues) {
    if (!item) return;
    try {
      const updated = await updateLabSpecimenType(
        item.uuid,
        toSpecimenTypePayload(values),
      );
      toast({
        variant: "success",
        title: "Specimen type updated",
        description: `${updated.name} was saved.`,
      });
      onUpdated(updated);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof BffError) {
        toast({
          variant: "error",
          title: "Could not update specimen type",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }
      toast({
        variant: "error",
        title: "Could not update specimen type",
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
      title="Edit specimen type"
      description="Update specimen type details."
      className={cn("sm:max-w-lg", appFont.className)}
      footer={
        <>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form={EDIT_FORM_ID} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </PrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <form
          id={EDIT_FORM_ID}
          className="space-y-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <SpecimenTypeFields control={form.control} isSubmitting={isSubmitting} />
        </form>
      </Form>
    </SectionedDialog>
  );
}

function SpecimenTypeFields({
  control,
  isSubmitting,
}: {
  control: ReturnType<typeof useForm<SpecimenTypeFormValues>>["control"];
  isSubmitting: boolean;
}) {
  return (
    <>
      <FormField
        control={control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Code</FormLabel>
            <FormControl>
              <Input {...field} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="container"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Container</FormLabel>
            <FormControl>
              <Input {...field} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={control}
          name="volume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Volume</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="volume_unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="handling_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Handling notes</FormLabel>
            <FormControl>
              <Textarea {...field} rows={3} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
